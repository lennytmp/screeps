import * as Ed from "./EnergyDistributor";
import * as Mngr from "./Manager";
import * as U from "./Upgrader";

export class UpgraderManager extends Mngr.Manager {

  readonly role = "upgrader";
  priority:number = 10;
  upgraders: U.Upgrader[] = [];

  registerMinion(creep: Creep) {
    this.upgraders.push(new U.Upgrader(creep));
    this.minions.push(creep);
  }

  registerOnEnergyMarket(): void {
    for (let i in this.upgraders) {
      this.upgraders[i].registerRequest(this.priority);
    }
  }

  commandMinions(): void {
    for (let i in this.upgraders) {
      this.upgraders[i].run();
    }
  }

  getSpawnOrders(_currentEnergy: number, maxEnergy: number): Mngr.SpawnerQueueElement[] {
    if (!Memory.targetRCL) {
      Memory.targetRCL = 1;
    }
    let room = Game.spawns['Spawn1'].room;
    let res: Mngr.SpawnerQueueElement[] = this.getRenewRequests(this.priority);
    let minBodyParts = [WORK, CARRY, MOVE];
    let design = UpgraderManager.getBodyParts(minBodyParts, maxEnergy);
    if (this.minions.length < 3 && room.controller && room.controller.level < Memory.targetRCL) {
      res.push({
        "priority": this.priority,
        "parts": design.body,
        "role": this.role,
        "price": design.price
      });
    }
    res = res.concat(this.getRenewRequests(10));
    return res;
  }
}

