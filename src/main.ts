import Phaser from "phaser";
import { PreloadScene } from "./scenes/PreloadScene";
import { GameScene } from "./scenes/GameScene";
import { LEVEL_1 } from "./config/levels";

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: "game",
  width: LEVEL_1.mapWidth,
  height: LEVEL_1.mapHeight,
  backgroundColor: "#f4f1ea",
  scene: [PreloadScene, GameScene],
  physics: {
    default: "arcade",
    arcade: {
      debug: false
    }
  }
};

const game = new Phaser.Game(config);

if (import.meta.env.DEV) {
  (window as unknown as { game: Phaser.Game }).game = game;
}
