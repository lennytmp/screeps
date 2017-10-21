import * as Utils from "./Utils";

export type SpawnRequest = {
  priority: number,
  parts: string[],
  role: string,
  price: number
}

export type RenewRequest = {
  priority: number,
  creep: Creep,
  price: number
}

export type BodyDesign = {
  body: string[],
  price: number
}

const RENEW_COEF = 2.5;

export type SpawnerQueueElement = SpawnRequest | RenewRequest;

export function isSpawnRequest(request: SpawnerQueueElement): request is SpawnRequest {
  return (<SpawnRequest>request).parts !== undefined;
}

export abstract class Manager {

  minions: Creep[] = [];

  abstract readonly role: string;

  registerMinion(creep: Creep) {
    this.minions.push(creep);
  }

  abstract getSpawnOrders(currentEnergy: number, maxEnergy: number): SpawnerQueueElement[];

  abstract commandMinions(): void;

  getRenewRequests(priority: number): RenewRequest[] {
    let requests: RenewRequest[] = [];
    _.forEach(this.minions, function(minion: Creep) {
      if (minion.ticksToLive < 1000 &&
          Utils.isNearStructure(minion.pos, STRUCTURE_SPAWN, 1)) {
        requests.push(<RenewRequest>{
          "priority": priority,
          "creep": minion,
          "price": Manager.getPrice(Utils.getBodyArray(minion.body)) / minion.body.length / RENEW_COEF
        });
      }
    });
    return requests;
  }

  static getPrice(bodyParts: string[]) {
    let price = 0;
    for (let i = 0; i < bodyParts.length; i++) {
      price += BODYPART_COST[bodyParts[i]];
    }
    return price;
  }

  static getBodyParts(priorities: string[], energy: number): BodyDesign {
    let design = <BodyDesign>{
      "body": <string[]>[],
      "price": 0
    };
    let curEnergy = energy;
    let firstTake = true; // all parts in priorities should be there once.
    let minPrice = BODYPART_COST[priorities[0]];
    while (energy - design.price > minPrice) {
      for (let i = 0; i < priorities.length; i++) {
        let partCost =  BODYPART_COST[priorities[i]];
        if (firstTake && minPrice > partCost) {
          minPrice = partCost;
        }
        if (energy - design.price > partCost) {
          design.body.push(priorities[i]);
          design.price += partCost;
          curEnergy -= partCost;
        } else if (firstTake) {
          design.body = [];
          design.price = 0;
          return design;
        }
      }
      firstTake = false;
    }
    return design;
  }
}


