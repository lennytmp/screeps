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
    maxEnergy--; // not used
    let res: Manager.SpawnRequest[] = [];
    let parts = this.getBodyParts([WORK, CARRY, MOVE], currentEnergy);
    if (parts.length == 0) {
      return res;
    }
    if (this.minions.length < 1) {
      res.push({
        "priority": 10,
        "parts": parts,
        "role": this.role
      });
    }
    return res;
  }
}

