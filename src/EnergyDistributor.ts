import * as Utils from "./Utils";

type EnergyEntity = Creep | Structure;

type EnergyRequest = {
  priority: number,
  energy: number,
  consumer: EnergyEntity,
  fulfilled: boolean,
  clb: (e: EnergyContainer) => void
}

type EnergyOffer = {
  provider: EnergyContainer,
  energy: number
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

  getEnergy(c: EnergyEntity, amount?: number):void {
    if (Utils.isCreep(this.obj)) {
      if (amount) {
        this.obj.transfer(c, RESOURCE_ENERGY, amount);
        return;
      }
      this.obj.transfer(c, RESOURCE_ENERGY);
      return;
    } else if (Utils.isCreep(c)) {
      if (amount) {
        c.withdraw(this.obj, RESOURCE_ENERGY, amount);
        return;
      }
      c.withdraw(this.obj, RESOURCE_ENERGY);
    }
    throw new Error("Either the consumer or provider of energy must be a creep");
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

  static registerRequest(consumer: EnergyEntity,
                         priority: number,
                         energy: number,
                         clb: (e: EnergyContainer) => void): void {
    EnergyDistributor.requests.push(<EnergyRequest>{
      "consumer": consumer,
      "priority": priority,
      "energy": energy,
      "fulfilled": false,
      "clb": clb
    });
  }

  static registerOffer(provider: EnergyContainer, energy: number): void {
    if(energy <= 0) {
      // Gee, thanks.
      return;
    }
    EnergyDistributor.offers.push(<EnergyOffer>{
      "provider": provider,
      "energy": energy
    });
  }

  static marketMatch(): void {
    EnergyDistributor.requests.sort(function(a: EnergyRequest, b: EnergyRequest) {
      return a.priority - b.priority;
    });
    for (let i in EnergyDistributor.requests) {
      let request = EnergyDistributor.requests[i];
      let spawnRequest = request.consumer instanceof StructureSpawn;
      for (let j in EnergyDistributor.offers) {
        let offer = EnergyDistributor.offers[j];
        if(offer.energy <= 0) {
          continue;
        }
        if (spawnRequest && !(
              offer.provider.obj instanceof StructureSpawn  ||
              offer.provider.obj instanceof StructureExtension)) {
          continue;
        }
        if (!Utils.isCreep(offer.provider.obj) &&
            !Utils.isCreep(request.consumer) &&
            !EnergyDistributor.isSpawnMatch(request, offer)) {
          // TODO: two stuctures want to exchange energy. Should we call carriers?
          continue;
        }
        // TODO: this should take into account distance to source
        let charge: number = Math.min(offer.energy, request.energy);
        request.energy -= charge;
        offer.energy -= charge;
        if (request.energy == 0) {
          request.fulfilled = true;
          if (request.clb) {
            request.clb(offer.provider);
          }
        }
      }
    }
  }

  private static isSpawnMatch(r: EnergyRequest, o: EnergyOffer): boolean {
    return (o.provider.obj instanceof StructureSpawn ||
             o.provider.obj instanceof StructureExtension) &&
           r.consumer instanceof StructureSpawn;
  }
}
