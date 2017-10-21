import {ErrorMapper} from "./libs/ErrorMapper";
import * as prf from "./Profiler";

import * as Mngr from "./Manager";

import * as Bmngr from "./BuilderManager";
import * as Cmngr from "./CarrierManager";
import * as Ed from "./EnergyDistributor";
import * as Fmngr from "./FighterManager";
import * as Hmngr from "./HarvesterManager";
import * as Umngr from "./UpgraderManager";

var profile = false;

export function loop() {
  try {
    let profiler = new prf.Profiler();
    let managers: { [name: string]: Mngr.Manager; } = {
      "harvester": new Hmngr.HarvesterManager(),
      "carrier": new Cmngr.CarrierManager(),
      "fighter": new Fmngr.FighterManager(),
      "upgrader": new Umngr.UpgraderManager(),
      "builder": new Bmngr.BuilderManager()
    };
    //register living creeps
    _.forEach(Game.creeps, function(creep: Creep) {
        _.forEach(managers, function(manager: Mngr.Manager) {
            if (creep.name.startsWith(manager.role)) {
              manager.registerMinion(creep);
            }
        });
    });
    profiler.registerEvent("register living creeps");

    let spawner = Game.spawns['Spawn1'];

    // get orders
    let requests: Mngr.SpawnerQueueElement[] = []; //TODO: this should be heap.
    _.forEach(managers, function(manager: Mngr.Manager) {
        requests = requests.concat(
          manager.getSpawnOrders(spawner.room.energyAvailable,
                                 spawner.room.energyCapacityAvailable));
    });
    profiler.registerEvent("orders generation");

    // try building top one priority
    if (requests.length > 0) {
      let order: Mngr.SpawnerQueueElement = requests[0];
      _.forEach(requests, function(request: Mngr.SpawnerQueueElement) {
          if (request.priority < order.priority) {
            order = request;
          }
      });
      if (Mngr.isSpawnRequest(order)) {
        Game.spawns['Spawn1'].spawnCreep(order.parts,
                                         order.role + (""+Math.random()).substring(2));
      } else {
        spawner.renewCreep(order.creep);
      }
    }
    profiler.registerEvent("max order execution");

    // command minions
    _.forEach(managers, function(manager: Mngr.Manager) {
        manager.commandMinions();
    });
    profiler.registerEvent("commanding minions");

    if (profile && profiler.getDuration() > 10) {
      console.log(profiler.getOutput());
    }
  } catch(e) {
    console.log(`Error:\n${ErrorMapper.getMappedStack(e)}`);
  }
}

