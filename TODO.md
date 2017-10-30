# TODO list

1. Make screeps move away from if they are blocking road.
1. Place extensions along the roads.
1. Put containers on mining positions.
1. Continue building extensions as we progress through RCL.
1. Repair stuff with builders.
1. If unit has to die because it's too old - let them go to spawn and donate resources.
1. Plan building a tower at some nice location.
1. Implement tower logic.
1. Make Carriers fill up completely before starting to give away their energy
1. Consider making the Manager return which creep-configurations it wants, and let the generic Manager spawn/kill based on that.

# Known bugs

1. Mining positions could be on swamps as well (currently on plain only).

# Pathfinding proposal

## Handling creep collisions

As of now we build the path taking into account other creeps. Because of this
creeps sometimes step off the roads and rarely do that in time since nearly all
creeps are moving. We could totally ignore other creeps when building paths
since if two creeps move at the same time they will just path through each
other. However there are cases when creeps are standing on the way, to be exact
these cases are:
* Builders who are busy upgding controller / building a construction site.  If
  we have static paths that are well known and limited (e.g. from sources to
  the spawner), we could ask builders to avoid standing on those paths. In
  specific edge cases this could lead to inability of builders to finish
  construction site and stall the game completely. Another approach is to
  calculate upgrading/building positions and retreat to blocking the roads only
  if there is no other option. This is more complicated to implement and would
  later be needed again for repairs.
* Tired creeps that are waiting for their fatigue to go down to zero before
  next move. We could just wait out until they are fully rested and then pass
  through them. Going around them would most likely require more ticks anyway.

Another more generic solution is to use `_move.path` to establish where is the
creep going next, check that location for other creeps, their fatigue and/or
intentions. In case they are not going to move anywhere - rebuild the path.

## Caching the paths

### Option 1: paths to/from sources

We could save the paths from enrgy sources the Spawner which should attribute
for a large part of paths used by creeps. Everyone who needs to get to the
spawner from the source reuses them by default.

### Option 2: generic map

This is a generalisation over Option1. We could have a persitent map in Memory
so that for each Pair(from, to) we store the path. For each path we store the
last time it was used. There should be garbage collector that removes paths
that were last used log time ago (e.g. > 1000 ticks ago).

Having this map allows us to use the same mechanics that are used by the game
engine. We place this path into `creep.memory._move.path` and function `moveTo`
does everything else.

[Here](https://github.com/screeps/engine/blob/b52164089564d1dc8a7e894835258f9a954cd37f/src/utils.js#L958)
we can see path serialization / deserialization functions.

## Summary

Having more generic algorithms seems more preferable as they should work
correctly on all map types. Therefore we should go for a generic map and creeps
checking the state of the creeps on their way.

