/**
 * SimpleGame - A platform game class
 */
export class SimpleGame {
  constructor(gameContainerId) {
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

    // DOM elements
    this.gameContainer = document.getElementById(gameContainerId);
    this.levelContainer = null;
    this.scoreElement = null;

    // Styles
    this.STYLES = {
      player: {
        backgroundColor: "#3498db",
        borderRadius: "50%",
      },
      enemy: {
        backgroundColor: "#e74c3c",
        borderRadius: "50%",
      },
      platform: {
        backgroundColor: "#8B4513",
      },
      bonus: {
        backgroundColor: "#f1c40f",
        borderRadius: "50%",
      },
    };
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

    // Create game container
    // this.gameContainer.style.position = "relative";
    // this.gameContainer.style.width = "800px";
    // this.gameContainer.style.height = "600px";
    this.gameContainer.style.overflow = "hidden";
    this.gameContainer.style.backgroundColor = "#87CEEB";

    // Create level container
    this.levelContainer = document.createElement("div");
    this.levelContainer.style.position = "absolute";
    this.levelContainer.style.width = `${this.LEVEL_WIDTH}px`;
    this.levelContainer.style.height = `${this.LEVEL_HEIGHT}px`;
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

    // Set up event listeners
    document.addEventListener("keydown", (e) => {
      this.keysPressed[e.key] = true;
    });

    document.addEventListener("keyup", (e) => {
      this.keysPressed[e.key] = false;
    });

    // Create background
    this.createBackground();

    // Create level
    this.createLevel();

    // Start game loop
    this.lastTimestamp = performance.now();
    this.animationFrameId = requestAnimationFrame(this.gameLoop.bind(this));

    console.log("Game initialized successfully");
  }

  /**
   * Create parallax background layers
   */
  createBackground() {
    // Create far background (mountains)
    const farBackground = document.createElement("div");
    farBackground.style.position = "absolute";
    farBackground.style.width = `${this.LEVEL_WIDTH}px`;
    farBackground.style.height = "200px";
    farBackground.style.bottom = "0";
    farBackground.style.left = "0";
    farBackground.style.zIndex = "1";

    // Add mountains using mountains.png image
    for (let i = 0; i < this.LEVEL_WIDTH / 200; i++) {
      const mountain = document.createElement("img");
      mountain.src = "/src/assets/images/mountains.png";
      mountain.style.position = "absolute";
      mountain.style.height = "auto";
      mountain.style.bottom = "0";
      mountain.style.left = `${i * 200}px`;
      mountain.style.opacity = "0.8";

      // Ensure mountains are properly sized and positioned
      mountain.onload = function () {
        mountain.style.left = `${i * (this.naturalWidth - 20)}px`;
      };

      farBackground.appendChild(mountain);
    }

    this.levelContainer.appendChild(farBackground);

    // Create mid background (hills)
    const midBackground = document.createElement("div");
    midBackground.style.position = "absolute";
    midBackground.style.width = `${this.LEVEL_WIDTH}px`;
    midBackground.style.height = "100px";
    midBackground.style.bottom = "0";
    midBackground.style.left = "0";
    midBackground.style.zIndex = "2";

    // Add hills using buisson.png image
    for (let i = 0; i < this.LEVEL_WIDTH / 100; i++) {
      const hill = document.createElement("img");
      hill.src = "/src/assets/images/buisson.png";
      hill.style.position = "absolute";
      hill.style.width = "100px";
      hill.style.height = "auto";
      hill.style.bottom = "0";
      hill.style.left = `${i * 80}px`;
      hill.style.opacity = "0.9";
      midBackground.appendChild(hill);
    }

    this.levelContainer.appendChild(midBackground);

    // Create near background (clouds)
    const nearBackground = document.createElement("div");
    nearBackground.style.position = "absolute";
    nearBackground.style.width = `${this.LEVEL_WIDTH}px`;
    nearBackground.style.height = "200px";
    nearBackground.style.top = "0";
    nearBackground.style.left = "0";
    nearBackground.style.zIndex = "3";

    // Add clouds using nuage.png image
    for (let i = 0; i < this.LEVEL_WIDTH / 200; i++) {
      const cloud = document.createElement("img");
      cloud.src = "/src/assets/images/nuage.png";
      cloud.style.position = "absolute";
      cloud.style.width = "100px";
      cloud.style.height = "auto";
      cloud.style.left = `${i * 200 + Math.random() * 100}px`;
      cloud.style.top = `${50 + Math.random() * 100}px`;
      cloud.style.opacity = "0.8";
      nearBackground.appendChild(cloud);
    }

    this.levelContainer.appendChild(nearBackground);
  }

  /**
   * Create the initial level
   */
  createLevel() {
    // Create a continuous ground with occasional gaps
    for (let x = 0; x < this.LEVEL_WIDTH; x += 100) {
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
    this.player = this.createGameObject(70, 468, 32, 32, "player");
  }

  /**
   * Create a game object
   */
  createGameObject(x, y, width, height, type) {
    console.log(`Creating ${type} at (${x}, ${y})`);

    // Create DOM element
    const element = document.createElement("div");
    element.style.position = "absolute";
    element.style.left = `${x}px`;
    element.style.top = `${y}px`;
    element.style.width = `${width}px`;
    element.style.height = `${height}px`;

    // Apply style based on type
    if (type === "player") {
      // Use player.png image instead of CSS styling
      const playerImg = document.createElement("img");
      playerImg.src = "/src/assets/images/player.png";
      playerImg.style.width = "100%";
      playerImg.style.height = "100%";
      playerImg.style.objectFit = "contain";
      element.appendChild(playerImg);
      element.style.zIndex = "10";
    } else if (type === "enemy") {
      // Use enemy.png image instead of CSS styling
      const enemyImg = document.createElement("img");
      enemyImg.src = "/src/assets/images/enemy.png";
      enemyImg.style.width = "100%";
      enemyImg.style.height = "100%";
      enemyImg.style.objectFit = "contain";
      element.appendChild(enemyImg);
      element.style.zIndex = "8";
    } else if (type === "bonus") {
      // Use bonus.png image instead of CSS styling
      const bonusImg = document.createElement("img");
      bonusImg.src = "/src/assets/images/bonus.png";
      bonusImg.style.width = "100%";
      bonusImg.style.height = "100%";
      bonusImg.style.objectFit = "contain";
      element.appendChild(bonusImg);
      element.style.zIndex = "7";
    } else if (type === "platform") {
      // Use platform.png image as a repeating background instead of scaling
      element.style.backgroundImage = "url(/src/assets/images/platform.png)";
      element.style.backgroundRepeat = "repeat-x";
      element.style.backgroundSize = "auto 100%"; // Maintain height, auto width for proper tiling
      element.style.zIndex = "5";
    }

    // Add to level container
    this.levelContainer.appendChild(element);

    // Create game object
    const gameObject = {
      x,
      y,
      width,
      height,
      type,
      element,
      velocityX: 0,
      velocityY: 0,
      isOnGround: false,
      direction: 1,
    };

    // Add to appropriate collections
    this.gameObjects.push(gameObject);

    if (type === "platform") {
      this.platforms.push(gameObject);
    } else if (type === "enemy") {
      this.enemies.push(gameObject);
    } else if (type === "bonus") {
      this.bonuses.push(gameObject);
    }

    return gameObject;
  }

  /**
   * Main game loop
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
    this.updateCamera();

    // Generate new level chunks if needed
    this.generateNewLevelChunks();

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
      this.player.direction = -1;
    }
    // Move right
    else if (this.keysPressed["ArrowRight"] || this.keysPressed["d"]) {
      this.player.velocityX = this.MAX_SPEED;
      this.player.direction = 1;
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

      // Update DOM element
      this.player.element.style.left = `${this.player.x}px`;
      this.player.element.style.top = `${this.player.y}px`;

      // Flip player sprite based on direction
      const playerImg = this.player.element.querySelector("img");
      if (playerImg) {
        playerImg.style.transform =
          this.player.direction === 1 ? "scaleX(1)" : "scaleX(-1)";
      }
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
            enemy.direction *= -1;
          }
          break;
        }
      }

      // If not on any platform, change direction
      if (!onPlatform) {
        enemy.velocityX *= -1;
        enemy.direction *= -1;
      }

      // Set initial velocity if not set
      if (enemy.velocityX === 0) {
        enemy.velocityX = 1 * enemy.direction;
      }

      // Update DOM element
      enemy.element.style.left = `${enemy.x}px`;

      // Flip enemy sprite based on direction
      const enemyImg = enemy.element.querySelector("img");
      if (enemyImg) {
        enemyImg.style.transform =
          enemy.direction === 1 ? "scaleX(1)" : "scaleX(-1)";
      }
    }

    // Update bonuses (simple floating animation)
    for (const bonus of this.bonuses) {
      bonus.y += Math.sin(Date.now() / 500) * 0.5;
      bonus.element.style.top = `${bonus.y}px`;
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
          this.scoreElement.textContent = `Score: ${this.score}`;
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
        this.scoreElement.textContent = `Score: ${this.score}`;
      }
    }
  }

  /**
   * Check if two game objects are colliding
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
   * Update camera position to follow player
   */
  updateCamera() {
    if (!this.player) return;

    // Calculate camera position (center player in view)
    const targetX = -this.player.x + 400 - this.player.width / 2;

    // Limit camera to not show beyond the left edge of the level
    this.cameraX = Math.min(0, targetX);

    // Apply camera position to level container
    this.levelContainer.style.transform = `translateX(${this.cameraX}px)`;

    // Apply parallax effect to background layers
    const backgrounds = this.levelContainer.querySelectorAll("div");
    if (backgrounds.length >= 3) {
      // Far background (mountains) - slowest parallax
      backgrounds[0].style.transform = `translateX(${this.cameraX * 0.2}px)`;

      // Mid background (hills) - medium parallax
      backgrounds[1].style.transform = `translateX(${this.cameraX * 0.5}px)`;

      // Near background (clouds) - fastest parallax
      backgrounds[2].style.transform = `translateX(${this.cameraX * 0.8}px)`;
    }
  }

  /**
   * Generate new level chunks
   */
  generateNewLevelChunks() {
    // Check if player has reached the end of the current level
    if (
      this.player.x + this.player.width >
      this.LEVEL_WIDTH - this.CHUNK_SIZE
    ) {
      // Generate new level chunk
      const newChunk = this.generateLevelChunk(
        this.LEVEL_WIDTH,
        this.LEVEL_HEIGHT
      );
      this.LEVEL_WIDTH += this.CHUNK_SIZE;
      this.levelContainer.style.width = `${this.LEVEL_WIDTH}px`;

      // Add new platforms, enemies, and bonuses to the level
      for (const platform of newChunk.platforms) {
        this.platforms.push(platform);
        this.gameObjects.push(platform);
      }
      for (const enemy of newChunk.enemies) {
        this.enemies.push(enemy);
        this.gameObjects.push(enemy);
      }
      for (const bonus of newChunk.bonuses) {
        this.bonuses.push(bonus);
        this.gameObjects.push(bonus);
      }
    }
  }

  /**
   * Generate a new level chunk
   */
  generateLevelChunk(startX, height) {
    const platforms = [];
    const enemies = [];
    const bonuses = [];

    // Create ground with gaps
    for (let x = startX; x < startX + this.CHUNK_SIZE; x += 64) {
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
      const x = startX + Math.random() * (this.CHUNK_SIZE - 100);
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

    // Extend the background elements
    this.extendBackground(startX, startX + this.CHUNK_SIZE);

    return { platforms, enemies, bonuses };
  }

  /**
   * Extend the background elements for the new chunk
   */
  extendBackground(startX, endX) {
    // Get the background layers
    const backgrounds = this.levelContainer.querySelectorAll("div");

    // Skip if backgrounds are not initialized
    if (backgrounds.length < 3) return;

    const farBackground = backgrounds[0];
    const midBackground = backgrounds[1];
    const nearBackground = backgrounds[2];

    // Add mountains to far background
    for (let i = 0; i < this.CHUNK_SIZE / 200; i++) {
      const mountain = document.createElement("img");
      mountain.src = "/src/assets/images/mountains.png";
      mountain.style.position = "absolute";
      mountain.style.height = "auto";
      mountain.style.bottom = "0";
      mountain.style.left = `${startX + i * 200}px`;
      mountain.style.opacity = "0.8";

      // Ensure mountains are properly sized and positioned
      mountain.onload = function () {
        mountain.style.left = `${startX + i * (this.naturalWidth - 20)}px`;
      };

      farBackground.appendChild(mountain);
    }

    // Add hills to mid background
    for (let i = 0; i < this.CHUNK_SIZE / 100; i++) {
      const hill = document.createElement("img");
      hill.src = "/src/assets/images/buisson.png";
      hill.style.position = "absolute";
      hill.style.width = "100px";
      hill.style.height = "auto";
      hill.style.bottom = "0";
      hill.style.left = `${startX + i * 80}px`;
      hill.style.opacity = "0.9";
      midBackground.appendChild(hill);
    }

    // Add clouds to near background
    for (let i = 0; i < this.CHUNK_SIZE / 200; i++) {
      const cloud = document.createElement("img");
      cloud.src = "/src/assets/images/nuage.png";
      cloud.style.position = "absolute";
      cloud.style.width = "100px";
      cloud.style.height = "auto";
      cloud.style.left = `${startX + i * 200 + Math.random() * 100}px`;
      cloud.style.top = `${50 + Math.random() * 100}px`;
      cloud.style.opacity = "0.8";
      nearBackground.appendChild(cloud);
    }
  }

  /**
   * Remove a game object
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
   * Game over
   */
  gameOver() {
    this.isGameOver = true;

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
      <p>Your score: ${this.score}</p>
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
    for (const gameObject of this.gameObjects) {
      if (gameObject.element && gameObject.element.parentNode) {
        gameObject.element.parentNode.removeChild(gameObject.element);
      }
    }

    // Reset game state
    this.gameObjects = [];
    this.player = null;
    this.platforms = [];
    this.enemies = [];
    this.bonuses = [];
    this.score = 0;
    this.isGameOver = false;
    this.cameraX = 0;

    // Update score display
    this.scoreElement.textContent = "Score: 0";

    // Reset level container position
    this.levelContainer.style.transform = "translateX(0)";

    // Remove all children from level container
    while (this.levelContainer.firstChild) {
      this.levelContainer.removeChild(this.levelContainer.firstChild);
    }

    // Recreate background
    this.createBackground();

    // Create new level
    this.createLevel();

    // Cancel any existing animation frame
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }

    // Restart the game loop
    this.lastTimestamp = performance.now();
    this.animationFrameId = requestAnimationFrame(this.gameLoop.bind(this));
  }
}

// // Export the SimpleGame class
// export default SimpleGame;
