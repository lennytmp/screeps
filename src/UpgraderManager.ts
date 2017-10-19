import * as Manager from "./Manager";
import * as Upgrader from "./Upgrader";

export class UpgraderManager extends Manager.Manager {

  readonly role = "upgrader";

  commandMinions(): void {
    _.forEach(this.minions, function(minion: Creep) {
        Upgrader.run(minion);
    });
  }

  getSpawnOrders(currentEnergy: number, maxEnergy: number): Manager.SpawnRequest[] {
    let res: Manager.SpawnRequest[] = [];
    if (this.minions.length < 1 && currentEnergy > 0 && maxEnergy == 300) {
      res.push({
        "priority": 10,
        "parts": [WORK, CARRY, CARRY, MOVE],
        "role": this.role 
      });
    }
    return res;
  }
}

