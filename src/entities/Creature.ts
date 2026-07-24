import Phaser from "phaser";

export type CreatureState = "unbemalt" | "bemalt" | "laeuftHeim" | "zuhause";

export interface CreatureConfig {
  id: string;
  x: number;
  y: number;
  homeX: number;
  homeY: number;
  color: number;
}

export class Creature extends Phaser.GameObjects.Sprite {
  id: string;
  state: CreatureState = "unbemalt";
  homeX: number;
  homeY: number;
  color: number;

  constructor(scene: Phaser.Scene, config: CreatureConfig, texture: string) {
    super(scene, config.x, config.y, texture);
    this.id = config.id;
    this.homeX = config.homeX;
    this.homeY = config.homeY;
    this.color = config.color;
    scene.add.existing(this);
  }
}
