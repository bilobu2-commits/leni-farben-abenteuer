import Phaser from "phaser";
import { createGroundShadow } from "./GroundShadow";

const DISPLAY_HEIGHT = 72;
const SHADOW_OFFSET_Y = 31;
const SHADOW_WIDTH = 50;
const SHADOW_HEIGHT = 16;

export class PaintBox extends Phaser.Physics.Arcade.Sprite {
  color: number;

  constructor(scene: Phaser.Scene, x: number, y: number, color: number, texture: string) {
    super(scene, x, y, texture);
    this.color = color;
    this.setScale(DISPLAY_HEIGHT / this.height);
    this.setTint(color);

    createGroundShadow(scene, x, y + SHADOW_OFFSET_Y, SHADOW_WIDTH, SHADOW_HEIGHT);

    scene.add.existing(this);
    scene.physics.add.existing(this, true);
  }
}
