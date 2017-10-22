import * as Builder from "./Builder";
import * as Ed from "./EnergyDistributor";
import * as Fmngr from "./FighterManager";
import * as Mngr from "./Manager";
import * as Utils from "./Utils";

const EXTENSIONS_AVAILABLE = {"2": 5};
const NATURAL_WALL = "wall"

export class BuilderManager extends Mngr.Manager {

  readonly role = 'builder';
  priority: number = 20;

  registerOnEnergyMarket(): void {
    for (let i in this.minions) {
      let minion = this.minions[i];
      if (minion.carry.energy == 0) {
        Ed.EnergyDistributor.registerRequest(minion, this.priority, minion.carryCapacity);
      }
    }
  }

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
    for (let i in this.minions) {
      Builder.run(this.minions[i]);
    }
  }

  getSpawnOrders(_currentEnergy: number, maxEnergy: number): Mngr.SpawnerQueueElement[] {
    let res: Mngr.SpawnerQueueElement[] = this.getRenewRequests(this.priority);
    let minBodyParts = [WORK, CARRY, MOVE];
    if (!BuilderManager.existConstruction() ||
        this.minions.length >= 3) {
      return res;
    }
    let design = BuilderManager.getBodyParts(minBodyParts, maxEnergy);
    res.push({
      "priority": this.priority,
      "parts": design.body,
      "role": this.role,
      "price": design.price
    });
    return res;
  }

  static planExtensions(spawn: StructureSpawn, num: number): boolean {
    let space = Utils.getArea(spawn.pos, 3);
    let resPositions = spawn.room.lookForAtArea(LOOK_TERRAIN, space.minY, space.minX, space.maxY, space.maxX, true);
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
