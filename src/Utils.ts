type Rect = {
  minY: number,
  minX: number,
  maxY: number,
  maxX: number
};

const ROOM_WIDTH = 50;
const ROOM_HEIGHT = 50;

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

export function getBodyArray(bodyStruct: BodyPartDefinition[]): string[] {
  let result: string[] = [];
  for (let i in bodyStruct) {
    result.push(bodyStruct[i].type);
  }
  return result;
}

export function isCreep(a: any): a is Creep {
  return (<Creep>a).body !== undefined && (<Creep>a).withdraw !== undefined;
}

export function unserializeRoomPosition(p: RoomPosition): RoomPosition {
  return new RoomPosition(p.x, p.y, p.roomName);
}
