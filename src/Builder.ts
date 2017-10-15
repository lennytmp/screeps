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
          creep.moveTo(targets[0], {visualizePathStyle: {stroke: '#ffffff'}});
      }
    }
  } else {
    var sources = <Source[]>creep.room.find(FIND_SOURCES);
    if (creep.harvest(sources[0]) == ERR_NOT_IN_RANGE) {
      creep.moveTo(sources[0], {visualizePathStyle: {stroke: '#ffaa00'}});
    }
  }
}

