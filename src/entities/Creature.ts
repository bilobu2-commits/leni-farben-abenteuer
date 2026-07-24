import Phaser from "phaser";
import { createGroundShadow } from "./GroundShadow";

export type CreatureState = "unbemalt" | "bemalt" | "laeuftHeim" | "zuhause";

export interface CreatureConfig {
  id: string;
  x: number;
  y: number;
  homeX: number;
  homeY: number;
  color: number;
}

const WANDER_SPEED = 70;
const HOME_SPEED = 130;
const HOME_ARRIVAL_DISTANCE = 10;
const WANDER_DIRECTION_CHANGE_MIN = 1200;
const WANDER_DIRECTION_CHANGE_MAX = 2600;
const DISPLAY_HEIGHT = 70;
const SHADOW_OFFSET_Y = 27;
const SHADOW_WIDTH = 38;
const SHADOW_HEIGHT = 14;

export class Creature extends Phaser.Physics.Arcade.Sprite {
  readonly id: string;
  creatureState: CreatureState = "unbemalt";
  readonly homeX: number;
  readonly homeY: number;
  readonly color: number;

  private readonly baseScale: number;
  private readonly shadow: Phaser.GameObjects.Ellipse;
  private wanderTimer?: Phaser.Time.TimerEvent;

  constructor(scene: Phaser.Scene, config: CreatureConfig, texture: string) {
    super(scene, config.x, config.y, texture);
    this.id = config.id;
    this.homeX = config.homeX;
    this.homeY = config.homeY;
    this.color = config.color;

    this.baseScale = DISPLAY_HEIGHT / this.height;
    this.setScale(this.baseScale);

    this.shadow = createGroundShadow(
      scene,
      config.x,
      config.y + SHADOW_OFFSET_Y,
      SHADOW_WIDTH,
      SHADOW_HEIGHT
    );

    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setCollideWorldBounds(true);
    this.setBounce(1, 1);

    this.startWandering();
  }

  paint(color: number): void {
    if (this.creatureState !== "unbemalt") {
      return;
    }
    this.setTint(color);
    this.creatureState = "bemalt";
    this.wanderTimer?.remove();
    this.walkHome();
  }

  preUpdate(time: number, delta: number): void {
    super.preUpdate(time, delta);

    this.shadow.setPosition(this.x, this.y + SHADOW_OFFSET_Y);

    if (this.creatureState !== "laeuftHeim") {
      return;
    }

    const distance = Phaser.Math.Distance.Between(this.x, this.y, this.homeX, this.homeY);
    if (distance <= HOME_ARRIVAL_DISTANCE) {
      this.arriveHome();
      return;
    }

    const angle = Phaser.Math.Angle.Between(this.x, this.y, this.homeX, this.homeY);
    this.setVelocity(Math.cos(angle) * HOME_SPEED, Math.sin(angle) * HOME_SPEED);
  }

  private startWandering(): void {
    this.pickNewWanderDirection();
    this.scheduleNextWanderDirection();
  }

  private scheduleNextWanderDirection(): void {
    this.wanderTimer = this.scene.time.delayedCall(
      Phaser.Math.Between(WANDER_DIRECTION_CHANGE_MIN, WANDER_DIRECTION_CHANGE_MAX),
      () => {
        this.pickNewWanderDirection();
        this.scheduleNextWanderDirection();
      }
    );
  }

  private pickNewWanderDirection(): void {
    if (this.creatureState !== "unbemalt") {
      return;
    }
    const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
    this.setVelocity(Math.cos(angle) * WANDER_SPEED, Math.sin(angle) * WANDER_SPEED);
  }

  private walkHome(): void {
    this.creatureState = "laeuftHeim";
    this.setCollideWorldBounds(false);
    this.setBounce(0, 0);
    const angle = Phaser.Math.Angle.Between(this.x, this.y, this.homeX, this.homeY);
    this.setVelocity(Math.cos(angle) * HOME_SPEED, Math.sin(angle) * HOME_SPEED);
  }

  private arriveHome(): void {
    this.creatureState = "zuhause";
    this.setVelocity(0, 0);
    this.body!.enable = false;

    this.scene.tweens.add({
      targets: this,
      scale: { from: this.baseScale, to: this.baseScale * 1.3 },
      yoyo: true,
      duration: 220,
      ease: "Sine.easeOut",
      onComplete: () => this.disappear()
    });
  }

  private disappear(): void {
    this.emit("arrived-home", this);

    this.scene.tweens.add({
      targets: this,
      alpha: 0,
      scale: 0,
      duration: 300,
      ease: "Cubic.easeIn",
      onComplete: () => this.destroy()
    });

    this.scene.tweens.add({
      targets: this.shadow,
      alpha: 0,
      duration: 300,
      ease: "Cubic.easeIn",
      onComplete: () => this.shadow.destroy()
    });
  }
}
