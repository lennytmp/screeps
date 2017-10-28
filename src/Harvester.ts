import * as Ed from "./EnergyDistributor";
import * as Utils from "./Utils";
import * as H from "./Harvester";

export class Harvester {

  creep: Creep;
  isHarvesting: boolean = true;

  constructor(creep: Creep) {
    this.creep = creep;
    if (creep.memory.isReviving && creep.ticksToLive > 1000) {
      creep.memory.isReviving = false;
      this.isHarvesting = true;
      return;
    }
    if ((creep.ticksToLive < 300 && Utils.shouldBeRenewed(creep)) || creep.memory.isReviving) {
      creep.memory.isReviving = true;
      this.isHarvesting = false;
      return;
    }
    if (this.isHarvesting && creep.carry.energy == creep.carryCapacity) {
      this.isHarvesting = false;
    }
  }

  run(src: string, dst: Structure): void {
    let creep = this.creep;
    if (creep.memory.isReviving) {
      creep.moveTo(Game.spawns['Spawn1']);
    }
  if (this.isHarvesting) {
    let mp = Utils.unserializeRoomPosition(creep.memory.mp);
    if (!creep.pos.isEqualTo(mp)) {
      creep.moveTo(mp);
    } else {
      let source = <Source>Game.getObjectById(src);
      creep.harvest(source);
    }
  }
  // Always try to transfer into our consumer.
  if (creep.transfer(dst, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
    if (!this.isHarvesting) {
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

