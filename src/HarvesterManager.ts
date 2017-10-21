import * as Manager from "./Manager";
import * as Fmngr from "./FighterManager";
import * as Harvester from "./Harvester";

export interface SourceDefinition {
	id: string,
	miningPositions: [number, number][]
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
		let needed = 0;
		_.forEach(Memory.harvester.sources, function(s: SourceDefinition) {
			needed += s.miningPositions.length;
		});

    let parts = this.getBodyParts(minBodyParts, currentEnergy);
    if (parts.length == 0) {
      return res;
    }
    if (this.minions.length < needed) {
      res.push({
        "priority": 0,
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
      if (!Fmngr.FighterManager.isSafePos(src.pos)) {
        return true;
      }
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
			res.push({
				"id": src.id,
				"miningPositions": positions
			});
      return true;
		});
		return res;
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
