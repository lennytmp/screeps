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
    if (this.minions.length < 1 && currentEnergy > 0 && maxEnergy == 300) {
      res.push({
        "priority": 100,
        "parts": [TOUGH, TOUGH, MOVE, MOVE, RANGED_ATTACK],
        "role": this.role 
      });
    }
    return res;
  }

  static isSafePos(pos: RoomPosition): boolean {
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

