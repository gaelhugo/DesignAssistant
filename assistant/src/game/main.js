import Game from './core/Game.js';
import LevelBuilder from './core/LevelBuilder.js';

// Use absolute paths for assets in the public directory
const playerTexture = '/assets/images/player.svg';
const platformTexture = '/assets/images/platform.svg';
const enemyTexture = '/assets/images/enemy.svg';
const bonusTexture = '/assets/images/bonus.svg';

/**
 * SuperSimpleMario Game
 * A simple platform game inspired by Super Mario
 */
class SuperSimpleMario extends Game {
  constructor(containerId) {
    super(containerId);
    this.levelBuilder = new LevelBuilder(this);
    this.initLevel();
  }

  /**
   * Initialize the game level
   */
  initLevel() {
    // Create a simple level with our textures
    this.levelBuilder.createSimpleLevel(
      playerTexture,
      platformTexture,
      enemyTexture,
      bonusTexture
    );
  }
}

// Export the game class
export default SuperSimpleMario;
