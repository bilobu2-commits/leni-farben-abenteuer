import Phaser from "phaser";
import { Player } from "../entities/Player";
import { Creature } from "../entities/Creature";
import { PaintBox } from "../entities/PaintBox";
import { LEVEL_1 } from "../config/levels";

const WORLD_BOUNDS_MARGIN = 40;

export class GameScene extends Phaser.Scene {
  private player!: Player;
  private paintBox!: PaintBox;

  constructor() {
    super("GameScene");
  }

  create(): void {
    this.drawPaperMap();
    this.setupPhysicsBounds();
    this.placeEntities();
    this.showTitle();
    this.setupClickToMove();
    this.setupPaintBoxRefill();
  }

  private drawPaperMap(): void {
    const { mapWidth, mapHeight } = LEVEL_1;
    const g = this.add.graphics();
    g.fillStyle(0xffffff, 1);
    g.fillRoundedRect(0, 0, mapWidth, mapHeight, 24);
    g.lineStyle(6, 0x333333, 1);
    g.strokeRoundedRect(3, 3, mapWidth - 6, mapHeight - 6, 24);
  }

  private setupPhysicsBounds(): void {
    const { mapWidth, mapHeight } = LEVEL_1;
    this.physics.world.setBounds(
      WORLD_BOUNDS_MARGIN,
      WORLD_BOUNDS_MARGIN,
      mapWidth - WORLD_BOUNDS_MARGIN * 2,
      mapHeight - WORLD_BOUNDS_MARGIN * 2
    );
  }

  private placeEntities(): void {
    this.paintBox = new PaintBox(
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

    this.player = new Player(this, LEVEL_1.mapWidth / 2, LEVEL_1.mapHeight / 2, "placeholder-player");
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

  private setupClickToMove(): void {
    this.input.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
      this.player.moveTo(pointer.worldX, pointer.worldY);
      this.showClickMarker(pointer.worldX, pointer.worldY);
    });
  }

  private setupPaintBoxRefill(): void {
    this.physics.add.overlap(this.player, this.paintBox, () => {
      this.player.setBrushColor(this.paintBox.color);
    });
  }

  private showClickMarker(x: number, y: number): void {
    const marker = this.add.circle(x, y, 10, 0x2f6fed, 0.5);
    this.tweens.add({
      targets: marker,
      radius: 24,
      alpha: 0,
      duration: 350,
      ease: "Cubic.easeOut",
      onComplete: () => marker.destroy()
    });
  }
}
