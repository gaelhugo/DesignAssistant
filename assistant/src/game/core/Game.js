/**
 * Main Game class that manages the game loop and all game objects
 */
export default class Game {
  constructor(containerId) {
    this.containerId = containerId;
    this.container = document.getElementById(containerId);
    
    // If container doesn't exist, create it
    if (!this.container) {
      console.warn(`Container with id "${containerId}" not found, creating it`);
      this.container = document.createElement('div');
      this.container.id = containerId;
      document.querySelector('#app').appendChild(this.container);
    }
    
    this.gameObjects = [];
    this.player = null;
    this.platforms = [];
    this.enemies = [];
    this.bonuses = [];
    this.score = 0;
    this.isGameOver = false;
    this.lastTime = 0;
    this.keysPressed = {};
    this.scoreElement = null;
    
    // Set up the game container
    this.setupContainer();
    
    // Set up key event listeners
    this.setupEventListeners();
  }

  /**
   * Set up the game container styling
   */
  setupContainer() {
    this.container.style.position = 'relative';
    this.container.style.width = '800px';
    this.container.style.height = '600px';
    this.container.style.overflow = 'hidden';
    this.container.style.backgroundColor = '#87CEEB'; // Sky blue background
    this.container.style.border = '2px solid #333';
    this.container.style.margin = '0 auto';
    
    // Create score display
    this.scoreElement = document.createElement('div');
    this.scoreElement.style.position = 'absolute';
    this.scoreElement.style.top = '10px';
    this.scoreElement.style.left = '10px';
    this.scoreElement.style.padding = '5px 10px';
    this.scoreElement.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    this.scoreElement.style.color = 'white';
    this.scoreElement.style.borderRadius = '5px';
    this.scoreElement.style.fontFamily = 'Arial, sans-serif';
    this.scoreElement.style.zIndex = '100';
    this.updateScore(0);
    this.container.appendChild(this.scoreElement);
  }

  /**
   * Set up keyboard event listeners
   */
  setupEventListeners() {
    window.addEventListener('keydown', (e) => {
      this.keysPressed[e.key] = true;
      
      // Prevent default for arrow keys and space to avoid page scrolling
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
      }
      
      // Jump with space or up arrow
      if ((e.key === ' ' || e.key === 'ArrowUp') && this.player && !this.isGameOver) {
        this.player.jump();
      }
    });
    
    window.addEventListener('keyup', (e) => {
      this.keysPressed[e.key] = false;
    });
  }

  /**
   * Add a game object to the game
   * @param {GameObject} gameObject - The game object to add
   */
  addGameObject(gameObject) {
    this.gameObjects.push(gameObject);
    this.container.appendChild(gameObject.createElement());
    
    // Add to specific collection based on type
    if (gameObject.constructor.name === 'Player') {
      this.player = gameObject;
    } else if (gameObject.constructor.name === 'Platform') {
      this.platforms.push(gameObject);
    } else if (gameObject.constructor.name === 'Enemy') {
      this.enemies.push(gameObject);
    } else if (gameObject.constructor.name === 'Bonus') {
      this.bonuses.push(gameObject);
    }
  }

  /**
   * Update the score display
   * @param {number} points - Points to add to the score
   */
  updateScore(points) {
    this.score += points;
    this.scoreElement.textContent = `Score: ${this.score}`;
  }

  /**
   * Start the game loop
   */
  start() {
    this.isGameOver = false;
    this.lastTime = performance.now();
    requestAnimationFrame(this.gameLoop.bind(this));
  }

  /**
   * Main game loop
   * @param {number} currentTime - Current timestamp
   */
  gameLoop(currentTime) {
    if (this.isGameOver) return;
    
    // Calculate delta time in seconds
    const deltaTime = (currentTime - this.lastTime) / 1000;
    this.lastTime = currentTime;
    
    // Handle player input
    this.handleInput();
    
    // Update all game objects
    this.update(deltaTime);
    
    // Check collisions
    this.checkCollisions();
    
    // Continue the game loop
    requestAnimationFrame(this.gameLoop.bind(this));
  }

  /**
   * Handle player input
   */
  handleInput() {
    if (!this.player || this.isGameOver) return;
    
    // Handle left/right movement
    if (this.keysPressed['ArrowLeft']) {
      this.player.moveLeft();
    } else if (this.keysPressed['ArrowRight']) {
      this.player.moveRight();
    } else {
      this.player.stopMoving();
    }
  }

  /**
   * Update all game objects
   * @param {number} deltaTime - Time since last update in seconds
   */
  update(deltaTime) {
    // Limit delta time to prevent large jumps after pauses
    const limitedDeltaTime = Math.min(deltaTime, 0.1);
    
    // Update all game objects
    for (const gameObject of this.gameObjects) {
      gameObject.update(limitedDeltaTime);
    }
    
    // Keep player within bounds
    if (this.player) {
      if (this.player.x < 0) this.player.x = 0;
      if (this.player.x + this.player.width > this.container.offsetWidth) {
        this.player.x = this.container.offsetWidth - this.player.width;
      }
      
      // Check if player fell off the bottom of the screen
      if (this.player.y > this.container.offsetHeight) {
        this.gameOver();
      }
    }
  }

  /**
   * Check collisions between game objects
   */
  checkCollisions() {
    if (!this.player || this.isGameOver) return;
    
    // Check platform collisions
    this.player.isOnGround = false;
    for (const platform of this.platforms) {
      if (this.player.collidesWith(platform)) {
        this.player.handlePlatformCollision(platform);
      }
    }
    
    // Check enemy collisions
    for (const enemy of this.enemies) {
      if (this.player.collidesWith(enemy)) {
        // Check if player is jumping on top of the enemy
        const playerBottom = this.player.y + this.player.height;
        const enemyTop = enemy.y;
        
        if (this.player.velocityY > 0 && Math.abs(playerBottom - enemyTop) < 10) {
          // Remove the enemy
          const index = this.gameObjects.indexOf(enemy);
          if (index !== -1) {
            this.gameObjects.splice(index, 1);
          }
          
          const enemyIndex = this.enemies.indexOf(enemy);
          if (enemyIndex !== -1) {
            this.enemies.splice(enemyIndex, 1);
          }
          
          if (enemy.element && enemy.element.parentNode) {
            enemy.element.parentNode.removeChild(enemy.element);
          }
          
          // Bounce the player
          this.player.velocityY = this.player.jumpForce * 0.7;
          
          // Add points
          this.updateScore(200);
        } else {
          // Player hit the enemy from the side or bottom
          this.gameOver();
        }
      }
    }
    
    // Check bonus collisions
    for (const bonus of this.bonuses) {
      if (!bonus.collected && this.player.collidesWith(bonus)) {
        const points = bonus.collect();
        this.updateScore(points);
      }
    }
  }

  /**
   * End the game
   */
  gameOver() {
    this.isGameOver = true;
    
    // Create game over message
    const gameOverElement = document.createElement('div');
    gameOverElement.style.position = 'absolute';
    gameOverElement.style.top = '50%';
    gameOverElement.style.left = '50%';
    gameOverElement.style.transform = 'translate(-50%, -50%)';
    gameOverElement.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    gameOverElement.style.color = 'white';
    gameOverElement.style.padding = '20px';
    gameOverElement.style.borderRadius = '10px';
    gameOverElement.style.fontFamily = 'Arial, sans-serif';
    gameOverElement.style.textAlign = 'center';
    gameOverElement.style.zIndex = '200';
    gameOverElement.innerHTML = `
      <h2>Game Over</h2>
      <p>Your score: ${this.score}</p>
      <button id="restart-button">Play Again</button>
    `;
    
    this.container.appendChild(gameOverElement);
    
    // Add restart button functionality
    document.getElementById('restart-button').addEventListener('click', () => {
      this.container.removeChild(gameOverElement);
      this.restart();
    });
  }

  /**
   * Restart the game
   */
  restart() {
    // Clear all game objects
    for (const gameObject of this.gameObjects) {
      if (gameObject.element && gameObject.element.parentNode) {
        gameObject.element.parentNode.removeChild(gameObject.element);
      }
    }
    
    this.gameObjects = [];
    this.player = null;
    this.platforms = [];
    this.enemies = [];
    this.bonuses = [];
    this.score = 0;
    this.updateScore(0);
    
    // Initialize the level again
    this.initLevel();
    
    // Start the game loop
    this.start();
  }

  /**
   * Initialize a level with platforms, enemies, and bonuses
   */
  initLevel() {
    // This method should be implemented by the game instance
    // to create the specific level layout
  }
}
