import Phaser from "phaser";
import { Player } from "../entities/Player";
import { Creature } from "../entities/Creature";
import { PaintBox } from "../entities/PaintBox";
import { LEVEL_1 } from "../config/levels";
import { setupProgressDots, fillProgressDot } from "../ui/Hud";

const WORLD_BOUNDS_MARGIN = 40;

export class GameScene extends Phaser.Scene {
  private player!: Player;
  private paintBoxes: PaintBox[] = [];
  private creatures: Creature[] = [];
  private homeCount = 0;
  private levelComplete = false;

  constructor() {
    super("GameScene");
  }

  create(): void {
    this.paintBoxes = [];
    this.creatures = [];
    this.homeCount = 0;
    this.levelComplete = false;

    this.drawPaperMap();
    this.setupPhysicsBounds();
    this.placeEntities();
    setupProgressDots(LEVEL_1.creatures.length);
    this.setupClickToMove();
    this.setupPaintBoxRefill();
    this.setupCreaturePainting();
    this.setupPaintBoxObstacle();
  }

  private drawPaperMap(): void {
    const { mapWidth, mapHeight } = LEVEL_1;
    this.add.image(mapWidth / 2, mapHeight / 2, "background").setDisplaySize(mapWidth, mapHeight);
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
    for (const p of LEVEL_1.paintBoxes) {
      this.paintBoxes.push(new PaintBox(this, p.x, p.y, p.color, "paintpot"));
    }

    for (const c of LEVEL_1.creatures) {
      const creature = new Creature(
        this,
        { id: c.id, x: c.startX, y: c.startY, homeX: c.homeX, homeY: c.homeY, color: c.color },
        "monster"
      );
      creature.on("arrived-home", () => this.handleCreatureArrivedHome(creature.color));
      this.creatures.push(creature);
    }

    this.player = new Player(this, LEVEL_1.mapWidth / 2, LEVEL_1.mapHeight / 2, "leni");
  }

  private setupClickToMove(): void {
    this.input.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
      if (this.levelComplete) {
        return;
      }
      this.player.moveTo(pointer.worldX, pointer.worldY);
      this.showClickMarker(pointer.worldX, pointer.worldY);
    });
  }

  private setupPaintBoxRefill(): void {
    this.physics.add.overlap(this.player, this.paintBoxes, (_player, paintBoxObj) => {
      const paintBox = paintBoxObj as PaintBox;
      this.player.setBrushColor(paintBox.color);
    });
  }

  private setupCreaturePainting(): void {
    this.physics.add.overlap(this.player, this.creatures, (_player, creatureObj) => {
      const creature = creatureObj as Creature;
      if (this.player.brushColor === null || creature.creatureState !== "unbemalt") {
        return;
      }
      creature.paint(this.player.brushColor);
      this.sound.play("paint-sound", { seek: 0.4 });
      this.player.clearBrushColor();
    });
  }

  private setupPaintBoxObstacle(): void {
    this.physics.add.collider(this.creatures, this.paintBoxes);
  }

  private handleCreatureArrivedHome(color: number): void {
    this.sound.play(Phaser.Math.Between(0, 1) === 0 ? "home-sound-1" : "home-sound-2");
    fillProgressDot(this.homeCount, color);

    this.homeCount += 1;
    if (this.homeCount === LEVEL_1.creatures.length) {
      this.showLevelComplete();
    }
  }

  private showLevelComplete(): void {
    this.levelComplete = true;
    const { mapWidth, mapHeight } = LEVEL_1;

    const overlay = this.add.rectangle(mapWidth / 2, mapHeight / 2, mapWidth, mapHeight, 0xffffff, 0);
    this.tweens.add({ targets: overlay, fillAlpha: 0.85, duration: 400 });

    const text = this.add
      .text(mapWidth / 2, mapHeight / 2 - 40, "Alle Freunde sind zuhause!", {
        fontFamily: "sans-serif",
        fontSize: "36px",
        color: "#2f6fed",
        align: "center"
      })
      .setOrigin(0.5)
      .setScale(0)
      .setAlpha(0);

    this.tweens.add({
      targets: text,
      scale: 1,
      alpha: 1,
      duration: 500,
      delay: 200,
      ease: "Back.easeOut"
    });

    this.createRestartButton(mapWidth / 2, mapHeight / 2 + 60);
  }

  private createRestartButton(x: number, y: number): void {
    const width = 240;
    const height = 56;
    const button = this.add.container(x, y).setAlpha(0);

    const background = this.add.rectangle(0, 0, width, height, 0x2f6fed, 1).setStrokeStyle(3, 0x1c4fb0, 1);
    const label = this.add
      .text(0, 0, "Nochmal spielen", {
        fontFamily: "sans-serif",
        fontSize: "22px",
        color: "#ffffff"
      })
      .setOrigin(0.5);

    button.add([background, label]);

    const hitArea = new Phaser.Geom.Rectangle(-width / 2, -height / 2, width, height);
    button.setInteractive({ hitArea, hitAreaCallback: Phaser.Geom.Rectangle.Contains, useHandCursor: true });
    button.on("pointerover", () => background.setFillStyle(0x1c4fb0, 1));
    button.on("pointerout", () => background.setFillStyle(0x2f6fed, 1));
    button.on("pointerdown", () => this.scene.restart());

    this.tweens.add({ targets: button, alpha: 1, duration: 400, delay: 500 });
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
