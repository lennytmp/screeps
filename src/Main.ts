import * as Profiler from "./libs/Profiler/Profiler";
import * as prf from "./Profiler";

import * as Mngr from "./Manager";

import * as Bmngr from "./BuilderManager";
import * as Cmngr from "./CarrierManager";
import * as Ed from "./EnergyDistributor";
import * as Fmngr from "./FighterManager";
import * as Hmngr from "./HarvesterManager";

var profile = false;

export function loop() {
  try {
    let profiler = new prf.Profiler();
    if (Memory.previousTick+1 < Game.time) {
      console.log("Previous "+ (Game.time-Memory.previousTick) +" tick(s) were interrupted!");
    }
    let managers: { [name: string]: Mngr.Manager; } = {
      "harvester": new Hmngr.HarvesterManager(),
      "carrier": new Cmngr.CarrierManager(),
      "fighter": new Fmngr.FighterManager(),
      "builder": new Bmngr.BuilderManager()
    };
    Ed.EnergyDistributor.init();
    // Gather stats
    if (!Memory.stats) {
      Memory.stats = {}
    }

    Memory.stats['cpu.getUsed'] = Game.cpu.getUsed()
    Memory.stats['cpu.limit'] = Game.cpu.limit
    Memory.stats['cpu.bucket'] = Game.cpu.bucket

    //register living creeps
    for (let i in Game.creeps) {
      let creep = Game.creeps[i];
      if (creep.spawning) {
        continue;
      }
      for (let k in managers) {
        let manager = managers[k];
        if (creep.name.startsWith(manager.role)) {
          manager.registerMinion(creep);
        }
      }
    }
    profiler.registerEvent("register living creeps");

    let spawner = Game.spawns['Spawn1'];

    // register energy market
    _.forEach(managers, function(manager: Mngr.Manager) {
        manager.registerOnEnergyMarket();
    });
    profiler.registerEvent("registering energy requests");

    // get spawn orders
    let requests: Mngr.SpawnerQueueElement[] = [];
    _.forEach(managers, function(manager: Mngr.Manager) {
        requests = requests.concat(
          manager.getSpawnOrders(spawner.room.energyAvailable,
                                 spawner.room.energyCapacityAvailable));
    });
    // copy requests to energy prioritisation
    let highestPriority: number | null = null;
    for (let request of requests) {
      let clb = function(_e: Ed.EnergyContainer): void {
        if (Mngr.isSpawnRequest(request)) {
          spawner.spawnCreep(request.parts, request.role + (""+Math.random()).substring(2));
        } else {
          spawner.renewCreep(request.creep);
        }
      }
      Ed.EnergyDistributor.registerRequest(new Ed.EnergyContainer(spawner),
                                           request.priority,
                                           request.price,
                                           clb);
      if (!highestPriority || request.priority < highestPriority) {
        highestPriority = request.priority;
      }
    }
    // also ask extensions to be filled
    if (highestPriority) {
      let exts = <Structure[]>spawner.room.find(FIND_MY_STRUCTURES);
      for (let struct of exts) {
        if (struct instanceof StructureExtension) {
          if (Ed.EnergyContainer.isEnergyContainerSource(struct)) {
            let lackingEnergy = struct.energyCapacity - struct.energy;
            if (lackingEnergy > 0) {
              Ed.EnergyDistributor.registerRequest(
                new Ed.EnergyContainer(struct),
                highestPriority,
                lackingEnergy);
            }
          }
        }
      }
    }
    profiler.registerEvent("orders generation");

    Ed.EnergyDistributor.marketMatch();
    profiler.registerEvent("market match");

    // command minions
    _.forEach(managers, function(manager: Mngr.Manager) {
        manager.commandMinions();
    });
    profiler.registerEvent("commanding minions");

    Memory.previousTick = Game.time;

    if (profile) {
      console.log(profiler.getOutput());
    }
  } catch(e) {
    let error_string = JSON.stringify(e, Object.getOwnPropertyNames(e));
    let lines = error_string.split("\\n");
    let res = "";
    for (var i = 0; i < lines.length; i++) {
      console.log(lines[i]);
    }
  }
}

