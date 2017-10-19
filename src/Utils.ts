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
    maxX: Math.min(ROOM_WIDTH, pos.x + dist),
    maxY: Math.min(ROOM_HEIGHT, pos.y + dist)
  }
}
