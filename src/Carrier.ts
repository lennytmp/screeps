import * as Ed from "./EnergyDistributor";
import * as Utils from "./Utils";

export class Carrier {

  creep: Creep;
  assigned: boolean;
  moveRequested: boolean = false;

  target: Ed.EnergyContainer | null = null;
  offerEnergy: number = 0;

  constructor(creep: Creep) {
    this.creep = creep;
    if (creep.memory.fetching && creep.carry.energy == creep.carryCapacity) {
      creep.memory.fetching = false;
    } else if (!creep.memory.fetching && creep.carry.energy == 0) {
      creep.memory.fetching = true;
    }
  }

  run(): void {
    let creep = this.creep;
    if (this.target == null) {
      return;
    }
    let myContainer = new Ed.EnergyContainer(creep);
    if (this.offerEnergy > 0) {
      if (myContainer.giveEnergy(this.target, this.offerEnergy) == ERR_NOT_IN_RANGE) {
        Utils.moveTo(creep, this.target.obj.pos);
      }
    } else {
      if (this.target.giveEnergy(myContainer, -this.offerEnergy) == ERR_NOT_IN_RANGE) {
        Utils.moveTo(creep, this.target.obj.pos);
      }
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
        function(c: Ed.EnergyContainer, e: number): boolean {
          if (self.target != null) {
            return false;
          }
          self.target = c;
          self.offerEnergy = e;
          return true;
        }
      );
    }
  }
}
