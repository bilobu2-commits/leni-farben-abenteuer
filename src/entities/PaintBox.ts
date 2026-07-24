import Phaser from "phaser";

export class PaintBox extends Phaser.GameObjects.Sprite {
  color: number;

  constructor(scene: Phaser.Scene, x: number, y: number, color: number, texture: string) {
    super(scene, x, y, texture);
    this.color = color;
    scene.add.existing(this);
  }
}
