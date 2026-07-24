import Phaser from "phaser";

export function createGroundShadow(
  scene: Phaser.Scene,
  x: number,
  y: number,
  width: number,
  height: number
): Phaser.GameObjects.Ellipse {
  return scene.add.ellipse(x, y, width, height, 0x000000, 0.28);
}
