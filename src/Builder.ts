import * as Ed from "./EnergyDistributor";
import * as Utils from "./Utils";

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

  run(mustUpgrade: boolean): void {
    if (this.moveRequested) {
      return;
    }
    let creep = this.creep;
    let target: ConstructionSite | StructureController | null = null;
    let err: number = OK;
    if (!mustUpgrade) {
      let targets = <ConstructionSite[]>creep.room.find(FIND_CONSTRUCTION_SITES);
      if (targets.length) {
        target = targets[0];
        err = creep.build(target);
      }
    }
    if (!target && creep.room.controller) {
      target = creep.room.controller;
      err = creep.upgradeController(target);
    }
    if (err == ERR_NOT_IN_RANGE && creep.memory.working) {
      creep.moveTo(target!);
    }
  }

  registerRequest(priority: number): void {
    let creep = this.creep;
    let creepCarry = creep.carry![RESOURCE_ENERGY] || 0;
    let freeSpace = creep.carryCapacity - creepCarry;
    if (freeSpace == 0) {
      return;
    }
    let clb: ((c: Ed.EnergyContainer, e: number) => void) | undefined = undefined;
    if (!creep.memory.working) {
      priority--; // I'm not working, my priority is higher. 
      let self = this;
      clb = function(c: Ed.EnergyContainer, e: number) {
        if (creep.pos.isNearTo(c.obj)) {
          c.giveEnergy(new Ed.EnergyContainer(creep), e);
        } else {
          creep.moveTo(c.obj);
          self.moveRequested = true;
        }
      };
    }
    Ed.EnergyDistributor.registerRequest(new Ed.EnergyContainer(creep),
                                         priority,
                                         creep.carryCapacity - creepCarry,
                                         clb);
  }
}
