import * as Manager from "./Manager";
import * as Harvester from "./Harvester";

export interface SourceDefinition {
	id: string,
	miningPositions: [number, number][]
}

export class HarvesterManager extends Manager.Manager {

  readonly role = 'harvester';
  
  commandMinions(): void {
		let bla: { [id: string]: number; } = {};
		_.forEach(Memory.harvester.sources, function(s: SourceDefinition) {
			bla[s.id] = s.miningPositions.length;
		});
    _.forEach(this.minions, function(minion: Creep) {
			if(minion.memory.source) {
				bla[minion.memory.source]--;
			}
    });
    _.forEach(this.minions, function(minion: Creep) {
			if(!minion.memory.source) {
				_.forEach(bla, function(need: number, src: string): boolean {
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
    let res: Manager.SpawnRequest[] = [];
    if (this.minions.length < needed && currentEnergy > 0 && maxEnergy == 300) {
      res.push({
        "priority": 0,
        "parts": [WORK, WORK, CARRY, MOVE],
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
			_.forEach(area, function(tmp, y: any) {
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
		});
		return res;
	}
}
