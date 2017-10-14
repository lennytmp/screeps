var roleHarvester = {

    /** @param {Creep} creep **/
    run: function(creep, src) {
	    if(creep.carry.energy < creep.carryCapacity) {
            var sources = creep.room.find(FIND_SOURCES);
            if(creep.harvest(sources[src]) == ERR_NOT_IN_RANGE) {
                creep.moveTo(sources[src]);
            }
        } else if(Game.spawns['Spawn1'].energy == 300) {
            creep.moveTo(Game.flags['Flag2']);
        }
        else {
            if(creep.transfer(Game.spawns['Spawn1'], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                creep.moveTo(Game.spawns['Spawn1']);
            }
        }
	}
};

module.exports = roleHarvester;
