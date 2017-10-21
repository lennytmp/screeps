import * as Mngr from "./Manager";
import * as Carrier from "./Carrier";

export class CarrierManager extends Mngr.Manager {

  readonly role = 'carrier';

  commandMinions(): void {
    let needs: { [id: string]: number; } = {};
    let extensions = this.findExtensions(Game.spawns['Spawn1'].room);
    _.forEach(extensions, function(s: StructureExtension) {
      needs[s.id] = 1;
    });
    _.forEach(this.minions, function(minion: Creep) {
      if(minion.memory.src) {
        needs[minion.memory.src]--;
      }
    });
    _.forEach(this.minions, function(minion: Creep) {
      if(!minion.memory.src) {
        _.forEach(needs, function(need: number, src: string): boolean {
          if(need > 0) {
            minion.memory.src = src;
            needs[minion.memory.src]--;
            return false;
          }
          return true;
        });
      }
      Carrier.run(minion, minion.memory.src, Game.spawns['Spawn1']);
    });
  }

  getSpawnOrders(_currentEnergy: number, maxEnergy: number): Mngr.SpawnerQueueElement[] {
    let res: Mngr.SpawnerQueueElement[] = this.getRenewRequests(0);

    let minBodyParts = [CARRY, MOVE];

    let extensions = this.findExtensions(Game.spawns['Spawn1'].room);

    if (this.minions.length >= extensions.length) {
      return res;
    }
    let design = CarrierManager.getBodyParts(minBodyParts, maxEnergy);
    res.push({
      "priority": 50,
      "parts": design.body,
      "role": this.role,
      "price": design.price
    });
    return res;
  }

  findExtensions(room: Room): StructureExtension[] {
    let ret: StructureExtension[] = [];
    let sources = <Structure[]>room.find(FIND_MY_STRUCTURES);
    _.forEach(sources, function(o: Structure) {
      if (o.structureType == STRUCTURE_EXTENSION) {
        let ext = <StructureExtension>o;
        ret.push(ext);
      }
    });
    return ret;
  }
}
