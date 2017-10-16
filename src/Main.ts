// Profiler
import * as Profiler from "./libs/Profiler";
import {ErrorMapper} from "./libs/ErrorMapper";

import * as Mngr from "./Manager";

import * as Hmngr from "./HarvesterManager";
import * as Fmngr from "./FighterManager";
import * as Umngr from "./UpgraderManager";
import * as Bmngr from "./BuilderManager";

global.Profiler = Profiler.init();

var managers: { [name: string]: Mngr.Manager; } = {
  "harvester": new Hmngr.HarvesterManager(),
  "fighter": new Fmngr.FighterManager(),
  "upgrader": new Umngr.UpgraderManager(),
  "builder": new Bmngr.BuilderManager()
};

export function loop() {
  try {
    //register living creeps
    _.forEach(Game.creeps, function(creep: Creep) {
        _.forEach(managers, function(manager: Mngr.Manager) {
            if (creep.name.startsWith(manager.role)) {
              manager.registerMinion(creep);
            }
        });
    });

    // get orders
    let spawner = Game.spawns['Spawn1'];
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
    /*
    let harvesters: number = 0;
    let builders: number = 0;
    let upgraders: number = 0;
    let fighters: number = 0;
    let src: number = 0;
    _.forEach(Game.creeps, function(creep: Creep) {
        if (creep.name.match(/Harvester/)) {
          if (harvesters < 3) {
            Harvester.run(creep, 0);
          } else if (harvesters < 5) {
            Harvester.run(creep, 3);
          } else {
            Harvester.run(creep, 1);
          }
          harvesters++;
          return true;
        }
        if (creep.name.match(/Builder/)) {
          Builder.run(creep);
          builders++;
          return true;
        }
        if (creep.name.match(/Upgrader/)) {
          Upgrader.run(creep);
          upgraders++;
          return true;
        }
        if (creep.name.match(/Fighter/)) {
          Fighter.run(creep);
          fighters++;
          return true;
        }
        return true;
    });
    if (harvesters < 10) {
      Game.spawns['Spawn1'].spawnCreep([WORK, WORK, CARRY, MOVE],
                                       'Harvester'+ (Math.random()));
    } else if (upgraders <= 2) {
      Game.spawns['Spawn1'].spawnCreep([WORK, CARRY, MOVE],
                                       'Upgrader'+ (Math.random()));
    } else if (builders < 2) {
      Game.spawns['Spawn1'].spawnCreep([WORK, CARRY, CARRY, MOVE],
                                       'Builder'+ (Math.random()));
    } else if (fighters < 1) {
      Game.spawns['Spawn1'].spawnCreep(
        [TOUGH, TOUGH, MOVE, MOVE, RANGED_ATTACK],
        'Fighter'+ (Math.random()));
    }
    */
  } catch(e) {
    console.log(`Error:\n${ErrorMapper.getMappedStack(e)}`);
  }
}

