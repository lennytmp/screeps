import * as Mngr from "./Manager";
import * as Upgrader from "./Upgrader";

export class UpgraderManager extends Mngr.Manager {

  readonly role = "upgrader";

  commandMinions(): void {
    _.forEach(this.minions, function(minion: Creep) {
        Upgrader.run(minion);
    });
  }

  getSpawnOrders(_currentEnergy: number, maxEnergy: number): Mngr.SpawnerQueueElement[] {
    let priority = 10;
    let res: Mngr.SpawnerQueueElement[] = this.getRenewRequests(priority);
    let minBodyParts = [WORK, CARRY, MOVE];
    let parts = UpgraderManager.getBodyParts(minBodyParts, maxEnergy);
    if (this.minions.length < 1) {
      res.push({
        "priority": priority,
        "parts": parts,
        "role": this.role
      });
    }
    res = res.concat(this.getRenewRequests(10));
    return res;
  }
}

