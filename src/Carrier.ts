export function run(creep: Creep, src: string, dst: StructureSpawn): void {
  if (creep.memory.fetching && creep.carry.energy == creep.carryCapacity) {
    creep.memory.fetching = false;
  } else if (!creep.memory.fetching && creep.carry.energy == 0) {
    creep.memory.fetching = true;
  }
  let ext = <StructureExtension>Game.getObjectById(src);
  if (creep.withdraw(ext, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
    if (creep.memory.fetching) {
      creep.moveTo(ext);
    }
  }
  if (creep.transfer(dst, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
    if (!creep.memory.fetching) {
      creep.moveTo(dst);
    }
  }
}
