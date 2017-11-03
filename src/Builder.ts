import * as Ed from "./EnergyDistributor";
import * as Utils from "./Utils";

export class Builder {

  creep: Creep;

  assignedEnergyContainer: Ed.EnergyContainer | null = null;
  energyToRequest: number = 0;

  constructor(creep: Creep) {
    this.creep = creep;
    if (creep.memory.working && creep.carry.energy == 0) {
      creep.memory.working = false;
    }
    if (!creep.memory.working && creep.carry.energy == creep.carryCapacity) {
      creep.memory.working = true;
    }
  }

  run(mustUpgrade: boolean): void {
    let creep = this.creep;
    let container = this.assignedEnergyContainer;
    if (container != null) {
      if (creep.pos.isNearTo(container.obj)) {
        container.giveEnergy(new Ed.EnergyContainer(creep), this.energyToRequest);
      } else {
        Utils.moveTo(creep, container.obj.pos);
        return;
      }
    }
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
      Utils.moveTo(creep, target!.pos);
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
        self.assignedEnergyContainer = c;
        self.energyToRequest = e;
      };
    }
    Ed.EnergyDistributor.registerRequest(new Ed.EnergyContainer(creep),
                                         priority,
                                         creep.carryCapacity - creepCarry,
                                         clb);
  }
}
