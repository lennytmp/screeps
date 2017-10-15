export function run(creep: Creep): void {
  let enemies = <Creep[]>creep.room.find(FIND_HOSTILE_CREEPS);
  let isShooting = false;
  _.forEach(<Creep[]>creep.room.find(FIND_HOSTILE_CREEPS),
            function(enemy: Creep) {
    if(creep.rangedAttack(enemy) != ERR_NOT_IN_RANGE) {
      isShooting = true;
    }
  });
  if (!isShooting) {
    creep.move(Math.round(Math.random()*8)); // Simliest patrol
  }
}



