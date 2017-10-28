type Rect = {
  minY: number,
  minX: number,
  maxY: number,
  maxX: number
};

const ROOM_WIDTH = 50;
const ROOM_HEIGHT = 50;
const RENEWAL_COEF = 2;

export function getArea(pos: RoomPosition, dist: number): Rect {
  return {
    minY: Math.max(0, pos.y - dist),
    minX: Math.max(0, pos.x - dist),
    maxX: Math.min(ROOM_WIDTH-1, pos.x + dist),
    maxY: Math.min(ROOM_HEIGHT-1, pos.y + dist)
  }
}

export function isNearStructure(pos: RoomPosition,
                                structureType: string,
                                distance: number): boolean {
  let area = getArea(pos, distance);
  let resPositions = Game.rooms[pos.roomName].lookForAtArea(LOOK_STRUCTURES,
                                                            area.minY,
                                                            area.minX,
                                                            area.maxY,
                                                            area.maxX,
                                                            true);
  for (let i in resPositions) {
    let resPos = <LookAtResultWithPos>resPositions[i];
    if (resPos.structure!.structureType == structureType) {
      return true;
    }
  }
  return false;
}

export function getAdjacentStructures(pos: RoomPosition, structureType: string, distance: number): Structure[] {
  let ret: Structure[] = [];
  let area = getArea(pos, distance);
  let resPositions = Game.rooms[pos.roomName].lookForAtArea(LOOK_STRUCTURES,
                                                            area.minY,
                                                            area.minX,
                                                            area.maxY,
                                                            area.maxX,
                                                            true);
  for (let i in resPositions) {
    let resPos = <LookAtResultWithPos>resPositions[i];
    if (resPos.structure!.structureType == structureType) {
      ret.push(resPos.structure!);
    }
  }
  return ret;
}

export function isCreep(a: any): a is Creep {
  return (<Creep>a).body !== undefined && (<Creep>a).withdraw !== undefined;
}

export function isResource(a: any): a is Resource {
  return (<Resource>a).resourceType !== undefined && (<Resource>a).amount !== undefined;
}

export function unserializeRoomPosition(p: RoomPosition): RoomPosition {
  return new RoomPosition(p.x, p.y, p.roomName);
}

export function pathToRoomPositions(room: Room, path: PathStep[]): RoomPosition[] {
  let res: RoomPosition[] = [];
  for (let p of path) {
    res.push(new RoomPosition(p.x, p.y, room.name));
  }
  return res;
}

export function check(desc: string, ret: number, acceptable: number[]): number {
  if(ret != OK) {
    if(!_.includes(acceptable, ret)) {
      console.log("Operation "+ desc +" failed: "+ ret);
    }
  }
  return ret;
}

export function posToString(p: RoomPosition): string {
  return p.x +","+ p.y +" ("+ p.roomName +")"
}

export function stringToPos(p: string): RoomPosition {
  var m = /^(\d+),(\d+) \(([^)]+)\)$/.exec(p)!;
  return new RoomPosition(Number(m[1]), Number(m[2]), m[3]);
}

export function getCreepPrice(creep: Creep) {
  return getBodyPrice(getBodyArray(creep.body));
}

export function getBodyPrice(bodyParts: BodyPartConstant[]) {
  let price = 0;
  for (let i = 0; i < bodyParts.length; i++) {
    price += BODYPART_COST[bodyParts[i]];
  }
  return price;
}

export function getBodyArray(bodyStruct: BodyPartDefinition[]): BodyPartConstant[] {
  let result: BodyPartConstant[] = [];
  for (let i in bodyStruct) {
    result.push(bodyStruct[i].type);
  }
  return result;
}

export function shouldBeRenewed(creep: Creep): boolean {
  return creep.room.energyCapacityAvailable < getCreepPrice(creep) * RENEWAL_COEF;
}

