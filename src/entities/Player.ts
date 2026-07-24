import Phaser from "phaser";
import { createGroundShadow } from "./GroundShadow";

const BRUSH_INDICATOR_OFFSET_Y = -60;
const BRUSH_INDICATOR_RADIUS = 8;
const EMPTY_BRUSH_FILL = 0xffffff;
const EMPTY_BRUSH_STROKE = 0x999999;
const FILLED_BRUSH_STROKE = 0x222222;
const DISPLAY_HEIGHT = 90;
const SHADOW_OFFSET_Y = 33;
const SHADOW_WIDTH = 50;
const SHADOW_HEIGHT = 18;

export class Player extends Phaser.Physics.Arcade.Sprite {
  brushColor: number | null = null;

  private target: Phaser.Math.Vector2 | null = null;
  private readonly speed = 260;
  private readonly stopDistance = 6;
  private readonly brushIndicator: Phaser.GameObjects.Arc;
  private readonly shadow: Phaser.GameObjects.Ellipse;

  constructor(scene: Phaser.Scene, x: number, y: number, texture: string) {
    super(scene, x, y, texture);
    this.setScale(DISPLAY_HEIGHT / this.height);

    this.shadow = createGroundShadow(scene, x, y + SHADOW_OFFSET_Y, SHADOW_WIDTH, SHADOW_HEIGHT);

    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setCollideWorldBounds(true);

    this.brushIndicator = scene.add.circle(x, y + BRUSH_INDICATOR_OFFSET_Y, BRUSH_INDICATOR_RADIUS);
    this.updateBrushIndicator();
  }

  moveTo(x: number, y: number): void {
    this.target = new Phaser.Math.Vector2(x, y);
  }

  setBrushColor(color: number): void {
    if (this.brushColor === color) {
      return;
    }
    this.brushColor = color;
    this.updateBrushIndicator();
    this.pulseBrushIndicator();
  }

  clearBrushColor(): void {
    if (this.brushColor === null) {
      return;
    }
    this.brushColor = null;
    this.updateBrushIndicator();
  }

  preUpdate(time: number, delta: number): void {
    super.preUpdate(time, delta);

    this.shadow.setPosition(this.x, this.y + SHADOW_OFFSET_Y);
    this.brushIndicator.setPosition(this.x, this.y + BRUSH_INDICATOR_OFFSET_Y);

    if (!this.target) {
      return;
    }

    const distance = Phaser.Math.Distance.Between(this.x, this.y, this.target.x, this.target.y);
    if (distance <= this.stopDistance) {
      this.setVelocity(0, 0);
      this.target = null;
      return;
    }

    const angle = Phaser.Math.Angle.Between(this.x, this.y, this.target.x, this.target.y);
    const velocityX = Math.cos(angle) * this.speed;
    this.setVelocity(velocityX, Math.sin(angle) * this.speed);

    if (velocityX < -1) {
      this.setFlipX(true);
    } else if (velocityX > 1) {
      this.setFlipX(false);
    }
  }

  private updateBrushIndicator(): void {
    if (this.brushColor === null) {
      this.brushIndicator.setFillStyle(EMPTY_BRUSH_FILL, 1);
      this.brushIndicator.setStrokeStyle(2, EMPTY_BRUSH_STROKE, 1);
    } else {
      this.brushIndicator.setFillStyle(this.brushColor, 1);
      this.brushIndicator.setStrokeStyle(2, FILLED_BRUSH_STROKE, 1);
    }
  }

  private pulseBrushIndicator(): void {
    this.brushIndicator.setScale(1.6);
    this.scene.tweens.add({
      targets: this.brushIndicator,
      scale: 1,
      duration: 220,
      ease: "Back.easeOut"
    });
  }
}
