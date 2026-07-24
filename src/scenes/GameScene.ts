import Phaser from "phaser";
import { Player } from "../entities/Player";
import { Creature } from "../entities/Creature";
import { PaintBox } from "../entities/PaintBox";
import { LEVEL_1 } from "../config/levels";

export class GameScene extends Phaser.Scene {
  constructor() {
    super("GameScene");
  }

  create(): void {
    this.drawPaperMap();
    this.placeEntities();
    this.showTitle();
  }

  private drawPaperMap(): void {
    const { mapWidth, mapHeight } = LEVEL_1;
    const g = this.add.graphics();
    g.fillStyle(0xffffff, 1);
    g.fillRoundedRect(0, 0, mapWidth, mapHeight, 24);
    g.lineStyle(6, 0x333333, 1);
    g.strokeRoundedRect(3, 3, mapWidth - 6, mapHeight - 6, 24);
  }

  private placeEntities(): void {
    new PaintBox(
      this,
      LEVEL_1.paintBox.x,
      LEVEL_1.paintBox.y,
      LEVEL_1.paintBox.color,
      "placeholder-paintbox"
    );

    for (const c of LEVEL_1.creatures) {
      new Creature(
        this,
        { id: c.id, x: c.startX, y: c.startY, homeX: c.homeX, homeY: c.homeY, color: c.color },
        "placeholder-creature"
      );
    }

    new Player(this, LEVEL_1.mapWidth / 2, LEVEL_1.mapHeight / 2, "placeholder-player");
  }

  private showTitle(): void {
    this.add
      .text(LEVEL_1.mapWidth / 2, 28, "Leni's Farben-Abenteuer – Grundgerüst", {
        fontFamily: "sans-serif",
        fontSize: "20px",
        color: "#333333"
      })
      .setOrigin(0.5, 0);
  }
}
