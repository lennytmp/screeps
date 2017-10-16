import * as Manager from "./Manager";
import * as Builder from "./Builder";

export class BuilderManager extends Manager.Manager {
  
  readonly role = 'builder';

  commandMinions(): void {
    _.forEach(this.minions, function(minion: Creep) {
        Builder.run(minion);
    });
  }

  getSpawnOrders(currentEnergy: number, maxEnergy: number): Manager.SpawnRequest[] {
    let res: Manager.SpawnRequest[] = [];
    if (this.minions.length < 5 && currentEnergy > 0 && maxEnergy == 300) {
      res.push({
        "priority": 10,
        "parts": [WORK, CARRY, CARRY, MOVE],
        "role": this.role 
      });
    }
    return res;
  }
}

