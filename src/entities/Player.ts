import Phaser from "phaser";

export class Player extends Phaser.Physics.Arcade.Sprite {
  brushColor: number | null = null;

  private target: Phaser.Math.Vector2 | null = null;
  private readonly speed = 260;
  private readonly stopDistance = 6;

  constructor(scene: Phaser.Scene, x: number, y: number, texture: string) {
    super(scene, x, y, texture);
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setCollideWorldBounds(true);
  }

  moveTo(x: number, y: number): void {
    this.target = new Phaser.Math.Vector2(x, y);
  }

  preUpdate(time: number, delta: number): void {
    super.preUpdate(time, delta);

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
    this.setVelocity(Math.cos(angle) * this.speed, Math.sin(angle) * this.speed);
  }
}
