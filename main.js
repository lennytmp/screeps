var roleHarvester = require('role.harvester');

var attack = true;

module.exports.loop = function () {

    var h = 0;
    var f = 0;
    var t = 0;
    for(var name in Game.creeps) {
        var creep = Game.creeps[name];
        t++;
        if(name.match(/Fighter/)) {
            f++;
            if(!attack) {
                creep.moveTo(Game.flags['Flag1']);
            } else {
                var tgt = creep.room.find(FIND_HOSTILE_CREEPS);
                if(creep.rangedAttack(tgt[0]) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(tgt[0]);
                }
            }
            continue;
        }
        if(h == 10) {
            if(creep.carry.energy > 0) {
                var tgt = creep.room.controller;
                if(creep.upgradeController(tgt) == ERR_NOT_IN_RANGE) {
                    if(creep.carry.energy == creep.carryCapacity) {
                        creep.moveTo(tgt);
                    } else {
                        roleHarvester.run(creep, 0);
                    }
                }
            } else {
                roleHarvester.run(creep, 0);
            }
        } else if(h < 3) {
            roleHarvester.run(creep, 0);
        } else if(h < 5) {
            roleHarvester.run(creep, 3);
        } else {
            roleHarvester.run(creep, 1);
        }
        h++;
    }
    
    if(f >= 20) {
        attack = true;
    }
    
    if(h < 20) {
        Game.spawns['Spawn1'].spawnCreep( [WORK, CARRY, MOVE], 'Harvester'+ (Math.random()));
    } else {
        Game.spawns['Spawn1'].spawnCreep( [RANGED_ATTACK, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, MOVE], 'Fighter '+ (Math.random()));
    }
}

