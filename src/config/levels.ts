export interface LevelConfig {
  label: string;
  mapWidth: number;
  mapHeight: number;
  paintBoxes: { x: number; y: number; color: number }[];
  creatures: {
    id: string;
    startX: number;
    startY: number;
    homeX: number;
    homeY: number;
    color: number;
  }[];
}

export const LEVEL_1: LevelConfig = {
  label: "Level 1",
  mapWidth: 960,
  mapHeight: 640,
  paintBoxes: [{ x: 60, y: 320, color: 0x2f6fed }],
  creatures: [
    { id: "creature-1", startX: 300, startY: 150, homeX: 900, homeY: 60, color: 0x2f6fed },
    { id: "creature-2", startX: 520, startY: 260, homeX: 860, homeY: 60, color: 0x2f6fed },
    { id: "creature-3", startX: 420, startY: 460, homeX: 900, homeY: 100, color: 0x2f6fed },
    { id: "creature-4", startX: 650, startY: 520, homeX: 860, homeY: 100, color: 0x2f6fed },
    { id: "creature-5", startX: 700, startY: 150, homeX: 880, homeY: 140, color: 0x2f6fed }
  ]
};
