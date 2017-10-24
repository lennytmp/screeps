import * as Ed from "./EnergyDistributor";

export class Upgrader {

  needEnergy = false;
  sentencedToDie = false;
  moveRequested = false;
  creep: Creep;

  constructor(creep: Creep) {
    this.creep = creep;
    this.sentencedToDie = creep.room.controller !== undefined &&
                          creep.room.controller.level >= Memory.targetRCL;
    if(creep.memory.upgrading && creep.carry.energy == 0) {
      creep.memory.upgrading = false;
    }
    if (!creep.memory.upgrading && creep.carry.energy == creep.carryCapacity) {
      creep.memory.upgrading = true;
    }
    this.needEnergy = !this.sentencedToDie && !creep.memory.upgrading;
  }

  run(): void {
    if (this.moveRequested) {
      return;
    }
    let creep = this.creep;
    let spawner = Game.spawns['Spawn1'];
    if (this.sentencedToDie) {
      if (spawner.recycleCreep(creep) == ERR_NOT_IN_RANGE) {
        creep.moveTo(spawner);
      }
      return;
    }
    if (creep.memory.upgrading) {
      if (creep.room.controller &&
          creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
        creep.moveTo(creep.room.controller);
      }
    }
  }

  registerRequest(priority: number): void {
    if (this.needEnergy) {
      let creep = this.creep;
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
