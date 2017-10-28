import * as Ed from "./EnergyDistributor";
import * as Utils from "./Utils";
import * as H from "./Harvester";

export class Harvester {

  creep: Creep;

  constructor(creep: Creep) {
    this.creep = creep;
    if (creep.memory.isReviving && creep.ticksToLive > 1000) {
      creep.memory.isReviving = false;
      creep.memory.isHarvesting = true;
      return;
    }
    if ((creep.ticksToLive < 300 && Utils.shouldBeRenewed(creep)) || creep.memory.isReviving) {
      creep.memory.isReviving = true;
      creep.memory.isHarvesting = false;
      return;
    }
    if (creep.memory.isHarvesting && creep.carry.energy == creep.carryCapacity) {
      creep.memory.isHarvesting = false;
      return;
    }
    if (!creep.memory.isHarvesting  && creep.carry.energy == 0) {
      creep.memory.isHarvesting = true;
    }
  }

  run(src: string, dst: Structure): void {
    let creep = this.creep;
    if (creep.memory.isReviving) {
      creep.moveTo(Game.spawns['Spawn1']);
    }
    if (creep.memory.isHarvesting) {
      let source = <Source>Game.getObjectById(src);
      if(creep.harvest(source) == ERR_NOT_IN_RANGE) {
        creep.moveTo(source);
      }
    }
    // Always try to transfer into our consumer.
    if (creep.transfer(dst, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
      if (!creep.memory.isHarvesting) {
        // But only move if we're full (or were full and haven't dropped everything yet)
        creep.moveTo(dst);
      }
    }
  }

  registerRequest(): void {
    let creep = this.creep;
    if (creep.carry && creep.carry[RESOURCE_ENERGY]! > 0) {
      let cnt = new Ed.EnergyContainer(creep);
      Ed.EnergyDistributor.registerOffer(cnt, cnt.energy);
    }
  }
}

