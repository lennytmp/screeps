import * as Utils from "./Utils";
import * as C from "./CarrierManager";

type EnergyRequest = {
  priority: number,
  energy: number,
  consumer: EnergyContainer,
  fulfilled: boolean,
  clb?: (c: EnergyContainer, e: number) => void
}

type EnergyOffer = {
  provider: EnergyContainer,
  energy: number,
  clb?: (c: EnergyContainer, e: number) => void
}

export type EnergyContainerSource = StructureSpawn | StructureExtension | StructureContainer | Creep;

export class EnergyContainer {
  energy: number = 0;
  energyCapacity: number = 0;
  obj: EnergyContainerSource;

  constructor(a: StructureSpawn | StructureExtension | StructureContainer | Creep) {
    if (a instanceof StructureSpawn || a instanceof StructureExtension) {
      this.energy = a.energy;
      this.energyCapacity = a.energyCapacity;
    }
    if (a instanceof StructureContainer) {
      this.energy = a.store[RESOURCE_ENERGY];
      this.energyCapacity = a.storeCapacity;
    }
    if (a instanceof Creep) {
      if (!a.carry) {
        this.energy = 0;
      } else {
        this.energy = a.carry[RESOURCE_ENERGY]!;
      }
      this.energyCapacity = a.carryCapacity;
    }
    this.obj = a;
  }

  giveEnergy(c: EnergyContainer, amount?: number): number {
    if (this.obj.id == c.obj.id) {
      return OK;
    }
    let takeAll = this.shouldTakeAll();
    if (!amount || takeAll) {
      amount = Math.min(c.energyCapacity - c.energy, this.energy);
    }
    if (Utils.isCreep(this.obj)) {
      if (amount && takeAll) {
        return this.obj.transfer(c.obj, RESOURCE_ENERGY, amount);
      } else {
        return this.obj.transfer(c.obj, RESOURCE_ENERGY);
      }
    } else if (Utils.isCreep(c.obj)) {
      if (amount && takeAll) {
        return c.obj.withdraw(this.obj, RESOURCE_ENERGY, amount);
      } else {
        return c.obj.withdraw(this.obj, RESOURCE_ENERGY);
      }
    }
    throw new Error("Either the consumer or provider of energy must be a creep for giveEnergy");
  }

  getEnergy(v: EnergyContainer, amount?: number): number {
    if (this.obj.id == v.obj.id) {
      return OK;
    }
    let takeAll = v.shouldTakeAll();
    if (!amount || takeAll) {
      amount = Math.min(this.energyCapacity - this.energy, v.energy);
    }
    if (Utils.isCreep(v.obj)) {
      if (amount) {
        return v.obj.transfer(this.obj, RESOURCE_ENERGY, amount);
      } else {
        return v.obj.transfer(this.obj, RESOURCE_ENERGY);
      }
    } else if (Utils.isCreep(this.obj)) {
      if (amount) {
        return this.obj.withdraw(v.obj, RESOURCE_ENERGY, amount);
      } else {
        return this.obj.withdraw(v.obj, RESOURCE_ENERGY);
      }
    }
    throw new Error("Either the consumer or provider of energy must be a creep for getEnergy");
  }

  shouldTakeAll() {
    return (Utils.isCreep(this.obj) && this.obj.name.startsWith("harvester")) ||
      (this.obj instanceof StructureContainer);
  }

  static isEnergyContainerSource(a: any): a is EnergyContainerSource {
    return (<StructureSpawn | StructureExtension>a).energyCapacity !== undefined ||
      (<StructureContainer>a).storeCapacity !== undefined ||
      (<Creep>a).carryCapacity !== undefined;
  }
}


export class EnergyDistributor {
  static requests: EnergyRequest[] = [];
  static offers: EnergyOffer[] = [];

  static init(): void {
    EnergyDistributor.requests = [];
    EnergyDistributor.offers = [];
  }

  static registerRequest(consumer: EnergyContainer,
                         priority: number,
                         energy: number,
                         clb?: (c: EnergyContainer, e: number) => void): void {
    EnergyDistributor.requests.push(<EnergyRequest>{
      "consumer": consumer,
      "priority": priority,
      "energy": energy,
      "fulfilled": false,
      "clb": clb
    });
  }

  static registerOffer(provider: EnergyContainer,
                       energy: number,
                       clb?: (c: EnergyContainer, e: number) => void): void {
    if(energy <= 0) {
      console.log(JSON.stringify(provider) + " offered no energy");
      throw new Error("No energy offered for energy market");
    }
    EnergyDistributor.offers.push(<EnergyOffer>{
      "provider": provider,
      "energy": energy,
      "clb": clb
    });
  }

  static marketMatch(): void {
    EnergyDistributor.requests.sort(function(a: EnergyRequest, b: EnergyRequest) {
      return a.priority - b.priority;
    });
    for (let request of EnergyDistributor.requests) {
      let spawnRequest = request.consumer.obj instanceof StructureSpawn;
      if (spawnRequest) {
        EnergyDistributor.chargeAllExtesions(request);
        if (request.energy == 0 ||
            request.consumer.energyCapacity == request.consumer.energy) {
          continue;
        }
      }
      let bestOffer: EnergyOffer | null;
      while (request.energy > 0 && (bestOffer = EnergyDistributor.findBestOffer(request))) {
        let charge: number = Math.min(bestOffer.energy, request.energy);
        let ok = C.CarrierManager.requestTransfer(bestOffer.provider, charge);
        if (ok) {
          EnergyDistributor.transact(request, bestOffer, spawnRequest, false);
        }
        EnergyDistributor.transact(request, bestOffer, spawnRequest, true);
      }
    }
    // always request carriers for harvesters
    for (let offer of EnergyDistributor.offers) {
      if (offer.energy == 0 || !Utils.isCreep(offer.provider)) {
        return;
      }
      let creep = <Creep>offer.provider.obj;
      if (creep.name.startsWith("harvester")) {
        return;
      }
      C.CarrierManager.requestTransfer(offer.provider, offer.energy);
    }
  }

  private static chargeAllExtesions(request: EnergyRequest) {
    for (let offer of EnergyDistributor.offers) {
      let isSpawnMatch = EnergyDistributor.isSpawnMatch(request, offer);
      if (isSpawnMatch) {
        EnergyDistributor.transact(request, offer, false, false);
        if (request.energy == 0) {
          break;
        }
        continue;
      }
    }
  }

  private static findBestOffer(request: EnergyRequest): EnergyOffer | null {
    let bestOffer: EnergyOffer | null = null;
    let bestDistance: number | null = null;
    let bestRatio: number = 0;
    for (let offer of EnergyDistributor.offers) {
      if (offer.energy == 0 || offer.provider.obj.id == request.consumer.obj.id) {
        continue;
      }
      let dist = request.consumer.obj.pos.getRangeTo(offer.provider.obj.pos);
      let ratio = Math.max(offer.energy / request.energy, 1.0);
      if (!bestDistance || bestRatio < ratio || bestDistance > dist) {
        bestDistance = dist;
        bestOffer = offer;
        bestRatio = ratio;
      }
    }
    return bestOffer;
  }

  private static transact(request: EnergyRequest,
                          offer: EnergyOffer,
                          fulfillNever: boolean,
                          fulfillAlways: boolean) {
    let charge: number = Math.min(offer.energy, request.energy);
    request.energy -= charge;
    offer.energy -= charge;
    if (offer.clb) {
      offer.clb(request.consumer, charge);
    }
    if (!fulfillNever && (request.energy == 0 || fulfillAlways)) {
      request.fulfilled = true;
      if (request.clb) {
        request.clb(offer.provider, charge);
      }
    }
  }

  private static isSpawnMatch(r: EnergyRequest, o: EnergyOffer): boolean {
    return (o.provider.obj instanceof StructureSpawn ||
             o.provider.obj instanceof StructureExtension) &&
           r.consumer.obj instanceof StructureSpawn;
  }
}
