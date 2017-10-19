import * as Manager from "./Manager";
import * as Fighter from "./Fighter";

const ROOM_WIDTH = 50;
const ROOM_HEIGHT = 50;

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
    let minY = Math.max(0, pos.y - 3);
    let minX = Math.max(0, pos.x - 3);
    let maxX = Math.min(ROOM_WIDTH, pos.x + 3);
    let maxY = Math.min(ROOM_HEIGHT, pos.y + 3);
    let resPositions = Game.rooms[pos.roomName].lookForAtArea(LOOK_STRUCTURES,
                                                              minY,
                                                              minX,
                                                              maxY,
                                                              maxX,
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

