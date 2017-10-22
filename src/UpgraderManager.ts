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
    if (!Memory.targetRCL) {
      Memory.targetRCL = 1;
    }
    let priority = 10;
    let room = Game.spawns['Spawn1'].room;
    let res: Mngr.SpawnerQueueElement[] = this.getRenewRequests(priority);
    let minBodyParts = [WORK, CARRY, MOVE];
    let design = UpgraderManager.getBodyParts(minBodyParts, maxEnergy);
    if (this.minions.length < 3 && room.controller && room.controller.level < Memory.targetRCL) {
      res.push({
        "priority": priority,
        "parts": design.body,
        "role": this.role,
        "price": design.price
      });
    }
    res = res.concat(this.getRenewRequests(10));
    return res;
  }
}

