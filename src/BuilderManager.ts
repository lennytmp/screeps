import * as Builder from "./Builder";
import * as Ed from "./EnergyDistributor";
import * as Fmngr from "./FighterManager";
import * as Mngr from "./Manager";
import * as Utils from "./Utils";

const EXTENSIONS_AVAILABLE: {[ rcl: number ]: number} = {
  "2": 5,
  "3": 10,
  "4": 20,
  "5": 30,
  "6": 40,
  "7": 50,
  "8": 60,
};
const NATURAL_WALL = "wall"

export interface BuildRequest {
  positions: RoomPosition[],
  type: string
}

export class BuilderManager extends Mngr.Manager {

  readonly role = 'builder';
  priority: number = 75;

  registerOnEnergyMarket(): void {
    for (let i in this.minions) {
      let minion = this.minions[i];
      if (minion.carry.energy == 0) {
        // Ed.EnergyDistributor.registerRequest(minion, this.priority, minion.carryCapacity);
      }
    }
  }

  getSpawnOrders(_currentEnergy: number, maxEnergy: number): Mngr.SpawnerQueueElement[] {
    if (!Memory.builder) {
      Memory.builder = {
        "queue": [],
        "blocked_by_rcl": [],
        "desiredRCL": 0,
      };
    }
    let res: Mngr.SpawnerQueueElement[] = this.getRenewRequests(this.priority);
    if (!BuilderManager.existConstruction()) {
      if(Memory.builder.blocked_by_rcl.length > 0 && Memory.builder.desiredRCL <= Game.rooms[Memory.builder.blocked_by_rcl[0].positions[0].roomName].controller!.level) {
        Memory.builder.queue = [].concat(Memory.builder.blocked_by_rcl, Memory.builder.queue);
        Memory.builder.queue.blocked_by_rcl = [];
      }
      if(Memory.builder.queue.length == 0) {
        return res;
      }
      let b = Memory.builder.queue.shift();
      console.log("BuilderManager: gonna work on "+ JSON.stringify(b));
      let room = Game.rooms[b.positions[0].roomName];
      if (b.type == STRUCTURE_EXTENSION) {
        let max = EXTENSIONS_AVAILABLE[room.controller!.level];
        let extensions = <StructureExtension[]>room.find(FIND_MY_STRUCTURES, {
          filter: { structureType: STRUCTURE_EXTENSION }
        });
        if(b.positions.length + extensions.length > max) {
          Memory.builder.blocked_by_rcl.push(b);
          Memory.builder.desiredRCL = room.controller!.level + 1
          // We'll try the next queue entry next tick.
          return res;
        }
      }
      _.forEach(b.positions, function(pos: RoomPosition) {
        pos = Utils.unserializeRoomPosition(pos);
        Utils.check("createConstructionSite", Game.rooms[pos.roomName].createConstructionSite(pos, b.type), []);
      });
    }
    let minBodyParts = [WORK, CARRY, MOVE];
    if (this.minions.length >= 3) {
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

  commandMinions(): void {
    for (let i in this.minions) {
      Builder.run(this.minions[i]);
    }
  }

  static requestConstructions(positions: RoomPosition[], type: string) {
    console.log("Requested construction for "+ type +" at "+ positions.join('+'));
    Memory.builder.queue.push(<BuildRequest>{
      "positions": positions,
      type: type
    });
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
