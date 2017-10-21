export function run(creep: Creep): void {
  let isShooting = false;
  let enemies = <Creep[]>creep.room.find(FIND_HOSTILE_CREEPS);
  _.forEach(enemies, function(enemy: Creep) {
    if(creep.rangedAttack(enemy) != ERR_NOT_IN_RANGE) {
      isShooting = true;
    }
  });
  if (!isShooting) {
    creep.move(Math.floor(Math.random()*8)); // Simpliest patrol
  }
}
