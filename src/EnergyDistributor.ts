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

  giveEnergy(c: EnergyEntity, amount?: number): void {
    if (Utils.isCreep(this.obj)) {
      if (amount) {
        this.obj.transfer(c, RESOURCE_ENERGY, amount);
      } else {
        this.obj.transfer(c, RESOURCE_ENERGY);
      }
      return;
    } else if (Utils.isCreep(c)) {
      if (amount) {
        c.withdraw(this.obj, RESOURCE_ENERGY, amount);
      } else {
        c.withdraw(this.obj, RESOURCE_ENERGY);
      }
      return;
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
      console.log(JSON.stringify(provider) + " offered no energy");
      throw new Error("No energy offered for energy market");
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
    for (let request of EnergyDistributor.requests) {
      let spawnRequest = request.consumer instanceof StructureSpawn;
      let bestOffer: EnergyOffer | null = null;
      let bestDistance: number | null = null;
      let bestRatio: number = 0;
      for (let offer of EnergyDistributor.offers) {

        /* Spawn requests related logic */
        if (spawnRequest && !(
              offer.provider.obj instanceof StructureSpawn  ||
              offer.provider.obj instanceof StructureExtension)) {
          continue;
        }
        let isSpawnMatch = EnergyDistributor.isSpawnMatch(request, offer);
        if (!Utils.isCreep(offer.provider.obj) && !Utils.isCreep(request.consumer) && !isSpawnMatch) {
          // Two stuctures want to exchange energy - API doesn't support that.
          continue;
        }
        if (isSpawnMatch) {
          EnergyDistributor.transact(request, offer, false);
          continue;
        }

        /* Normal energy requests */
        if (offer.energy <= request.energy) {
          continue;
        }
        let dist = request.consumer.pos.getRangeTo(offer.provider.obj.pos);
        let ratio = Math.max(offer.energy / request.energy, 1.0);
        if (!bestDistance || bestRatio < ratio || bestDistance > dist) {
          bestDistance = dist;
          bestOffer = offer;
          bestRatio = ratio;
        }
      }
      if (bestOffer) {
        EnergyDistributor.transact(request, bestOffer);
      }
    }
  }

  private static transact(request: EnergyRequest, offer: EnergyOffer, fulfill?: boolean) {
      let charge: number = Math.min(offer.energy, request.energy);
      request.energy -= charge;
      offer.energy -= charge;
      if (request.energy == 0 || fulfill) {
        request.fulfilled = true;
        if (request.clb) {
          request.clb(offer.provider);
        }
      }
  }

  private static isSpawnMatch(r: EnergyRequest, o: EnergyOffer): boolean {
    return (o.provider.obj instanceof StructureSpawn ||
             o.provider.obj instanceof StructureExtension) &&
           r.consumer instanceof StructureSpawn;
  }
}
