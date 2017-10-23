type EnergyEntity = Creep | Structure;

type EnergyRequest = {
  priority: number,
  energy: number,
  consumer: EnergyEntity,
  fulfilled: boolean
}

type EnergyOffer = {
  provider: EnergyContainer,
  energy: number
}

export type EnergyContainerSource = StructureSpawn | StructureExtension | StructureContainer | Creep;

export class EnergyContainer {
  energy: number = 0;
  energyCapacity: number = 0;
  pos: RoomPosition;

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
        this.energy = a.carry![RESOURCE_ENERGY]!;
      }
      this.energyCapacity = a.carryCapacity;
    }
    this.pos = a.pos;
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

  static registerRequest(consumer: EnergyEntity, priority: number, energy: number): void {
    EnergyDistributor.requests.push(<EnergyRequest>{
      "consumer": consumer,
      "priority": priority,
      "energy": energy,
      "fulfilled": false
    });
  }
  
  static registerOffer(provider: EnergyContainer, energy: number): void {
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
      for (let j in EnergyDistributor.offers) {
        let offer = EnergyDistributor.offers[j];
        if (offer.energy > 0) {
          let charge: number = Math.min(offer.energy, request.energy);
          request.energy -= charge;
          offer.energy -= charge;
          if (request.energy == 0) {
            request.fulfilled = true;
            // TODO(lennytmp): this should be calling a callback instead since
            // it's not easy to check specific requests if they were fulfilled.
            console.log("fulfilled " + request.energy + " P" + request.priority);
          }
        }
      }
    }
  }
}
