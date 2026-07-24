import Phaser from "phaser";

export class PaintBox extends Phaser.Physics.Arcade.Sprite {
  color: number;

  constructor(scene: Phaser.Scene, x: number, y: number, color: number, texture: string) {
    super(scene, x, y, texture);
    this.color = color;
    scene.add.existing(this);
    scene.physics.add.existing(this, true);
  }
}
