// Profiler
import * as Profiler from "./libs/Profiler";
import {ErrorMapper} from "./libs/ErrorMapper";

import * as Mngr from "./Manager";

import * as Hmngr from "./HarvesterManager";
import * as Fmngr from "./FighterManager";
import * as Umngr from "./UpgraderManager";
import * as Bmngr from "./BuilderManager";

global.Profiler = Profiler.init();

export function loop() {
  try {
    var managers: { [name: string]: Mngr.Manager; } = {
      "harvester": new Hmngr.HarvesterManager(),
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

    let spawner = Game.spawns['Spawn1'];
    // renew creeps by spawner
    renewCreeps(spawner);

    // get orders
    let requests: Mngr.SpawnRequest[] = []; //TODO: this should be heap.
    _.forEach(managers, function(manager: Mngr.Manager) {
        requests = requests.concat(
          manager.getSpawnOrders(spawner.energy, spawner.energyCapacity));
    });

    // try building top priority one
    if (requests.length > 0) {
      let order: Mngr.SpawnRequest = requests[0];
      _.forEach(requests, function(request: Mngr.SpawnRequest) {
          if (request.priority < order.priority) {
            order = request;
          }
      });
      Game.spawns['Spawn1'].spawnCreep(order.parts,
                                       order.role + (Math.random()));
    }

    // command minions
    _.forEach(managers, function(manager: Mngr.Manager) {
        manager.commandMinions();
    });

  } catch(e) {
    console.log(`Error:\n${ErrorMapper.getMappedStack(e)}`);
  }
}

function renewCreeps(spawner: Spawn): void {
  let creepsAround = spawner.room.lookForAtArea(LOOK_CREEPS,
                             spawner.pos.y - 1,
                             spawner.pos.x - 1,
                             spawner.pos.y + 1,
                             spawner.pos.x + 1,
                             true);
  _.forEach(creepsAround, function(neighbor: LookAtResultWithPos) {
      if (neighbor.creep && neighbor.creep.ticksToLive < 1000) {
        spawner.renewCreep(neighbor.creep);
      }
  });
}

