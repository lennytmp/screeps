import * as Manager from "./Manager";
import * as Fmngr from "./FighterManager";
import * as Builder from "./Builder";
import * as Utils from "./Utils";

const EXTENSIONS_AVAILABLE = {"2": 5};
const NATURAL_WALL = "wall"

export class BuilderManager extends Manager.Manager {

  readonly role = 'builder';

  commandMinions(): void {
    var spawn = Game.spawns['Spawn1'];
    // Create construction sites if needed
    if (!BuilderManager.existConstruction()) {
      _.forEach(Game.rooms, function(room: Room) {
        if (room.controller!.level == 2) {
          if (!room.memory.ext_planned) {
            room.memory.ext_planned =
                BuilderManager.planExtensions(spawn, EXTENSIONS_AVAILABLE["2"]);
            return true;
          }
          if (!room.memory.roads_planned) {
            BuilderManager.planRoadsFromSpawn(spawn);
            room.memory.roads_planned = true;
          }
        }
        return true;
      });
    }
    _.forEach(this.minions, function(minion: Creep) {
        Builder.run(minion);
    });
  }

  getSpawnOrders(currentEnergy: number, maxEnergy: number): Manager.SpawnRequest[] {
    let res: Manager.SpawnRequest[] = [];

    let minBodyParts = [WORK, CARRY, MOVE];
    if (maxEnergy - currentEnergy > this.getMinPrice(minBodyParts)) {
      return res;
    }

    if (!BuilderManager.existConstruction() ||
        this.minions.length >= 3) {
      return res;
    }
    let parts = this.getBodyParts(minBodyParts, currentEnergy);
    if (parts.length == 0) {
      return res;
    }
    res.push({
      "priority": 20,
      "parts": parts,
      "role": this.role
    });
    return res;
  }

  static planExtensions(spawn: StructureSpawn, num: number): boolean {
    let space = Utils.getArea(spawn.pos, 3);
    let resPositions = spawn.room.lookForAtArea(LOOK_TERRAIN,
                                                space.minY,
                                                space.minX,
                                                space.maxY,
                                                space.maxX,
                                                true);
    _.forEach(resPositions, function(resPos: LookAtResultWithPos) {
        if (resPos.terrain == NATURAL_WALL) {
          return true;
        }
        let pos = new RoomPosition(resPos.x, resPos.y, spawn.room.name);
        if (!pos.inRangeTo(spawn, 1)) {
          if (pos.createConstructionSite(STRUCTURE_EXTENSION) == OK) {
            num--;
          }
        }
        return num > 0;
    });
    return num == 0;
  }

  static planRoadsFromSpawn(spawn: StructureSpawn): void {
    let sources = <Source[]>spawn.room.find(FIND_SOURCES);
    for (let j = 0; j < sources.length; j++) {
      if (!Fmngr.FighterManager.isSafePos(sources[j].pos)) {
        continue;
      }
      let path = spawn.room.findPath(spawn.pos, sources[j].pos, {
        ignoreCreeps: true
      });
      for (let i = 0; i < path.length; i++) {
        spawn.room.createConstructionSite(path[i].x, path[i].y, STRUCTURE_ROAD);
      }
    }
  }

  static existConstruction(): boolean {
    let targets = Game.constructionSites;
    for (var key in targets) {
      return true;
    }
    return false;
  }
}
