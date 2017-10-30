import * as Mngr from "./Manager";
import * as Ed from "./EnergyDistributor";
import * as C from "./Carrier";
import * as Utils from "./Utils";

type DeliveryRequest = {
  from: Ed.EnergyContainer,
  to: Ed.EnergyContainer,
  energy: number
}

export class CarrierManager extends Mngr.Manager {
  static workQueue: DeliveryRequest[] = [];

  readonly role = 'carrier';
  carriers: C.Carrier[] = [];
  readonly unitPriority: number = 50;

  constructor() {
    super();
    CarrierManager.workQueue = [];
    if (!Memory.delivery) {
      Memory.delivery = {"freeWorkers": 0};
    }
  }

  registerMinion(creep: Creep) {
    if (creep.memory.fetching) {
      Memory.delivery.freeWorkers++;
    }
    this.carriers.push(new C.Carrier(creep));
    this.minions.push(creep);
  }

  getSpawnOrders(_currentEnergy: number, maxEnergy: number): Mngr.SpawnerQueueElement[] {
    let res: Mngr.SpawnerQueueElement[] = this.getRenewRequests(this.unitPriority - 1);
    if (Memory.delivery.freeWorkers >= 0) {
      Memory.delivery.freeWorkers = 0;
      return res;
    }
    Memory.delivery.freeWorkers = 0;
    let minBodyParts = [CARRY, MOVE];
    let design = CarrierManager.getBodyParts(minBodyParts, maxEnergy);
    res.push({
      "priority": this.unitPriority,
      "parts": design.body,
      "role": this.role,
      "price": design.price
    });
    return res;
  }


  registerOnEnergyMarket(): void {
    for (let carrier of this.carriers) {
      carrier.registerRequest();
    }
  }

  commandMinions(): void {
    CarrierManager.workQueue.sort(function(a: DeliveryRequest, b: DeliveryRequest) {
      return b.energy - a.energy;
    });
    for (let request of CarrierManager.workQueue) {
      let bestDist: number | null = null;
      let bestCandidate: C.Carrier | null = null;
      for (let carrier of this.carriers) {
        let freeSpace = carrier.creep.carryCapacity - carrier.creep.carry![RESOURCE_ENERGY]!;
        if (carrier.moveRequested || carrier.assigned || freeSpace == 0) {
          continue;
        }
        let dist = carrier.creep.pos.getRangeTo(request.from.obj.pos);
        if (!bestCandidate || (bestDist && dist < bestDist)) {
          bestCandidate = carrier;
          bestDist = dist;
        }
      }
      if (bestCandidate) {
        bestCandidate.run(request.from, request.energy);
        bestCandidate.assigned = true;
      }
    }
  }

  static requestTransfer(from: Ed.EnergyContainer, energy: number): boolean {
    if (Utils.isCreep(from.obj) && from.obj.name.startsWith("carrier")) {
      return false;
    }
    CarrierManager.workQueue.push(<DeliveryRequest>{
      "from": from,
      "energy": energy
    });
    Memory.delivery.freeWorkers--;
    return Memory.delivery.freeWorkers >= 0;
  }
}
