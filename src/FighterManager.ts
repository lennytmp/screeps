import * as Mngr from "./Manager";
import * as Fighter from "./Fighter";
import * as Utils from "./Utils";

export class FighterManager extends Mngr.Manager {

  readonly role = 'fighter';

  commandMinions(): void {
    _.forEach(this.minions, function(minion: Creep) {
        Fighter.run(minion);
    });
  }

  getSpawnOrders(_currentEnergy: number, maxEnergy: number): Mngr.SpawnerQueueElement[] {
    let priority = 100;
    let res: Mngr.SpawnerQueueElement[] = this.getRenewRequests(priority);
    let minBodyParts = [RANGED_ATTACK, MOVE, TOUGH];
    let design = FighterManager.getBodyParts(minBodyParts, maxEnergy);
    if (this.minions.length < 1) {
      res.push({
        "priority": priority,
        "parts": design.body.reverse(), // for additional security
        "role": this.role,
        "price": design.price
      });
    }
    res = res.concat(this.getRenewRequests(100));
    return res;
  }

  static isSafePos(pos: RoomPosition): boolean {
    if (pos.findInRange(FIND_HOSTILE_CREEPS, 3).length > 0) {
      return false;
    }
    return !Utils.isNearStructure(pos, STRUCTURE_KEEPER_LAIR, 3);
  }
}
