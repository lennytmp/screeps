import * as Mngr from "./Manager";
import * as Upgrader from "./Upgrader";

export class UpgraderManager extends Mngr.Manager {

  readonly role = "upgrader";

  commandMinions(): void {
    _.forEach(this.minions, function(minion: Creep) {
        Upgrader.run(minion);
    });
  }

  getSpawnOrders(currentEnergy: number, maxEnergy: number): Mngr.SpawnerQueueElement[] {
    let res: Mngr.SpawnerQueueElement[] = [];

    let minBodyParts = [WORK, CARRY, MOVE];
    if (maxEnergy - currentEnergy > UpgraderManager.getMinPrice(minBodyParts)) {
      return res;
    }

    let parts = UpgraderManager.getBodyParts(minBodyParts, currentEnergy);
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
    res = res.concat(this.getRenewRequests(10));
    return res;
  }
}

