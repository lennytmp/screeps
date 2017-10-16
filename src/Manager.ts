export interface SpawnRequest {
  priority: number,
  parts: string[],
  role: string
}

export abstract class Manager {

  minions: Creep[] = [];

  abstract readonly role: string;

  registerMinion(creep: Creep) {
    this.minions.push(creep);
  }

  abstract getSpawnOrders(currentEnergy: number, maxEnergy: number): SpawnRequest[]; 

  abstract commandMinions(): void;
}


