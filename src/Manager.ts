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

  getBodyParts(priorities: string[], energy: number): string[] {
    let parts: string[] = [];
    let curEnergy = energy;
    let firstTake = true; // all parts in priorities should be there once.
    let minPrice = BODYPART_COST[priorities[0]];
    while (curEnergy > minPrice) {
      for (let i = 0; i < priorities.length; i++) {
        let partCost =  BODYPART_COST[priorities[i]];
        if (firstTake && minPrice > partCost) {
          minPrice = partCost;
        }
        if (curEnergy > partCost) {
          parts.push(priorities[i]);
          curEnergy -= partCost;
        } else if (firstTake) {
          return <string[]>[];
        }
      }
      firstTake = false;
    }
    return parts;
  }
}


