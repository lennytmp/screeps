import * as Utils from "./Utils";

const RENEWAL_COEF = 2;

export function run(creep: Creep, src: string, dst: Structure): void {
  if ((creep.ticksToLive < 300 && Utils.shouldBeRenewed(creep)) || creep.memory.reviving) {
    creep.memory.reviving = true;
    creep.moveTo(Game.spawns['Spawn1']);
    return;
  } else {
    creep.memory.reviving = false;
    // Go back to his miningPosition and let him fill up his extension.
    creep.memory.harvesting = true;
  }
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
  }
  // Always try to transfer into our consumer.
  if (creep.transfer(dst, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
    if(!creep.memory.harvesting) {
      // But only move if we're full (or were full and haven't dropped everything yet)
      creep.moveTo(dst);
    }
  }
}
