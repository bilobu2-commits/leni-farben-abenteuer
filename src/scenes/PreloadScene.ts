import Phaser from "phaser";

export class PreloadScene extends Phaser.Scene {
  constructor() {
    super("PreloadScene");
  }

  create(): void {
    this.generatePlaceholderTextures();
    this.scene.start("GameScene");
  }

  private generatePlaceholderTextures(): void {
    const graphics = this.add.graphics();

    graphics.fillStyle(0xffffff, 1);
    graphics.lineStyle(3, 0x333333, 1);
    graphics.fillCircle(24, 24, 22);
    graphics.strokeCircle(24, 24, 22);
    graphics.generateTexture("placeholder-player", 48, 48);

    graphics.clear();
    graphics.fillStyle(0xffffff, 1);
    graphics.lineStyle(3, 0x333333, 1);
    graphics.fillCircle(20, 20, 18);
    graphics.strokeCircle(20, 20, 18);
    graphics.generateTexture("placeholder-creature", 40, 40);

    graphics.clear();
    graphics.fillStyle(0x8b5a2b, 1);
    graphics.lineStyle(3, 0x3d2817, 1);
    graphics.fillRoundedRect(0, 0, 56, 40, 6);
    graphics.strokeRoundedRect(0, 0, 56, 40, 6);
    graphics.generateTexture("placeholder-paintbox", 56, 40);

    graphics.destroy();
  }
}
