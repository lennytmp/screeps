import * as Manager from "./Manager";
import * as Fighter from "./Fighter";
import * as Utils from "./Utils";

export class FighterManager extends Manager.Manager {

  readonly role = 'fighter';

  commandMinions(): void {
    _.forEach(this.minions, function(minion: Creep) {
        Fighter.run(minion);
    });
  }

  getSpawnOrders(currentEnergy: number, maxEnergy: number): Manager.SpawnRequest[] {
    let res: Manager.SpawnRequest[] = [];

    let minBodyParts = [RANGED_ATTACK, MOVE, TOUGH];
    if (maxEnergy - currentEnergy > this.getMinPrice(minBodyParts)) {
      return res;
    }

    let parts = this.getBodyParts(minBodyParts, currentEnergy);
    if (parts.length == 0) {
      return res;
    }
    if (this.minions.length < 1) {
      res.push({
        "priority": 100,
        "parts": parts.reverse(), // for additional security
        "role": this.role
      });
    }
    return res;
  }

  static isSafePos(pos: RoomPosition): boolean {
    if (pos.findInRange(FIND_HOSTILE_CREEPS, 3).length > 0) {
      return false;
    }
    let space = Utils.getArea(pos, 3);
    let resPositions = Game.rooms[pos.roomName].lookForAtArea(LOOK_STRUCTURES,
                                                              space.minY,
                                                              space.minX,
                                                              space.maxY,
                                                              space.maxX,
                                                              true);
    let result = true;
    _.forEach(resPositions, function(resPos: LookAtResultWithPos) {
      if (resPos.structure!.structureType == STRUCTURE_KEEPER_LAIR) {
        result = false;
        return false;
      }
      return true;
    });
    return result;
  }
}

