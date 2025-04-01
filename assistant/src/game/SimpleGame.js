/**
 * SimpleGame - A platform game class that separates game engine from design elements
 */
import { GameEngine } from './GameEngine.js';
import { Player } from './elements/Player.js';
import { Enemy } from './elements/Enemy.js';
import { Platform } from './elements/Platform.js';
import { Bonus } from './elements/Bonus.js';
import { Background } from './elements/Background.js';

export class SimpleGame {
  constructor(gameContainerId) {
    // Game engine
    this.engine = new GameEngine();
    
    // DOM elements
    this.gameContainer = document.getElementById(gameContainerId);
    this.levelContainer = null;
    this.scoreElement = null;
    
    // Background manager
    this.background = null;
  }

  show() {
    this.gameContainer.classList.remove("hidden");
  }

  hide() {
    this.gameContainer.classList.add("hidden");
  }

  /**
   * Initialize the game
   */
  initGame() {
    console.log("Initializing game...");

    // Set up game container
    this.gameContainer.style.overflow = "hidden";
    this.gameContainer.style.backgroundColor = "#87CEEB";

    // Create level container
    this.levelContainer = document.createElement("div");
    this.levelContainer.style.position = "absolute";
    this.levelContainer.style.width = `${this.engine.LEVEL_WIDTH}px`;
    this.levelContainer.style.height = `${this.engine.LEVEL_HEIGHT}px`;
    this.levelContainer.style.bottom = "0";
    this.levelContainer.style.left = "0";
    this.gameContainer.appendChild(this.levelContainer);

    // Create score display
    this.scoreElement = document.createElement("div");
    this.scoreElement.style.position = "absolute";
    this.scoreElement.style.top = "10px";
    this.scoreElement.style.left = "10px";
    this.scoreElement.style.fontSize = "24px";
    this.scoreElement.style.fontWeight = "bold";
    this.scoreElement.style.color = "white";
    this.scoreElement.style.textShadow = "2px 2px 4px rgba(0, 0, 0, 0.5)";
    this.scoreElement.textContent = "Score: 0";
    this.gameContainer.appendChild(this.scoreElement);

    // Initialize event listeners
    this.engine.initEventListeners();

    // Set up callbacks
    this.engine.setScoreUpdateCallback((score) => {
      this.scoreElement.textContent = `Score: ${score}`;
    });
    
    this.engine.setGameOverCallback((score) => {
      this.showGameOverScreen(score);
    });
    
    this.engine.setCameraUpdateCallback(() => {
      this.updateCamera();
    });
    
    this.engine.setGenerateNewChunksCallback(() => {
      this.generateNewLevelChunks();
    });

    // Create background
    this.background = new Background(this.levelContainer, this.engine.LEVEL_WIDTH);
    this.background.createBackground();

    // Create level
    this.createLevel();

    // Start game loop
    this.engine.lastTimestamp = performance.now();
    this.engine.animationFrameId = requestAnimationFrame(this.engine.gameLoop.bind(this.engine));

    console.log("Game initialized successfully");
  }

  /**
   * Create the initial level
   */
  createLevel() {
    // Create a continuous ground with occasional gaps
    for (let x = 0; x < this.engine.LEVEL_WIDTH; x += 100) {
      // Create occasional gaps (15% chance) but not at the start
      if (Math.random() < 0.15 && x > 400) {
        x += 100; // Skip this section to create a gap
        continue;
      }
      this.createGameObject(x, 550, 100, 16, "platform");
    }

    // Create a simple, clear pattern of platforms
    // Starting area - a safe platform to begin
    this.createGameObject(50, 500, 150, 16, "platform");

    // First section - simple jumps with increasing height
    this.createGameObject(250, 500, 150, 16, "platform");
    this.createGameObject(450, 450, 150, 16, "platform");
    this.createGameObject(650, 450, 150, 16, "platform");
    this.createGameObject(850, 400, 150, 16, "platform");
    this.createGameObject(1050, 400, 150, 16, "platform");

    // Second section - platforms at consistent heights
    this.createGameObject(1300, 450, 150, 16, "platform");
    this.createGameObject(1500, 450, 150, 16, "platform");
    this.createGameObject(1700, 400, 150, 16, "platform");
    this.createGameObject(1900, 400, 150, 16, "platform");
    this.createGameObject(2100, 450, 150, 16, "platform");
    this.createGameObject(2300, 450, 150, 16, "platform");
    this.createGameObject(2500, 400, 150, 16, "platform");
    this.createGameObject(2700, 400, 150, 16, "platform");

    // Add just a few floating platforms for bonuses (not too many)
    this.createGameObject(600, 300, 100, 16, "platform");
    this.createGameObject(1200, 300, 100, 16, "platform");
    this.createGameObject(1800, 300, 100, 16, "platform");
    this.createGameObject(2400, 300, 100, 16, "platform");

    // Place enemies strategically (not on every platform)
    // First section - just a couple of enemies to get started
    this.createGameObject(480, 418, 32, 32, "enemy"); // On platform at 450, 450
    this.createGameObject(880, 368, 32, 32, "enemy"); // On platform at 850, 400

    // Second section - more enemies but still manageable
    this.createGameObject(1530, 418, 32, 32, "enemy"); // On platform at 1500, 450
    this.createGameObject(1930, 368, 32, 32, "enemy"); // On platform at 1900, 400
    this.createGameObject(2330, 418, 32, 32, "enemy"); // On platform at 2300, 450
    this.createGameObject(2730, 368, 32, 32, "enemy"); // On platform at 2700, 400

    // Ground enemies - just a few, spaced out
    this.createGameObject(350, 518, 32, 32, "enemy");
    this.createGameObject(1200, 518, 32, 32, "enemy");
    this.createGameObject(2000, 518, 32, 32, "enemy");

    // Add bonuses in strategic locations
    // On floating platforms
    this.createGameObject(650, 270, 24, 24, "bonus");
    this.createGameObject(1250, 270, 24, 24, "bonus");
    this.createGameObject(1850, 270, 24, 24, "bonus");
    this.createGameObject(2450, 270, 24, 24, "bonus");

    // Above regular platforms
    this.createGameObject(300, 450, 24, 24, "bonus");
    this.createGameObject(750, 370, 24, 24, "bonus");
    this.createGameObject(1400, 400, 24, 24, "bonus");
    this.createGameObject(2200, 400, 24, 24, "bonus");

    // Create player
    this.engine.player = this.createGameObject(70, 468, 32, 32, "player");
  }

  /**
   * Create a game object
   * @param {number} x - X position
   * @param {number} y - Y position
   * @param {number} width - Width
   * @param {number} height - Height
   * @param {string} type - Type of game object
   * @returns {Object} - Created game object
   */
  createGameObject(x, y, width, height, type) {
    console.log(`Creating ${type} at (${x}, ${y})`);

    let gameObject;

    // Create the appropriate game object based on type
    switch (type) {
      case "player":
        gameObject = new Player(x, y, width, height);
        break;
      case "enemy":
        gameObject = new Enemy(x, y, width, height);
        break;
      case "platform":
        gameObject = new Platform(x, y, width, height);
        break;
      case "bonus":
        gameObject = new Bonus(x, y, width, height);
        break;
      default:
        console.error(`Unknown game object type: ${type}`);
        return null;
    }

    // Create DOM element
    const element = gameObject.createDOMElement();
    
    // Add to level container
    this.levelContainer.appendChild(element);

    // Add to appropriate collections in the engine
    this.engine.gameObjects.push(gameObject);

    if (type === "platform") {
      this.engine.platforms.push(gameObject);
    } else if (type === "enemy") {
      this.engine.enemies.push(gameObject);
    } else if (type === "bonus") {
      this.engine.bonuses.push(gameObject);
    }

    return gameObject;
  }

  /**
   * Update camera position to follow player
   */
  updateCamera() {
    if (!this.engine.player) return;

    // Calculate camera position (center player in view)
    const targetX = -this.engine.player.x + 400 - this.engine.player.width / 2;

    // Limit camera to not show beyond the left edge of the level
    this.engine.cameraX = Math.min(0, targetX);

    // Apply camera position to level container
    this.levelContainer.style.transform = `translateX(${this.engine.cameraX}px)`;

    // Update background parallax
    this.background.updateCamera(this.engine.cameraX);
  }

  /**
   * Generate new level chunks
   */
  generateNewLevelChunks() {
    // Check if player has reached the end of the current level
    if (
      this.engine.player.x + this.engine.player.width >
      this.engine.LEVEL_WIDTH - this.engine.CHUNK_SIZE
    ) {
      // Generate new level chunk
      const newChunk = this.generateLevelChunk(
        this.engine.LEVEL_WIDTH,
        this.engine.LEVEL_HEIGHT
      );
      
      // Update level width
      this.engine.LEVEL_WIDTH += this.engine.CHUNK_SIZE;
      this.levelContainer.style.width = `${this.engine.LEVEL_WIDTH}px`;

      // Extend background
      this.background.extendBackground(
        this.engine.LEVEL_WIDTH - this.engine.CHUNK_SIZE,
        this.engine.LEVEL_WIDTH
      );

      // Add new platforms, enemies, and bonuses to the level
      for (const platform of newChunk.platforms) {
        this.engine.platforms.push(platform);
        this.engine.gameObjects.push(platform);
      }
      for (const enemy of newChunk.enemies) {
        this.engine.enemies.push(enemy);
        this.engine.gameObjects.push(enemy);
      }
      for (const bonus of newChunk.bonuses) {
        this.engine.bonuses.push(bonus);
        this.engine.gameObjects.push(bonus);
      }
    }
  }

  /**
   * Generate a new level chunk
   * @param {number} startX - Starting X position
   * @param {number} height - Level height
   * @returns {Object} - Generated chunk with platforms, enemies, and bonuses
   */
  generateLevelChunk(startX, height) {
    const platforms = [];
    const enemies = [];
    const bonuses = [];

    // Create ground with gaps
    for (let x = startX; x < startX + this.engine.CHUNK_SIZE; x += 64) {
      // Create gaps in the ground for challenge (approximately 20% chance of gap)
      if (Math.random() < 0.2) {
        // Skip creating a platform here to create a gap
        x += 64; // Make the gap at least 2 platforms wide
        continue;
      }
      platforms.push(this.createGameObject(x, 550, 64, 16, "platform"));
    }

    // Create a path of platforms that can be traversed
    // Start with platforms at different heights
    const platformHeights = [450, 400, 350, 300, 250];
    let lastPlatformX = startX + 100;

    for (let i = 0; i < 8; i++) {
      // Select a random height for this platform
      const height =
        platformHeights[Math.floor(Math.random() * platformHeights.length)];

      // Create a platform
      const platformWidth = Math.random() * 100 + 100; // Between 100 and 200
      const platform = this.createGameObject(
        lastPlatformX,
        height,
        platformWidth,
        16,
        "platform"
      );
      platforms.push(platform);

      // Add an enemy on some platforms (30% chance)
      if (Math.random() < 0.3) {
        const enemy = this.createGameObject(
          lastPlatformX + platformWidth / 2 - 16,
          height - 32,
          32,
          32,
          "enemy"
        );
        enemies.push(enemy);
      }

      // Add a bonus above some platforms (40% chance)
      if (Math.random() < 0.4) {
        const bonus = this.createGameObject(
          lastPlatformX + platformWidth / 2 - 12,
          height - 50,
          24,
          24,
          "bonus"
        );
        bonuses.push(bonus);
      }

      // Calculate the next platform position
      // Ensure it's reachable with a jump (use MAX_JUMP_HEIGHT)
      const jumpDistance = Math.random() * 150 + 50; // Between 50 and 200
      lastPlatformX += platformWidth + jumpDistance;
    }

    // Add some floating platforms with bonuses
    for (let i = 0; i < 3; i++) {
      const x = startX + Math.random() * (this.engine.CHUNK_SIZE - 100);
      const y = 150 + Math.random() * 100; // Higher platforms
      const width = 80;

      const platform = this.createGameObject(x, y, width, 16, "platform");
      platforms.push(platform);

      // Add a bonus on each floating platform
      const bonus = this.createGameObject(
        x + width / 2 - 12,
        y - 40,
        24,
        24,
        "bonus"
      );
      bonuses.push(bonus);
    }

    // Add a few more enemies on the ground
    for (let i = 0; i < 3; i++) {
      // Find a suitable platform to place the enemy on
      const availablePlatforms = platforms.filter((p) => p.y === 550); // Ground platforms

      if (availablePlatforms.length > 0) {
        // Choose a random platform from available ones
        const platform =
          availablePlatforms[
            Math.floor(Math.random() * availablePlatforms.length)
          ];
        // Place enemy on top of the platform
        const x = platform.x + Math.random() * (platform.width - 32);
        const enemy = this.createGameObject(
          x,
          platform.y - 32,
          32,
          32,
          "enemy"
        );
        enemies.push(enemy);
      }
    }

    return { platforms, enemies, bonuses };
  }

  /**
   * Show game over screen
   * @param {number} score - Final score
   */
  showGameOverScreen(score) {
    // Create game over screen
    const gameOverElement = document.createElement("div");
    gameOverElement.style.position = "absolute";
    gameOverElement.style.width = "100%";
    gameOverElement.style.height = "100%";
    gameOverElement.style.backgroundColor = "rgba(0, 0, 0, 0.7)";
    gameOverElement.style.color = "white";
    gameOverElement.style.display = "flex";
    gameOverElement.style.flexDirection = "column";
    gameOverElement.style.justifyContent = "center";
    gameOverElement.style.alignItems = "center";
    gameOverElement.style.fontSize = "24px";
    gameOverElement.style.zIndex = "100";

    gameOverElement.innerHTML = `
      <h1>Game Over</h1>
      <p>Your score: ${score}</p>
      <button id="restart-button">Play Again</button>
    `;

    this.gameContainer.appendChild(gameOverElement);

    // Add restart button functionality
    document.getElementById("restart-button").addEventListener("click", () => {
      this.restartGame();
      this.gameContainer.removeChild(gameOverElement);
    });
  }

  /**
   * Restart the game
   */
  restartGame() {
    // Clear all game objects
    for (const gameObject of this.engine.gameObjects) {
      if (gameObject.element && gameObject.element.parentNode) {
        gameObject.element.parentNode.removeChild(gameObject.element);
      }
    }

    // Reset game state
    this.engine.gameObjects = [];
    this.engine.player = null;
    this.engine.platforms = [];
    this.engine.enemies = [];
    this.engine.bonuses = [];
    this.engine.score = 0;
    this.engine.isGameOver = false;
    this.engine.cameraX = 0;
    this.engine.LEVEL_WIDTH = 3000;

    // Update score display
    this.scoreElement.textContent = "Score: 0";

    // Reset level container position
    this.levelContainer.style.transform = "translateX(0)";
    this.levelContainer.style.width = `${this.engine.LEVEL_WIDTH}px`;

    // Remove all children from level container
    while (this.levelContainer.firstChild) {
      this.levelContainer.removeChild(this.levelContainer.firstChild);
    }

    // Recreate background
    this.background = new Background(this.levelContainer, this.engine.LEVEL_WIDTH);
    this.background.createBackground();

    // Create new level
    this.createLevel();

    // Cancel any existing animation frame
    if (this.engine.animationFrameId) {
      cancelAnimationFrame(this.engine.animationFrameId);
    }

    // Restart the game loop
    this.engine.lastTimestamp = performance.now();
    this.engine.animationFrameId = requestAnimationFrame(this.engine.gameLoop.bind(this.engine));
  }

  /**
   * Update the player texture
   * @param {string} imagePath - Path to the new image
   */
  updatePlayerTexture(imagePath) {
    if (this.engine.player) {
      this.engine.player.updateTexture(imagePath);
    }
  }

  /**
   * Update the enemy texture
   * @param {string} imagePath - Path to the new image
   */
  updateEnemyTexture(imagePath) {
    this.engine.enemies.forEach(enemy => {
      enemy.updateTexture(imagePath);
    });
  }

  /**
   * Update the platform texture
   * @param {string} imagePath - Path to the new image
   */
  updatePlatformTexture(imagePath) {
    this.engine.platforms.forEach(platform => {
      platform.updateTexture(imagePath);
    });
  }

  /**
   * Update the bonus texture
   * @param {string} imagePath - Path to the new image
   */
  updateBonusTexture(imagePath) {
    this.engine.bonuses.forEach(bonus => {
      bonus.updateTexture(imagePath);
    });
  }

  /**
   * Update the mountain texture in the background
   * @param {string} imagePath - Path to the new image
   */
  updateMountainTexture(imagePath) {
    if (this.background) {
      this.background.updateMountainTexture(imagePath);
    }
  }

  /**
   * Update the hill texture in the background
   * @param {string} imagePath - Path to the new image
   */
  updateHillTexture(imagePath) {
    if (this.background) {
      this.background.updateHillTexture(imagePath);
    }
  }

  /**
   * Update the cloud texture in the background
   * @param {string} imagePath - Path to the new image
   */
  updateCloudTexture(imagePath) {
    if (this.background) {
      this.background.updateCloudTexture(imagePath);
    }
  }
}
