export function run(creep: Creep): void {
  if(creep.memory.upgrading && creep.carry.energy == 0) {
    creep.memory.upgrading = false;
  }
  if (!creep.memory.upgrading && creep.carry.energy == creep.carryCapacity) {
    creep.memory.upgrading = true;
  }
  if (creep.memory.upgrading) {
    if (creep.room.controller && 
        creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
      creep.moveTo(creep.room.controller, {visualizePathStyle: {stroke: '#ffffff'}});
    }
  }
  else {
    let sources = <Source[]>creep.room.find(FIND_SOURCES);
    if (creep.harvest(sources[0]) == ERR_NOT_IN_RANGE) {
      creep.moveTo(sources[0], {visualizePathStyle: {stroke: '#ffaa00'}});
    }
  }
}


