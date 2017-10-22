import * as Mngr from "./Manager";
import * as Fmngr from "./FighterManager";
import * as Builder from "./Builder";
import * as Utils from "./Utils";

const EXTENSIONS_AVAILABLE = {"2": 5};
const NATURAL_WALL = "wall"

export class BuilderManager extends Mngr.Manager {

  readonly role = 'builder';

  commandMinions(): void {
    var spawn = Game.spawns['Spawn1'];
    // Create construction sites if needed
    if (!BuilderManager.existConstruction()) {
      _.forEach(Game.rooms, function(room: Room) {
        if (room.controller!.level == 2) {
          // TODO: we'll probably decide on the same tick to build extensions as to build roads. We should prioritize the extensions. See the TODO in HarvesterManager before fixing this TODO.
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

  getSpawnOrders(_currentEnergy: number, maxEnergy: number): Mngr.SpawnerQueueElement[] {
    let priority = 20;
    let res: Mngr.SpawnerQueueElement[] = this.getRenewRequests(priority);
    let minBodyParts = [WORK, CARRY, MOVE];
    if (!BuilderManager.existConstruction() ||
        this.minions.length >= 3) {
      return res;
    }
    let design = BuilderManager.getBodyParts(minBodyParts, maxEnergy);
    res.push({
      "priority": priority,
      "parts": design.body,
      "role": this.role,
      "price": design.price
    });
    return res;
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
