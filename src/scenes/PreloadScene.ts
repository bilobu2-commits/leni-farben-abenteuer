import Phaser from "phaser";

export class PreloadScene extends Phaser.Scene {
  constructor() {
    super("PreloadScene");
  }

  preload(): void {
    this.load.image("leni", "sprites/leni.png");
    this.load.image("monster", "sprites/monster.png");
    this.load.image("paintpot", "sprites/paintpot.png");
    this.load.image("background", "backgrounds/canvas.jpg");

    this.load.audio("paint-sound", "audio/anmalsound.mp3");
    this.load.audio("home-sound-1", "audio/heimkommen1.mp3");
    this.load.audio("home-sound-2", "audio/heimkommen2.mp3");
  }

  create(): void {
    this.scene.start("GameScene");
  }
}
