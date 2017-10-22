import * as Ed from "./EnergyDistributor";
import * as Mngr from "./Manager";
import * as Upgrader from "./Upgrader";

export class UpgraderManager extends Mngr.Manager {

  readonly role = "upgrader";
  priority:number = 10;

  registerOnEnergyMarket(): void {
    for (let i in this.minions) {
      let minion = this.minions[i];
      if (minion.carry.energy == 0) {
        Ed.EnergyDistributor.registerRequest(minion, this.priority, minion.carryCapacity);
      }
    }
  }

  commandMinions(): void {
    for (let i in this.minions) {
      let minion = this.minions[i];
      Upgrader.run(minion);
    }
  }

  getSpawnOrders(_currentEnergy: number, maxEnergy: number): Mngr.SpawnerQueueElement[] {
    if (!Memory.targetRCL) {
      Memory.targetRCL = 1;
    }
    let room = Game.spawns['Spawn1'].room;
    let res: Mngr.SpawnerQueueElement[] = this.getRenewRequests(this.priority);
    let minBodyParts = [WORK, CARRY, MOVE];
    let design = UpgraderManager.getBodyParts(minBodyParts, maxEnergy);
    if (this.minions.length < 1 && room.controller && room.controller.level < Memory.targetRCL) {
      res.push({
        "priority": this.priority,
        "parts": design.body,
        "role": this.role,
        "price": design.price
      });
    }
    res = res.concat(this.getRenewRequests(10));
    return res;
  }
}

