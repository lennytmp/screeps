export function run(creep: Creep, src: string, dst: StructureSpawn): void {
  if (creep.carry.energy! == 0) {
    let ext = <StructureExtension>Game.getObjectById(src);
    if (creep.withdraw(ext, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
      creep.moveTo(ext);
    }
  } else {
    if (creep.transfer(dst, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
      creep.moveTo(dst);
    }
  }
}

