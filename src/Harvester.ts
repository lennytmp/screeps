export function run(creep: Creep, src: string): void {
  if (creep.carry.energy! < creep.carryCapacity) {
    let source = <Source>Game.getObjectById(src);
    if(creep.harvest(source) == ERR_NOT_IN_RANGE) {
      creep.moveTo(source);
    }
  } else {
    if(creep.transfer(Game.spawns['Spawn1']!, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
      creep.moveTo(Game.spawns['Spawn1']);
    }
  }
}
