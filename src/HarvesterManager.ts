import * as Manager from "./Manager";
import * as Fmngr from "./FighterManager";
import * as Harvester from "./Harvester";

export interface SourceDefinition {
  id: string,
  miningPositions: [number, number][],
  unsafe: boolean,
  distance: number
}

export class HarvesterManager extends Manager.Manager {

  readonly role = 'harvester';

  commandMinions(): void {
    let needs: { [id: string]: number; } = {};
    _.forEach(Memory.harvester.sources, function(s: SourceDefinition) {
      needs[s.id] = s.miningPositions.length;
    });
    _.forEach(this.minions, function(minion: Creep) {
      if(minion.memory.source) {
        needs[minion.memory.source]--;
      }
    });
    _.forEach(this.minions, function(minion: Creep) {
      if(!minion.memory.source) {
        _.forEach(needs, function(need: number, src: string): boolean {
          if(need > 0) {
            minion.memory.source = src;
            return false;
          }
          return true;
        });
      }
      Harvester.run(minion, minion.memory.source);
    });
  }

  getSpawnOrders(currentEnergy: number, maxEnergy: number): Manager.SpawnRequest[] {
    let res: Manager.SpawnRequest[] = [];

    let minBodyParts = [WORK, CARRY, MOVE];
    if (maxEnergy - currentEnergy > this.getMinPrice(minBodyParts)) {
      return res;
    }

    if(!Memory.harvester) {
      Memory.harvester = {};
    }
    if(!Memory.harvester.sources) {
      Memory.harvester.sources = this.calcSources(Game.spawns['Spawn1'].room);
    }
    // Create harvesters at p200 if there's only unsafe sources, otherwise as p0.
    let priority = 200;
    let needed = 0;
    _.forEach(Memory.harvester.sources, function(s: SourceDefinition) {
      needed += s.miningPositions.length;
      if(!s.unsafe) {
        priority = 0;
      }
    });

    let parts = this.getBodyParts(minBodyParts, currentEnergy);
    if (parts.length == 0) {
      return res;
    }
    if (this.minions.length < needed) {
      res.push({
        "priority": priority,
        "parts": parts,
        "role": this.role
      });
    }
    return res;
  }

  calcSources(room: Room): SourceDefinition[] {
    let res: SourceDefinition[] = [];
    let sources = <Source[]>room.find(FIND_SOURCES);
    _.forEach(sources, function(src: Source) {
      let p = src.pos;
      let positions: [number, number][] = [];
      let area = room.lookForAtArea(LOOK_TERRAIN, p.y-1, p.x-1, p.y+1, p.x+1, false);
      _.forEach(area, function(tmp: LookAtResultMatrix, y: any) {
        _.forEach(tmp, function(what: string, x: any) {
          if(what == "plain") {
            positions.push([x, y]);
          }
        });
      });
      let unsafe = !Fmngr.FighterManager.isSafePos(src.pos)
      let distances: number[] = [];
      _.forEach(Game.spawns, function(spawn: StructureSpawn) {
        distances.push(src.pos.findPathTo(spawn).length);
      })
      res.push({
        "id": src.id,
        "miningPositions": positions,
        "unsafe": unsafe,
        "distance": _.min(distances)
      });
      return true;
    });
    return _.sortBy(res, ['unsafe', 'distance']);
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
