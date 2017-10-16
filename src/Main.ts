// Profiler
import * as Profiler from "./libs/Profiler";
import {ErrorMapper} from "./libs/ErrorMapper";

import * as Builder from "./Builder";
import * as Fighter from "./Fighter";
import * as Harvester from "./Harvester";
import * as Upgrader from "./Upgrader";

global.Profiler = Profiler.init();

export function loop() {
  try {
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
  } catch(e) {
    console.log(`Error:\n${ErrorMapper.getMappedStack(e)}`);
  }
}
