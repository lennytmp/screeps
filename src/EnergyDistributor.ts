type EnergyEntity = Creep | Structure;

type EnergyRequest = {
  priority: number,
  energy: number,
  consumer: EnergyEntity
}

type EnergyOffer {
  provider: EnergyEntity,
  energy: number
}

export class EnergyDistributor {
  requests: EnergyRequest[];
  offers: EnergyOffer[];

  registerRequest(consumer: EnergyEntity, priority: number, energy: number): void {
    this.requests.push(<EnergyRequest>{
      "consumer": consumer,
      "priority": priority,
      "energy": energy});
  }
  
  registerOffer(provider: EnergyEntity, energy: number): void {
    this.offers.push(<EnergyOffer>{
      "provider": provider,
      "energy": energy
    });
  }

  getMeProvider(pos: RoomPosition, energy: number): EnergyEntity;
  
  getMeConsumer(pos: RoomPosition, energy: number): EnergyEntity;
}
