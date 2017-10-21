import * as Hmngr from "./HarvesterManager";

export function run(creep: Creep, src: string): void {
  if (creep.memory.harvesting && creep.carry.energy == creep.carryCapacity) {
    creep.memory.harvesting = false;
  } else if (!creep.memory.harvesting && creep.carry.energy == 0) {
    creep.memory.harvesting = true;
  }
  if (creep.memory.harvesting) {
    let source = <Source>Game.getObjectById(src);
    if(creep.harvest(source) == ERR_NOT_IN_RANGE) {
      creep.moveTo(source);
    }
  } else {
    // TODO: consumer should be passed into run() instead.
    let consumer = Hmngr.HarvesterManager.getMyConsumer(creep);
    if (consumer == null) {
      return;
    }
    if (creep.transfer(consumer, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
      creep.moveTo(consumer);
    }
  }
}

