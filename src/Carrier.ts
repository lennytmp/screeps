import * as Ed from "./EnergyDistributor";
import * as Utils from "./Utils";

export class Carrier {

  creep: Creep;
  assigned: boolean;

  constructor(creep: Creep) {
    this.creep = creep;
    if (creep.memory.fetching && creep.carry.energy == creep.carryCapacity) {
      creep.memory.fetching = false;
    } else if (!creep.memory.fetching && creep.carry.energy == 0) {
      creep.memory.fetching = true;
    }
  }

  run(target: Ed.EnergyContainer, e: number): void {
    let creep = this.creep;
    if (target.giveEnergy(new Ed.EnergyContainer(creep), e) == ERR_NOT_IN_RANGE) {
      creep.moveTo(target.obj, {"visualizePathStyle": {
          fill: 'transparent',
          stroke: '#fff',
          lineStyle: 'dashed',
          strokeWidth: .15,
          opacity: .1 
      }});
    }
  }

  registerRequest(): void {
    let creep = this.creep;
    let creepCarry = creep.carry![RESOURCE_ENERGY] || 0;
    if (creepCarry > 0) {
      Ed.EnergyDistributor.registerOffer(new Ed.EnergyContainer(creep), creepCarry);
    }
  }
}
