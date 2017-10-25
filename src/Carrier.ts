import * as Ed from "./EnergyDistributor";
import * as Utils from "./Utils";

export class Carrier {

  creep: Creep;
  assigned: boolean;
  moveRequested: boolean = false;

  constructor(creep: Creep) {
    this.creep = creep;
    if (creep.memory.fetching && creep.carry.energy == creep.carryCapacity) {
      creep.memory.fetching = false;
    } else if (!creep.memory.fetching && creep.carry.energy == 0) {
      creep.memory.fetching = true;
    }
  }

  run(target: Ed.EnergyContainer, e: number): void {
    if (this.moveRequested) {
      return;
    }
    let creep = this.creep;
    if (target.giveEnergy(new Ed.EnergyContainer(creep), e) == ERR_NOT_IN_RANGE) {
      creep.moveTo(target.obj);
    }
  }

  registerRequest(): void {
    let creep = this.creep;
    let creepCarry = creep.carry![RESOURCE_ENERGY] || 0;
    var self = this;
    if (creepCarry > 0) {
      Ed.EnergyDistributor.registerOffer(
          new Ed.EnergyContainer(creep),
          creepCarry,
          function(c: Ed.EnergyContainer, e: number) {
            if (Utils.isCreep(c.obj) && c.obj.name.startsWith("harvester")) {
              e = c.obj.carry[RESOURCE_ENERGY]!;
            }
            if (c.getEnergy(new Ed.EnergyContainer(creep), e) == ERR_NOT_IN_RANGE) {
              creep.moveTo(c.obj);
              self.moveRequested = true;
            }
          });
    }
  }
}
