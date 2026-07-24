import Phaser from "phaser";

export class Player extends Phaser.GameObjects.Sprite {
  brushColor: number | null = null;

  constructor(scene: Phaser.Scene, x: number, y: number, texture: string) {
    super(scene, x, y, texture);
    scene.add.existing(this);
  }
}
