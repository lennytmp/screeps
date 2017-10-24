import * as Ed from "./EnergyDistributor";

export class Builder {

  moveRequested = false;
  creep: Creep;

  constructor(creep: Creep) {
    this.creep = creep;
    if(creep.memory.working && creep.carry.energy == 0) {
      creep.memory.working = false;
    }
    if (!creep.memory.working && creep.carry.energy == creep.carryCapacity) {
      creep.memory.working = true;
    }
  }

  run(upgrade: boolean): void {
    if (this.moveRequested) {
      return;
    }
    let creep = this.creep;
    if (creep.memory.working) {
      let targets = <ConstructionSite[]>creep.room.find(FIND_CONSTRUCTION_SITES);
      if (targets.length && !upgrade) {
        if (creep.build(targets[0]) == ERR_NOT_IN_RANGE) {
            creep.moveTo(targets[0]);
        }
      } else {
        if (creep.room.controller &&
            creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
          creep.moveTo(creep.room.controller);
        }
      }
    }
  }

  registerRequest(priority: number): void {
    let creep = this.creep;
    if (!creep.memory.working) {
      var self = this;
      Ed.EnergyDistributor.registerRequest(
          creep, priority, creep.carryCapacity, function(e: Ed.EnergyContainer) {
        if (creep.pos.isNearTo(e.obj)) {
          e.giveEnergy(creep);
        } else {
          creep.moveTo(e.obj);
          self.moveRequested = true;
        }
      });
    }
  }
}
