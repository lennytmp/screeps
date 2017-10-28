import * as Bmngr from "./BuilderManager";
import * as Ed from "./EnergyDistributor";
import * as Fmngr from "./FighterManager";
import * as H from "./Harvester";
import * as Mngr from "./Manager";
import * as Utils from "./Utils";

export interface SourceDefinition {
  id: string,
  miningPositions: RoomPosition[],
  extensionPositions?: RoomPosition[],
  unsafe: boolean,
  distance: number,
  maxWorks: number // maximum number of WORK parts per miner
}


export class HarvesterManager extends Mngr.Manager {

  readonly role = 'harvester';
  harvesters: H.Harvester[] = [];

  registerMinion(creep: Creep) {
    this.harvesters.push(new H.Harvester(creep));
    this.minions.push(creep);
  }

  registerOnEnergyMarket(): void {
    let containers = <StructureContainer[]>Game.spawns['Spawn1'].room.find(FIND_STRUCTURES, {
      filter: { structureType: STRUCTURE_CONTAINER}
    });
    for (let container of containers) {
      let cnt = new Ed.EnergyContainer(container);
      if (cnt.energy > 0) {
        Ed.EnergyDistributor.registerOffer(cnt, cnt.energy);
      }
    }
    for (let i in Game.structures) {
      let struct = Game.structures[i];
      if (Ed.EnergyContainer.isEnergyContainerSource(struct)) {
        let cnt = new Ed.EnergyContainer(struct);
        if (cnt.energy > 0) {
          Ed.EnergyDistributor.registerOffer(cnt, cnt.energy);
        }
      }
    }
    for (let minion of this.harvesters) {
      minion.registerRequest();
    }
  }

  commandMinions(): void {
    if (!Memory.harvester || !Memory.harvester.sources) {
      return;
    }
    let needs: { [id: string]: number; } = {};
    let mp2ext: { [mp: string]: Structure; } = {};
    _.forEach(Memory.harvester.sources, function(s: SourceDefinition) {
      needs[s.id] = s.miningPositions.length;
      if (s.extensionPositions) {
        for (let i in s.extensionPositions) {
          let mp = s.miningPositions[i];
          let ep = s.extensionPositions[i];
          let structures = <Structure[]>Game.rooms[mp.roomName].lookForAt(LOOK_STRUCTURES, Utils.unserializeRoomPosition(ep));
          if (structures.length > 0) {
            for (let struct of structures) {
              if (Ed.EnergyContainer.isEnergyContainerSource(struct)) {
                let e = new Ed.EnergyContainer(struct);
                if (e.energy < e.energyCapacity) {
                  mp2ext[Utils.posToString(mp)] = struct;
                }
              }
            }
          }
        }
      }
    });
    _.forEach(this.minions, function(minion: Creep) {
      if(minion.memory.source) {
        needs[minion.memory.source]--;
      }
    });
    _.forEach(this.harvesters, function(harvester: H.Harvester) {
      let minion = harvester.creep;
      if(!minion.memory.source) {
        _.forEach(needs, function(need: number, src: string): boolean {
          if(need > 0) {
            minion.memory.source = src;
            needs[minion.memory.src]--;
            return false;
          }
          return true;
        });
      }
      let dst = mp2ext[Utils.posToString(minion.pos)];
      if(!dst) {
        dst = Game.spawns['Spawn1'];
      }
      harvester.run(minion.memory.source, dst);
    });
  }

  getSpawnOrders(_currentEnergy: number, maxEnergy: number): Mngr.SpawnerQueueElement[] {
    let room = Game.spawns['Spawn1'].room;
    let res: Mngr.SpawnerQueueElement[] = this.getRenewRequests(0);

    let minBodyParts = [WORK, CARRY, MOVE];
    if (this.minions.length == 0) {
      res.push({
        "priority": 0,
        "parts": minBodyParts,
        "role": this.role,
        "price": Utils.getBodyPrice(minBodyParts)
      });
      return res;
    }

    if(!Memory.harvester) {
      Memory.harvester = {};
    }
    if(!Memory.harvester.sources) {
      Memory.harvester.sources = this.calcSources(room);
    }
    if(Memory.harvester.hasExtensionsPlanned && !Memory.harvester.hasRoadsPlanned && room.controller && room.controller.level >= 2) {
      this.calcRoads(room, Memory.harvester.sources);
      Memory.harvester.hasRoadsPlanned = true;
    }
    if(!Memory.harvester.hasExtensionsPlanned && room.controller && room.controller.level >= 2) {
      this.calcExtensions(room, Memory.harvester.sources);
      Memory.harvester.hasExtensionsPlanned = true;
    }
    // Create harvesters at p200 if there's only unsafe sources, otherwise as p0.
    let priority = 200;
    let needed = 0;
    _.forEach(Memory.harvester.sources, function(s: SourceDefinition) {
      needed += s.miningPositions.length;
      if(!s.unsafe) {
        priority = 1; // updating existing ones is still more important
      }
    });
    if (this.minions.length >= needed) {
      if (Memory.targetRCL < 2) {
        Memory.targetRCL = 2;
      }
      return res;
    }
    let design = HarvesterManager.getBodyParts(minBodyParts, maxEnergy);
    res.push({
      "priority": priority,
      "parts": design.body,
      "role": this.role,
      "price": design.price
    });
    return res;
  }

  calcSources(room: Room): SourceDefinition[] {
    let res: SourceDefinition[] = [];
    let sources = <Source[]>room.find(FIND_SOURCES);
    _.forEach(sources, function(src: Source) {
      let p = src.pos;
      let positions: RoomPosition[] = [];
      let area = room.lookForAtArea(LOOK_TERRAIN, p.y-1, p.x-1, p.y+1, p.x+1, false);
      _.forEach(area, function(tmp: LookAtResultMatrix, y: any) {
        _.forEach(tmp, function(what: string, x: any) {
          if(what == "plain") {
            positions.push(new RoomPosition(x, y, room.name));
          }
        });
      });
      let unsafe = !Fmngr.FighterManager.isSafePos(src.pos)
      if(unsafe) {
        return true;
      }
      let distances: number[] = [];
      _.forEach(Game.spawns, function(spawn: StructureSpawn) {
        distances.push(src.pos.findPathTo(spawn).length);
      })
      res.push({
        "id": src.id,
        "miningPositions": positions,
        "unsafe": unsafe,
        "distance": _.min(distances),
        "maxWorks": Math.ceil(src.energyCapacity / 300 / 2 / positions.length)
      });
      return true;
    });
    return _.sortBy(res, ['unsafe', 'distance']);
  }

  _getRoomCostMatrix(room: Room): CostMatrix {
    let costs: CostMatrix = PathFinder.CostMatrix;
    // Do a useless pathfind and steal the passed in CostMatrix and return that.
    room.findPath(new RoomPosition(0, 1, room.name), new RoomPosition(1, 0, room.name), {
      "ignoreCreeps": true,
      "ignoreRoads": true,
      "maxOps": 3,
      "costCallback": function(_room: string, cm: CostMatrix) {
        costs = cm;
        return false;
      }
    });
    return costs;
  }

  calcExtensions(room: Room, srcs: SourceDefinition[]) {
    let self = this;
    _.forEach(srcs.reverse(), function(src: SourceDefinition) {
      let source = <Source>Game.getObjectById(src.id);
      let costs = self._getRoomCostMatrix(room);
      let p = source.pos;
      let terrain = room.lookForAtArea(LOOK_TERRAIN, p.y-3, p.x-3, p.y+3, p.x+3, false);
      _.forEach(terrain, function(tmp: LookAtResultMatrix, y: any) {
        _.forEach(tmp, function(what: string, x: any) {
          if (what == "wall") {
            // Not needed for pathFinder, but to prevent trying to build there.
            costs.set(x, y, 255);
          }
        });
      });
      costs.set(source.pos.x, source.pos.x, 255);
      _.forEach(src.miningPositions, function(pos: RoomPosition) {
        costs.set(pos.x, pos.y, 255);
      });
      let res = self._tryExtensionSpot(room, src, costs, 0);
      if (res) {
        src.extensionPositions = res;
        Bmngr.BuilderManager.requestConstructions(res, STRUCTURE_EXTENSION);
      }
    });
  }

  static getBodyParts(priorities: string[], energy: number): Mngr.BodyDesign {
    let design = <Mngr.BodyDesign>{
      "body": <string[]>[],
      "price": 0
    };
    let curEnergy = energy;
    // Make it WORK, MOVE, CARRY.
    for (let priority of priorities) {
      let partCost = BODYPART_COST[priority];
      design.body.push(priority);
      design.price += partCost;
    }
    if (energy - design.price < 0) {
      return design;
    }
    // Scale WORK as much as possible.
    let workPrice = BODYPART_COST[WORK];
    while (energy - design.price > workPrice) {
      design.body.push(WORK);
      design.price += workPrice;
    }
    // Spend the rest on CARRY. 
    let carryPrice = BODYPART_COST[CARRY];
    while (energy - design.price > carryPrice) {
      design.body.push(CARRY);
      design.price += carryPrice;
    }
    return design;
  }

  private _tryExtensionSpot(room: Room, src: SourceDefinition, costs: CostMatrix, minerIdx: number): RoomPosition[] | false {
    let mp = Utils.unserializeRoomPosition(src.miningPositions[minerIdx]);
    // TODO: use Utils.getArea
    for(var x = Math.max(0, mp.x-1); Math.min(49, mp.x+1) >= x; x++) {
      for(var y = Math.max(0, mp.y-1); Math.min(49, mp.y+1) >= y; y++) {
        if (costs.get(x, y) == 255) {
          continue
        }
        costs.set(x, y, 255);
        if (src.miningPositions.length-1 == minerIdx) {
          for(var i = 0; src.miningPositions.length > i; i++) {
            let omp = Utils.unserializeRoomPosition(src.miningPositions[i]);
            let path = room.findPath(Game.spawns['Spawn1'].pos, omp, {
              "ignoreCreeps": true,
              "ignoreRoads": true,
              "costCallback": function(_room: string, _cm: CostMatrix) {
                return costs;
              }
            });
            if (path.length == 0 || path[path.length-1].x != omp.x || path[path.length-1].y != omp.y) {
              costs.set(x, y, 0);
              return false;
            }
          }
          return [new RoomPosition(x, y, room.name)];
        }
        let res = this._tryExtensionSpot(room, src, costs, minerIdx+1);
        if (res) {
          return [new RoomPosition(x, y, room.name)].concat(res);
        }
        costs.set(x, y, 0);
      }
    }
    return false;
  }

  calcRoads(room: Room, srcs: SourceDefinition[]) {
    let self = this;
    let spawn = Game.spawns['Spawn1'];
    _.forEach(srcs.reverse(), function(src: SourceDefinition) {
      let closestDistance: number = 0;
      let closestPosition: RoomPosition | null = null;
      let closestPath: PathStep[] = [];
      _.forEach(src.extensionPositions!, function(pos: RoomPosition) {
        pos = Utils.unserializeRoomPosition(pos);
        let path = room.findPath(spawn.pos, pos, {
          "ignoreCreeps": true
        });
        if(!closestPosition || closestDistance > path.length) {
          closestDistance = path.length;
          closestPosition = pos;
          closestPath = path;
        }
      });
      let mainRoad = Utils.pathToRoomPositions(room, closestPath);
      mainRoad.pop(); // Don't build a road under the extension
      Bmngr.BuilderManager.requestConstructions(mainRoad, STRUCTURE_ROAD);
      let end = mainRoad[mainRoad.length-1];
      _.forEach(src.extensionPositions!, function(pos: RoomPosition) {
        pos = Utils.unserializeRoomPosition(pos);
        let path = room.findPath(end, pos, {
          "ignoreCreeps": true,
          "costCallback": function(_room: string, cm: CostMatrix) {
            for (let p of src.miningPositions!) {
              cm.set(p.x, p.y, 255);
            }
            for (let p of src.extensionPositions!) {
              cm.set(p.x, p.y, 255);
            }
            return false;
          }
        });
        if(path.length > 1) {
          let road = Utils.pathToRoomPositions(room, path);
          road.pop(); // Don't build a road under the extension
          Bmngr.BuilderManager.requestConstructions(road, STRUCTURE_ROAD);
        }
      });
    });
  }

  static getMyConsumer(creep: Creep): Creep | Structure {
    return creep.pos.findClosestByRange(
      FIND_MY_STRUCTURES, {
        filter: function(o: Structure): boolean {
          if (o.structureType == STRUCTURE_EXTENSION) {
            let ext = <StructureExtension>o;
            return ext.energy < ext.energyCapacity;
          }
          if (o.structureType == STRUCTURE_SPAWN) {
            let spawn = <StructureSpawn>o;
            return spawn.energy < spawn.energyCapacity;
          }
          return false;
        }
    });
  }
}
