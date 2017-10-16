import * as Manager from "./Manager";
import * as Builder from "./Builder";

export class BuilderManager extends Manager.Manager {

  readonly role = 'builder';

  commandMinions(): void {
    var spawner = Game.spawns['Spawn1'];
    // Create construction sites if needed
    if (!existConstruction()) {
      _.forEach(Game.rooms, function(room: Room) {
          let sources = <Source[]>room.find(FIND_SOURCES);
          for (let j = 0; j < sources.length; j++) {
            if (j == 2) {
              continue; // danger here. TODO: dehardoce this
            }
            let path = room.findPath(spawner.pos, sources[j].pos, {
              ignoreCreeps: true
            });
            for (let i = 0; i < path.length; i++) {
              room.createConstructionSite(path[i].x, path[i].y, STRUCTURE_ROAD);
            }
          }
          return false; // only one room per tick
      });
    }
    _.forEach(this.minions, function(minion: Creep) {
        Builder.run(minion);
    });
  }

  getSpawnOrders(currentEnergy: number, maxEnergy: number): Manager.SpawnRequest[] {
    let res: Manager.SpawnRequest[] = [];
    if (this.minions.length < 5 && currentEnergy > 0 && maxEnergy == 300) {
      res.push({
        "priority": 10,
        "parts": [WORK, CARRY, CARRY, MOVE],
        "role": this.role
      });
    }
    return res;
  }
}

function existConstruction() {
  let targets = Game.constructionSites;
  for (var key in targets) {
    return true;
  }
  return false;
}
