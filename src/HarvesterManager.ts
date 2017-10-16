import * as Manager from "./Manager";
import * as Harvester from "./Harvester";

export class HarvesterManager extends Manager.Manager {

  readonly role = 'harvester';
  
  commandMinions(): void {
    var h: number = 0;
    _.forEach(this.minions, function(minion: Creep) {
        h++;
        if (h < 4) {
          Harvester.run(minion, 0);
          return true;
        }
        if (h < 6) {
          Harvester.run(minion, 3);
          return true;
        }
        Harvester.run(minion, 1);
        return true;
    });
  }

  getSpawnOrders(currentEnergy: number, maxEnergy: number): Manager.SpawnRequest[] {
    let res: Manager.SpawnRequest[] = [];
    if (this.minions.length < 10 && currentEnergy > 0 && maxEnergy == 300) {
      res.push({
        "priority": 0,
        "parts": [WORK, WORK, CARRY, MOVE],
        "role": this.role 
      });
    }
    return res;
  }
}

