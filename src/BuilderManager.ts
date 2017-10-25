import * as B from "./Builder";
import * as Ed from "./EnergyDistributor";
import * as Fmngr from "./FighterManager";
import * as Mngr from "./Manager";
import * as Utils from "./Utils";

export interface BuildRequest {
  positions: RoomPosition[],
  type: string
}

export class BuilderManager extends Mngr.Manager {

  static readonly EXTENSIONS_AVAILABLE: {[ rcl: number ]: number} = {
    "1": 0,
    "2": 5,
    "3": 10,
    "4": 20,
    "5": 30,
    "6": 40,
    "7": 50,
    "8": 60,
  };

  readonly role = 'builder';
  priority: number = 75;
  builders: B.Builder[] = [];

  registerMinion(creep: Creep) {
    this.builders.push(new B.Builder(creep));
    this.minions.push(creep);
  }

  registerOnEnergyMarket(): void {
    for (let i in this.builders) {
      // Energy requests for  upgraders are more important than building a new one
      this.builders[i].registerRequest(this.priority - 1);
    }
  }

  getSpawnOrders(_currentEnergy: number, maxEnergy: number): Mngr.SpawnerQueueElement[] {
    if (!Memory.builder) {
      Memory.builder = {
        "queue": [],
        "blocked_by_rcl": [],
        "desiredRCL": 0,
        "blocked": false
      };
    }
    let res: Mngr.SpawnerQueueElement[] = this.getRenewRequests(this.priority - 1);

    BuilderManager.planConstructionSites();

    let minBodyParts = [WORK, CARRY, MOVE];
    let priority = this.priority;
    if (this.minions.length >= 4) {
      priority += 100;
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

  commandMinions(): void {
    let room = Game.spawns['Spawn1'].room;
    let max = BuilderManager.getMaxRoomExt(room);
    let numExt = BuilderManager.getRoomNumExt(room);
    Memory.builder.blocked = numExt > max;
    for (let i in this.builders) {
      this.builders[i].run(Memory.builder.blocked);
    }
  }

  static planConstructionSites(): void {
    if (BuilderManager.existConstruction()) {
      return;
    }
    if (Memory.builder.blocked_by_rcl.length > 0 &&
       Memory.builder.desiredRCL <= Game.rooms[Memory.builder.blocked_by_rcl[0].positions[0].roomName].controller!.level) {

      Memory.builder.queue = [].concat(Memory.builder.blocked_by_rcl, Memory.builder.queue);
      Memory.builder.blocked_by_rcl = [];
    }
    let b = Memory.builder.queue.shift();
    if (!b) {
      return;
    }
    let room = Game.rooms[b.positions[0].roomName];
    if (b.type == STRUCTURE_EXTENSION) {
      let max = BuilderManager.getMaxRoomExt(room);
      let numExt = BuilderManager.getRoomNumExt(room);
      if (b.positions.length + numExt > max) {
        Memory.builder.blocked_by_rcl.push(b);
        Memory.builder.desiredRCL = room.controller!.level + 1
        // We'll try the next queue entry next tick.
        return;
      }
    }
    _.forEach(b.positions, function(pos: RoomPosition) {
      pos = Utils.unserializeRoomPosition(pos);
      Utils.check("createConstructionSite", Game.rooms[pos.roomName].createConstructionSite(pos, b.type), []);
    });
  }

  static requestConstructions(positions: RoomPosition[], type: string) {
    Memory.builder.queue.push(<BuildRequest>{
      "positions": positions,
      type: type
    });
  }

  static existConstruction(): boolean {
    let targets = Game.constructionSites;
    for (var key in targets) {
      return true;
    }
    return false;
  }

  static getMaxRoomExt(r: Room):number {
    return BuilderManager.EXTENSIONS_AVAILABLE[r.controller!.level];
  }

  static getRoomNumExt(r: Room) {
    let existing = r.find(FIND_MY_STRUCTURES, {
      filter: { structureType: STRUCTURE_EXTENSION }
    }).length;
    let building = r.find(FIND_CONSTRUCTION_SITES, {
      filter: { structureType: STRUCTURE_EXTENSION }
    }).length;
    return existing + building;
  }
}
