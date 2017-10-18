export function run(creep: Creep): void {
  if (creep.memory.building && creep.carry.energy == 0) {
    creep.memory.building = false;
  }
  if (!creep.memory.building && creep.carry.energy == creep.carryCapacity) {
    creep.memory.building = true;
  }
  if (creep.memory.building) {
    let targets = <ConstructionSite[]>creep.room.find(FIND_CONSTRUCTION_SITES);
    if (targets.length) {
      if (creep.build(targets[0]) == ERR_NOT_IN_RANGE) {
          creep.moveTo(targets[0]);
      }
    }
  } else {
    var spawner = Game.spawns['Spawn1'];
    if (creep.withdraw(spawner, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
      creep.moveTo(spawner);
    }
  }
}

