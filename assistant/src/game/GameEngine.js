/**
 * GameEngine - Core game mechanics
 */
export class GameEngine {
  constructor() {
    // Constants
    this.LEVEL_WIDTH = 3000;
    this.LEVEL_HEIGHT = 600;
    this.CHUNK_SIZE = 1000;
    this.GRAVITY = 0.5;
    this.FRICTION = 0.8;
    this.MAX_SPEED = 3;
    this.JUMP_FORCE = 12;
    this.MAX_JUMP_HEIGHT = 150;

    // Game state
    this.gameObjects = [];
    this.player = null;
    this.platforms = [];
    this.enemies = [];
    this.bonuses = [];
    this.score = 0;
    this.isGameOver = false;
    this.cameraX = 0;
    this.lastTimestamp = 0;
    this.animationFrameId = null;
    this.keysPressed = {};

    // Track furthest position reached by player
    this.furthestX = 0;
    
    // Callbacks
    this.onScoreUpdate = null;
    this.onGameOver = null;
    this.onCameraUpdate = null;
    this.onGenerateNewChunks = null;
  }

  /**
   * Initialize event listeners
   */
  initEventListeners() {
    document.addEventListener("keydown", (e) => {
      this.keysPressed[e.key] = true;
    });

    document.addEventListener("keyup", (e) => {
      this.keysPressed[e.key] = false;
    });
  }

  /**
   * Main game loop
   * @param {number} timestamp - Current timestamp
   */
  gameLoop(timestamp) {
    if (this.isGameOver) return;

    // Handle player input
    this.handleInput();

    // Update game objects
    this.updateGameObjects();

    // Check collisions
    this.checkCollisions();

    // Update camera position
    if (this.onCameraUpdate) {
      this.onCameraUpdate();
    }

    // Generate new level chunks if needed
    if (this.onGenerateNewChunks) {
      this.onGenerateNewChunks();
    }

    // Continue the game loop
    this.lastTimestamp = timestamp;
    this.animationFrameId = requestAnimationFrame(this.gameLoop.bind(this));
  }

  /**
   * Handle player input
   */
  handleInput() {
    if (!this.player) return;

    // Move left
    if (this.keysPressed["ArrowLeft"] || this.keysPressed["a"]) {
      this.player.velocityX = -this.MAX_SPEED;
      this.player.updateDirection(-1);
    }
    // Move right
    else if (this.keysPressed["ArrowRight"] || this.keysPressed["d"]) {
      this.player.velocityX = this.MAX_SPEED;
      this.player.updateDirection(1);
    }
    // No horizontal movement
    else {
      this.player.velocityX *= this.FRICTION;
    }

    // Jump (only if on ground)
    if (
      (this.keysPressed["ArrowUp"] ||
        this.keysPressed["w"] ||
        this.keysPressed[" "]) &&
      this.player.isOnGround
    ) {
      this.player.velocityY = -this.JUMP_FORCE;
      this.player.isOnGround = false;
    }
  }

  /**
   * Update all game objects
   */
  updateGameObjects() {
    // Update player
    if (this.player) {
      // Apply gravity
      this.player.velocityY += this.GRAVITY;

      // Update position
      this.player.x += this.player.velocityX;
      this.player.y += this.player.velocityY;

      // Keep player within level bounds
      if (this.player.x < 0) {
        this.player.x = 0;
        this.player.velocityX = 0;
      }

      // Update furthest position reached
      if (this.player.x > this.furthestX) {
        this.furthestX = this.player.x;
      }

      // Check if player has fallen off the level
      if (this.player.y > this.LEVEL_HEIGHT) {
        this.gameOver();
        return;
      }

      // Update DOM element position
      this.player.updatePosition();
    }

    // Update enemies
    for (const enemy of this.enemies) {
      // Simple AI: move back and forth
      enemy.x += enemy.velocityX;

      // Change direction if hitting edge of platform
      let onPlatform = false;
      for (const platform of this.platforms) {
        if (
          enemy.x + enemy.width > platform.x &&
          enemy.x < platform.x + platform.width &&
          enemy.y + enemy.height === platform.y
        ) {
          onPlatform = true;

          // Check if enemy is at the edge of the platform
          if (
            enemy.x <= platform.x ||
            enemy.x + enemy.width >= platform.x + platform.width
          ) {
            enemy.velocityX *= -1;
            enemy.updateDirection(enemy.velocityX > 0 ? 1 : -1);
          }
          break;
        }
      }

      // If not on any platform, change direction
      if (!onPlatform) {
        enemy.velocityX *= -1;
        enemy.updateDirection(enemy.velocityX > 0 ? 1 : -1);
      }

      // Set initial velocity if not set
      if (enemy.velocityX === 0) {
        enemy.velocityX = 1 * enemy.direction;
      }

      // Update DOM element position
      enemy.updatePosition();
    }

    // Update bonuses (simple floating animation)
    for (const bonus of this.bonuses) {
      bonus.y += Math.sin(Date.now() / 500) * 0.5;
      bonus.updatePosition();
    }
  }

  /**
   * Check collisions between game objects
   */
  checkCollisions() {
    if (!this.player) return;

    // Reset player ground state
    this.player.isOnGround = false;

    // Check platform collisions
    for (const platform of this.platforms) {
      // Check if player is colliding with platform
      if (this.isColliding(this.player, platform)) {
        // Coming from above (landing on platform)
        if (
          this.player.velocityY > 0 &&
          this.player.y + this.player.height - this.player.velocityY <=
            platform.y
        ) {
          this.player.y = platform.y - this.player.height;
          this.player.velocityY = 0;
          this.player.isOnGround = true;
        }
        // Coming from below (hitting platform from below)
        else if (
          this.player.velocityY < 0 &&
          this.player.y - this.player.velocityY >= platform.y + platform.height
        ) {
          this.player.y = platform.y + platform.height;
          this.player.velocityY = 0;
        }
        // Coming from the side (hitting platform from the side)
        else {
          if (
            this.player.x + this.player.width / 2 <
            platform.x + platform.width / 2
          ) {
            this.player.x = platform.x - this.player.width;
          } else {
            this.player.x = platform.x + platform.width;
          }
          this.player.velocityX = 0;
        }
      }
    }

    // Check enemy collisions
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const enemy = this.enemies[i];

      // Check if player is colliding with enemy
      if (this.isColliding(this.player, enemy)) {
        // Coming from above (jumping on enemy)
        if (
          this.player.velocityY > 0 &&
          this.player.y + this.player.height - this.player.velocityY <= enemy.y
        ) {
          // Remove enemy
          this.removeGameObject(enemy);
          this.enemies.splice(i, 1);

          // Bounce player
          this.player.velocityY = -this.JUMP_FORCE * 0.7;

          // Add score
          this.score += 100;
          if (this.onScoreUpdate) {
            this.onScoreUpdate(this.score);
          }
        } else {
          // Player hit by enemy
          this.gameOver();
          return;
        }
      }
    }

    // Check bonus collisions
    for (let i = this.bonuses.length - 1; i >= 0; i--) {
      const bonus = this.bonuses[i];

      // Check if player is colliding with bonus
      if (this.isColliding(this.player, bonus)) {
        // Remove bonus
        this.removeGameObject(bonus);
        this.bonuses.splice(i, 1);

        // Add score
        this.score += 50;
        if (this.onScoreUpdate) {
          this.onScoreUpdate(this.score);
        }
      }
    }
  }

  /**
   * Check if two game objects are colliding
   * @param {Object} a - First game object
   * @param {Object} b - Second game object
   * @returns {boolean} - True if colliding
   */
  isColliding(a, b) {
    return (
      a.x < b.x + b.width &&
      a.x + a.width > b.x &&
      a.y < b.y + b.height &&
      a.y + a.height > b.y
    );
  }

  /**
   * Remove a game object
   * @param {Object} gameObject - Game object to remove
   */
  removeGameObject(gameObject) {
    // Remove from DOM
    if (gameObject.element && gameObject.element.parentNode) {
      gameObject.element.parentNode.removeChild(gameObject.element);
    }

    // Remove from game objects array
    const index = this.gameObjects.indexOf(gameObject);
    if (index !== -1) {
      this.gameObjects.splice(index, 1);
    }
  }

  /**
   * Set callback for score updates
   * @param {Function} callback - Callback function
   */
  setScoreUpdateCallback(callback) {
    this.onScoreUpdate = callback;
  }

  /**
   * Set callback for game over
   * @param {Function} callback - Callback function
   */
  setGameOverCallback(callback) {
    this.onGameOver = callback;
  }

  /**
   * Set callback for camera updates
   * @param {Function} callback - Callback function
   */
  setCameraUpdateCallback(callback) {
    this.onCameraUpdate = callback;
  }
  
  /**
   * Set callback for generating new chunks
   * @param {Function} callback - Callback function
   */
  setGenerateNewChunksCallback(callback) {
    this.onGenerateNewChunks = callback;
  }

  /**
   * Game over
   */
  gameOver() {
    this.isGameOver = true;
    if (this.onGameOver) {
      this.onGameOver(this.score);
    }
  }
}
