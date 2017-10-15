export function run(creep: Creep, src: number): void {
  if (creep.carry.energy! < creep.carryCapacity) {
    let sources = <Source[]>creep.room.find(FIND_SOURCES);
    if(creep.harvest(sources[src]) == ERR_NOT_IN_RANGE) {
      creep.moveTo(sources[src]);
    }
  } else {
    if(creep.transfer(Game.spawns['Spawn1']!, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
      creep.moveTo(Game.spawns['Spawn1']);
    }
  }
}
