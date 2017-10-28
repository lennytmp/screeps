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
    this.getEnergyFromNearbyHarvesters();
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
            if (c.getEnergy(new Ed.EnergyContainer(creep), e) == ERR_NOT_IN_RANGE) {
              creep.moveTo(c.obj);
              self.moveRequested = true;
            }
          });
    }
  }

  getEnergyFromNearbyHarvesters(): void {
    let creep = this.creep;
    let freeSpace = creep.carryCapacity - creep.carry![RESOURCE_ENERGY]!;
    if (freeSpace == 0) {
      return;
    }
    let area = Utils.getArea(creep.pos, 1);
    let resPositions = <LookAtResultWithPos[]>creep.room.lookForAtArea(
        LOOK_CREEPS, area.minY, area.minX, area.maxY, area.maxX, true);
    for (let resPos of resPositions) {
      let target = resPos.creep!;
      if (!target.name.startsWith("harvester") || target.carry[RESOURCE_ENERGY] == 0) {
        continue;
      }
      let energy = Math.min(freeSpace, target.carry![RESOURCE_ENERGY]!);
      (new Ed.EnergyContainer(target)).giveEnergy(new Ed.EnergyContainer(creep), energy);
    }
  }
}
