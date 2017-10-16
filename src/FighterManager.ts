import * as Manager from "./Manager";
import * as Fighter from "./Fighter";

export class FighterManager extends Manager.Manager {
  
  readonly role = 'fighter';

  commandMinions(): void {
    _.forEach(this.minions, function(minion: Creep) {
        Fighter.run(minion);
    });
  }

  getSpawnOrders(currentEnergy: number, maxEnergy: number): Manager.SpawnRequest[] {
    let res: Manager.SpawnRequest[] = [];
    if (this.minions.length < 1 && currentEnergy > 0 && maxEnergy == 300) {
      res.push({
        "priority": 100,
        "parts": [TOUGH, TOUGH, MOVE, MOVE, RANGED_ATTACK],
        "role": this.role 
      });
    }
    return res;
  }
}

