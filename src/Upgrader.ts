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
    var spawner = Game.spawns['Spawn1'];
    if (creep.withdraw(spawner, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
      creep.moveTo(spawner, {visualizePathStyle: {stroke: '#ffaa00'}});
    }
  }
}


