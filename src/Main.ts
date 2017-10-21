import {ErrorMapper} from "./libs/ErrorMapper";
import * as prf from "./Profiler";

import * as Mngr from "./Manager";

import * as Hmngr from "./HarvesterManager";
import * as Fmngr from "./FighterManager";
import * as Umngr from "./UpgraderManager";
import * as Bmngr from "./BuilderManager";

var profile = false;

type SpawnerQueueElement = Mngr.SpawnRequest | Mngr.RenewRequest;

function isSpawnRequest(request: SpawnerQueueElement): request is Mngr.SpawnRequest {
  return (<Mngr.SpawnRequest>request).parts !== undefined;
}

export function loop() {
  try {
    let profiler = new prf.Profiler();
    let managers: { [name: string]: Mngr.Manager; } = {
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
    profiler.registerEvent("register living creeps");

    let spawner = Game.spawns['Spawn1'];
    // renew creeps by spawner
    renewCreeps(spawner);
    profiler.registerEvent("renew spawner");

    // get orders
    let requests: SpawnerQueueElement[] = []; //TODO: this should be heap.
    _.forEach(managers, function(manager: Mngr.Manager) {
        requests = requests.concat(
          manager.getSpawnOrders(spawner.room.energyAvailable,
                                 spawner.room.energyCapacityAvailable));
    });
    profiler.registerEvent("orders generation");

    // try building top priority one
    if (requests.length > 0) {
      let order: SpawnerQueueElement = requests[0];
      _.forEach(requests, function(request: SpawnerQueueElement) {
          if (request.priority < order.priority) {
            order = request;
          }
      });
      if (isSpawnRequest(order)) {
        Game.spawns['Spawn1'].spawnCreep(order.parts,
                                         order.role + (Math.random()));
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

