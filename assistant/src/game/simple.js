/**
 * Simple platform game implementation with scrolling landscape
 */

// Game constants
const GRAVITY = 0.5;
const JUMP_FORCE = -12;
const MOVE_SPEED = 3.5; // Reduced from 5 to 3.5 for slower player movement

// Level dimensions
const INITIAL_LEVEL_WIDTH = 3000; // Initial level width
let LEVEL_WIDTH = INITIAL_LEVEL_WIDTH; // Dynamic level width that will grow
const LEVEL_HEIGHT = 600;
const CHUNK_SIZE = 1000; // Size of each new chunk of level to generate

// Platform jump height calculation (maximum height a jump can reach)
const MAX_JUMP_HEIGHT = Math.pow(JUMP_FORCE, 2) / (2 * GRAVITY);

// Camera/viewport
const VIEWPORT_WIDTH = 800;
const VIEWPORT_HEIGHT = 600;
let cameraX = 0;

// Game state
let gameObjects = [];
let player = null;
let platforms = [];
let enemies = [];
let bonuses = [];
let score = 0;
let isGameOver = false;
let lastTimestamp = 0;
let animationFrameId = null;
let keysPressed = {};

// Track furthest position reached by player
let furthestX = 0;

// DOM elements
let gameContainer = null;
let levelContainer = null;
let scoreElement = null;

// Game element styles
const STYLES = {
  player: {
    backgroundColor: '#FF5555',
    borderRadius: '4px',
    border: '2px solid #CC3333'
  },
  platform: {
    backgroundColor: '#8B4513',
    borderTop: '4px solid #A0522D',
    borderRadius: '2px'
  },
  enemy: {
    backgroundColor: '#55AA55',
    borderRadius: '4px',
    border: '2px solid #338833'
  },
  bonus: {
    backgroundColor: '#FFD700',
    borderRadius: '50%',
    border: '2px solid #FFA500'
  }
};

/**
 * Initialize the game
 */
function initGame(containerId) {
  console.log('Initializing game...');
  
  // Get or create game container
  gameContainer = document.getElementById(containerId);
  if (!gameContainer) {
    console.warn(`Container with id "${containerId}" not found, creating it`);
    gameContainer = document.createElement('div');
    gameContainer.id = containerId;
    document.querySelector('#app').appendChild(gameContainer);
  }
  
  // Style game container (viewport)
  gameContainer.style.position = 'relative';
  gameContainer.style.width = `${VIEWPORT_WIDTH}px`;
  gameContainer.style.height = `${VIEWPORT_HEIGHT}px`;
  gameContainer.style.overflow = 'hidden';
  gameContainer.style.backgroundColor = '#87CEEB'; // Sky blue background
  gameContainer.style.border = '2px solid #333';
  gameContainer.style.margin = '0 auto';
  
  // Create level container (scrollable area)
  levelContainer = document.createElement('div');
  levelContainer.style.position = 'absolute';
  levelContainer.style.width = `${LEVEL_WIDTH}px`;
  levelContainer.style.height = `${LEVEL_HEIGHT}px`;
  levelContainer.style.left = '0';
  levelContainer.style.top = '0';
  gameContainer.appendChild(levelContainer);
  
  // Create background with parallax effect
  createBackground();
  
  // Create score display
  scoreElement = document.createElement('div');
  scoreElement.style.position = 'absolute';
  scoreElement.style.top = '10px';
  scoreElement.style.left = '10px';
  scoreElement.style.padding = '5px 10px';
  scoreElement.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
  scoreElement.style.color = 'white';
  scoreElement.style.borderRadius = '5px';
  scoreElement.style.fontFamily = 'Arial, sans-serif';
  scoreElement.style.zIndex = '100';
  scoreElement.textContent = 'Score: 0';
  gameContainer.appendChild(scoreElement);
  
  // Set up event listeners
  setupEventListeners();
  
  // Create level
  createLevel();
  
  // Start game loop
  lastTimestamp = performance.now();
  animationFrameId = requestAnimationFrame(gameLoop);
  
  console.log('Game initialized successfully');
}

/**
 * Create parallax background layers
 */
function createBackground() {
  // Create far background (mountains)
  const farBackground = document.createElement('div');
  farBackground.style.position = 'absolute';
  farBackground.style.width = `${LEVEL_WIDTH}px`;
  farBackground.style.height = '200px';
  farBackground.style.bottom = '0';
  farBackground.style.left = '0';
  farBackground.style.zIndex = '1';
  
  // Add mountains using mountains.png image
  for (let i = 0; i < LEVEL_WIDTH / 200; i++) {
    const mountain = document.createElement('img');
    mountain.src = '/src/assets/images/mountains.png';
    mountain.style.position = 'absolute';
    mountain.style.height = 'auto';
    mountain.style.bottom = '0';
    mountain.style.left = `${i * 200}px`;
    mountain.style.opacity = '0.8';
    
    // Ensure mountains are properly sized and positioned
    mountain.onload = function() {
      mountain.style.left = `${i * (this.naturalWidth - 20)}px`;
    };
    
    farBackground.appendChild(mountain);
  }
  
  levelContainer.appendChild(farBackground);
  
  // Create mid background (bushes)
  const midBackground = document.createElement('div');
  midBackground.style.position = 'absolute';
  midBackground.style.width = `${LEVEL_WIDTH}px`;
  midBackground.style.height = '120px';
  midBackground.style.bottom = '0';
  midBackground.style.left = '0';
  midBackground.style.zIndex = '2';
  
  // Add bushes using buisson.png image
  for (let i = 0; i < LEVEL_WIDTH / 100; i++) {
    const bush = document.createElement('img');
    bush.src = '/src/assets/images/buisson.png';
    bush.style.position = 'absolute';
    bush.style.width = '80px';
    bush.style.height = 'auto';
    bush.style.bottom = '0';
    bush.style.left = `${i * 100 + (i % 2) * 30}px`;
    bush.style.opacity = '0.8';
    midBackground.appendChild(bush);
  }
  
  levelContainer.appendChild(midBackground);
  
  // Create near background (clouds)
  const nearBackground = document.createElement('div');
  nearBackground.style.position = 'absolute';
  nearBackground.style.width = `${LEVEL_WIDTH}px`;
  nearBackground.style.height = `${LEVEL_HEIGHT}px`;
  nearBackground.style.left = '0';
  nearBackground.style.top = '0';
  nearBackground.style.zIndex = '3';
  
  // Add clouds using nuage.png image
  for (let i = 0; i < LEVEL_WIDTH / 200; i++) {
    const cloud = document.createElement('img');
    cloud.src = '/src/assets/images/nuage.png';
    cloud.style.position = 'absolute';
    cloud.style.width = '100px';
    cloud.style.height = 'auto';
    cloud.style.left = `${i * 200 + Math.random() * 100}px`;
    cloud.style.top = `${50 + Math.random() * 100}px`;
    cloud.style.opacity = '0.8';
    nearBackground.appendChild(cloud);
  }
  
  levelContainer.appendChild(nearBackground);
}

/**
 * Set up keyboard event listeners
 */
function setupEventListeners() {
  window.addEventListener('keydown', (e) => {
    keysPressed[e.key] = true;
    
    // Prevent default for arrow keys and space to avoid page scrolling
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
      e.preventDefault();
    }
    
    // Jump with space or up arrow
    if ((e.key === ' ' || e.key === 'ArrowUp') && player && !isGameOver) {
      if (player.isOnGround) {
        player.velocityY = JUMP_FORCE;
        player.isOnGround = false;
      }
    }
  });
  
  window.addEventListener('keyup', (e) => {
    keysPressed[e.key] = false;
  });
}

/**
 * Create a game object
 */
function createGameObject(x, y, width, height, type) {
  console.log(`Creating ${type} at (${x}, ${y})`);
  
  // Create DOM element
  const element = document.createElement('div');
  element.style.position = 'absolute';
  element.style.left = `${x}px`;
  element.style.top = `${y}px`;
  element.style.width = `${width}px`;
  element.style.height = `${height}px`;
  
  // Apply style based on type
  if (type === 'player') {
    // Use player.png image instead of CSS styling
    const playerImg = document.createElement('img');
    playerImg.src = '/src/assets/images/player.png';
    playerImg.style.width = '100%';
    playerImg.style.height = '100%';
    playerImg.style.objectFit = 'contain';
    element.appendChild(playerImg);
    element.style.zIndex = '10';
    
  } else if (type === 'enemy') {
    // Use enemy.png image instead of CSS styling
    const enemyImg = document.createElement('img');
    enemyImg.src = '/src/assets/images/enemy.png';
    enemyImg.style.width = '100%';
    enemyImg.style.height = '100%';
    enemyImg.style.objectFit = 'contain';
    element.appendChild(enemyImg);
    element.style.zIndex = '8';
    
  } else if (type === 'bonus') {
    // Use bonus.png image instead of CSS styling
    const bonusImg = document.createElement('img');
    bonusImg.src = '/src/assets/images/bonus.png';
    bonusImg.style.width = '100%';
    bonusImg.style.height = '100%';
    bonusImg.style.objectFit = 'contain';
    element.appendChild(bonusImg);
    element.style.zIndex = '7';
    
  } else if (type === 'platform') {
    // Use platform.png image as a repeating background instead of scaling
    element.style.backgroundImage = 'url(/src/assets/images/platform.png)';
    element.style.backgroundRepeat = 'repeat-x';
    element.style.backgroundSize = 'auto 100%'; // Maintain height, auto width for proper tiling
    element.style.zIndex = '5';
  }
  
  // Add to level container
  levelContainer.appendChild(element);
  
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
    
    // For enemies
    startX: x,
    patrolDistance: 100,
    
    // For bonuses
    collected: false
  };
  
  // Add to appropriate collections
  gameObjects.push(gameObject);
  if (type === 'player') {
    player = gameObject;
  } else if (type === 'platform') {
    platforms.push(gameObject);
  } else if (type === 'enemy') {
    enemies.push(gameObject);
  } else if (type === 'bonus') {
    bonuses.push(gameObject);
  }
  
  return gameObject;
}

/**
 * Create the game level
 */
function createLevel() {
  console.log('Creating level...');
  
  // Create the ground with segments across the entire level
  for (let x = 0; x < LEVEL_WIDTH; x += 64) {
    // Create gaps in the ground for challenge
    if (x > 500 && x < 650 || x > 1000 && x < 1100 || x > 1800 && x < 1950) {
      continue;
    }
    createGameObject(x, 550, 64, 16, 'platform');
  }
  
  // Create platforms throughout the level - adjusted heights to be reachable
  createGameObject(100, 450, 200, 16, 'platform');
  createGameObject(400, 400, 200, 16, 'platform');
  createGameObject(700, 350, 150, 16, 'platform');
  createGameObject(900, 350, 200, 16, 'platform'); // Adjusted from 300 to 350
  createGameObject(1200, 400, 150, 16, 'platform'); // Adjusted from 350 to 400
  createGameObject(1400, 450, 200, 16, 'platform'); // Adjusted from 400 to 450
  createGameObject(1700, 400, 150, 16, 'platform'); // Adjusted from 350 to 400
  createGameObject(2000, 350, 200, 16, 'platform'); // Adjusted from 300 to 350
  createGameObject(2300, 400, 150, 16, 'platform'); // Adjusted from 350 to 400
  createGameObject(2600, 450, 200, 16, 'platform'); // Adjusted from 400 to 450
  
  // Create some floating platforms - adjusted heights to be reachable
  createGameObject(600, 250, 100, 16, 'platform'); // Adjusted from 200 to 250
  createGameObject(1100, 250, 100, 16, 'platform'); // Adjusted from 150 to 250
  createGameObject(1600, 300, 100, 16, 'platform'); // Adjusted from 200 to 300
  createGameObject(2100, 250, 100, 16, 'platform'); // Adjusted from 150 to 250
  createGameObject(2500, 300, 100, 16, 'platform'); // Adjusted from 200 to 300
  
  // Create enemies throughout the level - adjusted positions to match new platforms
  createGameObject(450, 368, 32, 32, 'enemy');
  createGameObject(850, 318, 32, 32, 'enemy');
  createGameObject(1250, 368, 32, 32, 'enemy'); // Adjusted
  createGameObject(1650, 368, 32, 32, 'enemy'); // Adjusted
  createGameObject(2050, 318, 32, 32, 'enemy'); // Adjusted
  createGameObject(2450, 368, 32, 32, 'enemy'); // Adjusted
  
  // Create ground enemies
  createGameObject(250, 518, 32, 32, 'enemy');
  createGameObject(800, 518, 32, 32, 'enemy');
  createGameObject(1500, 518, 32, 32, 'enemy');
  createGameObject(2200, 518, 32, 32, 'enemy');
  
  // Create bonuses throughout the level - adjusted positions to match new platforms
  createGameObject(150, 420, 24, 24, 'bonus');
  createGameObject(550, 220, 24, 24, 'bonus'); // Adjusted
  createGameObject(750, 320, 24, 24, 'bonus');
  createGameObject(1050, 220, 24, 24, 'bonus'); // Adjusted
  createGameObject(1300, 370, 24, 24, 'bonus'); // Adjusted
  createGameObject(1550, 270, 24, 24, 'bonus'); // Adjusted
  createGameObject(1800, 370, 24, 24, 'bonus'); // Adjusted
  createGameObject(2050, 220, 24, 24, 'bonus'); // Adjusted
  createGameObject(2350, 370, 24, 24, 'bonus'); // Adjusted
  createGameObject(2550, 270, 24, 24, 'bonus'); // Adjusted
  createGameObject(2800, 520, 24, 24, 'bonus');
  
  // Create the player at the start of the level
  createGameObject(50, 500, 32, 32, 'player');
  
  console.log(`Created ${gameObjects.length} game objects`);
}

/**
 * Main game loop
 */
function gameLoop(timestamp) {
  if (isGameOver) return;
  
  // Handle player input
  handleInput();
  
  // Update all game objects
  updateGameObjects();
  
  // Update camera position
  updateCamera();
  
  // Check collisions
  checkCollisions();
  
  // Generate new level chunks if necessary
  generateNewLevelChunks();
  
  // Continue the game loop
  lastTimestamp = timestamp;
  animationFrameId = requestAnimationFrame(gameLoop);
}

/**
 * Handle player input
 */
function handleInput() {
  if (!player || isGameOver) return;
  
  // Handle left/right movement
  if (keysPressed['ArrowLeft']) {
    player.velocityX = -MOVE_SPEED;
    player.direction = -1;
    player.element.style.transform = 'scaleX(-1)';
  } else if (keysPressed['ArrowRight']) {
    player.velocityX = MOVE_SPEED;
    player.direction = 1;
    player.element.style.transform = 'scaleX(1)';
  } else {
    player.velocityX = 0;
  }
}

/**
 * Update all game objects
 */
function updateGameObjects() {
  // Update player
  if (player) {
    // Apply gravity
    player.velocityY += GRAVITY;
    
    // Update position
    player.x += player.velocityX;
    player.y += player.velocityY;
    
    // Keep player within level bounds
    if (player.x < 0) player.x = 0;
    if (player.x + player.width > LEVEL_WIDTH) {
      player.x = LEVEL_WIDTH - player.width;
    }
    
    // Check if player fell off the bottom of the screen
    if (player.y > LEVEL_HEIGHT) {
      gameOver();
    }
    
    // Update element position
    player.element.style.left = `${player.x}px`;
    player.element.style.top = `${player.y}px`;
  }
  
  // Update enemies
  for (const enemy of enemies) {
    // Patrol logic - move back and forth (reduced speed from 0.5 to 0.2)
    enemy.velocityX = MOVE_SPEED * 0.2 * enemy.direction;
    
    // Check if we need to change direction
    if (enemy.direction > 0 && enemy.x > enemy.startX + enemy.patrolDistance) {
      enemy.direction = -1;
      enemy.element.style.transform = 'scaleX(-1)';
    } else if (enemy.direction < 0 && enemy.x < enemy.startX) {
      enemy.direction = 1;
      enemy.element.style.transform = 'scaleX(1)';
    }
    
    // Update position
    enemy.x += enemy.velocityX;
    
    // Update element position
    enemy.element.style.left = `${enemy.x}px`;
  }
  
  // Update bonuses (floating effect)
  for (const bonus of bonuses) {
    if (!bonus.collected) {
      // Create a floating effect
      const floatY = Math.sin(Date.now() / 200) * 5;
      bonus.element.style.transform = `translateY(${floatY}px)`;
    }
  }
}

/**
 * Update camera position to follow the player
 */
function updateCamera() {
  if (!player) return;
  
  // Calculate target camera position (center on player)
  const targetX = player.x - VIEWPORT_WIDTH / 2 + player.width / 2;
  
  // Clamp camera position to level bounds
  cameraX = Math.max(0, Math.min(targetX, LEVEL_WIDTH - VIEWPORT_WIDTH));
  
  // Apply camera position to level container with smooth transition
  levelContainer.style.transform = `translateX(${-cameraX}px)`;
  
  // Update parallax background layers for depth effect
  const backgrounds = levelContainer.querySelectorAll('div');
  if (backgrounds.length >= 3) {
    // Far background (mountains) moves at 0.2x speed
    backgrounds[0].style.transform = `translateX(${cameraX * 0.2}px)`;
    
    // Mid background (bushes) moves at 0.5x speed
    backgrounds[1].style.transform = `translateX(${cameraX * 0.5}px)`;
  }
}

/**
 * Check collisions between game objects
 */
function checkCollisions() {
  if (!player || isGameOver) return;
  
  // Check platform collisions
  player.isOnGround = false;
  for (const platform of platforms) {
    if (checkCollision(player, platform)) {
      // Check if player is falling down (positive velocity Y)
      if (player.velocityY > 0) {
        // Check if player's feet are near the top of the platform
        const playerBottom = player.y + player.height;
        const platformTop = platform.y;
        
        // Improved collision detection with more generous threshold
        if (playerBottom - platformTop < 20) {
          // Land on the platform
          player.y = platform.y - player.height;
          player.velocityY = 0;
          player.isOnGround = true;
          break; // Exit loop once we've landed on a platform
        }
      } else if (player.velocityY < 0) {
        // Player is moving upward and hit the bottom of a platform
        const playerTop = player.y;
        const platformBottom = platform.y + platform.height;
        
        if (platformBottom - playerTop < 10) {
          // Hit head on platform
          player.y = platformBottom;
          player.velocityY = 0;
        }
      }
      
      // Handle horizontal collisions with platforms
      const playerRight = player.x + player.width;
      const platformRight = platform.x + platform.width;
      
      // Check if player is colliding from the sides
      if (player.y + player.height > platform.y + 5 && player.y < platform.y + platform.height - 5) {
        // Left side collision
        if (playerRight > platform.x && playerRight < platform.x + 15 && player.velocityX > 0) {
          player.x = platform.x - player.width;
        }
        // Right side collision
        else if (player.x < platformRight && player.x > platformRight - 15 && player.velocityX < 0) {
          player.x = platformRight;
        }
      }
    }
  }
  
  // Check enemy collisions
  for (const enemy of enemies) {
    if (checkCollision(player, enemy)) {
      // Check if player is jumping on top of the enemy
      const playerBottom = player.y + player.height;
      const enemyTop = enemy.y;
      
      if (player.velocityY > 0 && Math.abs(playerBottom - enemyTop) < 15) {
        // Remove the enemy
        const index = gameObjects.indexOf(enemy);
        if (index !== -1) {
          gameObjects.splice(index, 1);
        }
        
        const enemyIndex = enemies.indexOf(enemy);
        if (enemyIndex !== -1) {
          enemies.splice(enemyIndex, 1);
        }
        
        if (enemy.element && enemy.element.parentNode) {
          enemy.element.parentNode.removeChild(enemy.element);
        }
        
        // Bounce the player
        player.velocityY = JUMP_FORCE * 0.7;
        
        // Add points
        updateScore(200);
      } else {
        // Player hit the enemy from the side or bottom
        gameOver();
      }
    }
  }
  
  // Check bonus collisions
  for (const bonus of bonuses) {
    if (!bonus.collected && checkCollision(player, bonus)) {
      collectBonus(bonus);
    }
  }
}

/**
 * Check if two objects are colliding
 */
function checkCollision(a, b) {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

/**
 * Collect a bonus
 */
function collectBonus(bonus) {
  if (!bonus.collected) {
    bonus.collected = true;
    bonus.element.style.opacity = '0';
    bonus.element.style.transition = 'opacity 0.3s, transform 0.3s';
    bonus.element.style.transform = 'scale(1.5) translateY(-20px)';
    
    // Remove from DOM after animation
    setTimeout(() => {
      if (bonus.element && bonus.element.parentNode) {
        bonus.element.parentNode.removeChild(bonus.element);
      }
    }, 300);
    
    // Add points
    updateScore(100);
  }
}

/**
 * Update the score display
 */
function updateScore(points) {
  score += points;
  scoreElement.textContent = `Score: ${score}`;
}

/**
 * End the game
 */
function gameOver() {
  isGameOver = true;
  
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
    <p>Your score: ${score}</p>
    <button id="restart-button">Play Again</button>
  `;
  
  gameContainer.appendChild(gameOverElement);
  
  // Add restart button functionality
  document.getElementById('restart-button').addEventListener('click', () => {
    restartGame();
    gameContainer.removeChild(gameOverElement);
  });
}

/**
 * Restart the game
 */
function restartGame() {
  // Clear all game objects
  for (const gameObject of gameObjects) {
    if (gameObject.element && gameObject.element.parentNode) {
      gameObject.element.parentNode.removeChild(gameObject.element);
    }
  }
  
  // Reset game state
  gameObjects = [];
  player = null;
  platforms = [];
  enemies = [];
  bonuses = [];
  score = 0;
  isGameOver = false;
  cameraX = 0;
  
  // Update score display
  scoreElement.textContent = 'Score: 0';
  
  // Reset level container position
  levelContainer.style.transform = 'translateX(0)';
  
  // Remove all children from level container
  while (levelContainer.firstChild) {
    levelContainer.removeChild(levelContainer.firstChild);
  }
  
  // Recreate background
  createBackground();
  
  // Create new level
  createLevel();
  
  // Cancel any existing animation frame
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
  }
  
  // Restart the game loop
  lastTimestamp = performance.now();
  animationFrameId = requestAnimationFrame(gameLoop);
}

/**
 * Generate new level chunks
 */
function generateNewLevelChunks() {
  // Check if player has reached the end of the current level
  if (player.x + player.width > LEVEL_WIDTH - CHUNK_SIZE) {
    // Generate new level chunk
    const newChunk = generateLevelChunk(LEVEL_WIDTH, LEVEL_HEIGHT);
    LEVEL_WIDTH += CHUNK_SIZE;
    levelContainer.style.width = `${LEVEL_WIDTH}px`;
    
    // Add new platforms, enemies, and bonuses to the level
    for (const platform of newChunk.platforms) {
      platforms.push(platform);
      gameObjects.push(platform);
    }
    for (const enemy of newChunk.enemies) {
      enemies.push(enemy);
      gameObjects.push(enemy);
    }
    for (const bonus of newChunk.bonuses) {
      bonuses.push(bonus);
      gameObjects.push(bonus);
    }
  }
}

/**
 * Generate a new level chunk
 */
function generateLevelChunk(startX, height) {
  const platforms = [];
  const enemies = [];
  const bonuses = [];
  
  // Create ground with gaps
  for (let x = startX; x < startX + CHUNK_SIZE; x += 64) {
    // Create gaps in the ground for challenge (approximately 20% chance of gap)
    if (Math.random() < 0.2) {
      // Skip creating a platform here to create a gap
      x += 64; // Make the gap at least 2 platforms wide
      continue;
    }
    platforms.push(createGameObject(x, 550, 64, 16, 'platform'));
  }
  
  // Create a path of platforms that can be traversed
  // Start with platforms at different heights
  const platformHeights = [450, 400, 350, 300, 250];
  let lastPlatformX = startX + 100;
  
  for (let i = 0; i < 8; i++) {
    // Select a random height for this platform
    const height = platformHeights[Math.floor(Math.random() * platformHeights.length)];
    
    // Create a platform
    const platformWidth = Math.random() * 100 + 100; // Between 100 and 200
    const platform = createGameObject(lastPlatformX, height, platformWidth, 16, 'platform');
    platforms.push(platform);
    
    // Add an enemy on some platforms (30% chance)
    if (Math.random() < 0.3) {
      const enemy = createGameObject(lastPlatformX + platformWidth / 2 - 16, height - 32, 32, 32, 'enemy');
      enemies.push(enemy);
    }
    
    // Add a bonus above some platforms (40% chance)
    if (Math.random() < 0.4) {
      const bonus = createGameObject(lastPlatformX + platformWidth / 2 - 12, height - 50, 24, 24, 'bonus');
      bonuses.push(bonus);
    }
    
    // Calculate the next platform position
    // Ensure it's reachable with a jump (use MAX_JUMP_HEIGHT)
    const jumpDistance = Math.random() * 150 + 50; // Between 50 and 200
    lastPlatformX += platformWidth + jumpDistance;
  }
  
  // Add some floating platforms with bonuses
  for (let i = 0; i < 3; i++) {
    const x = startX + Math.random() * (CHUNK_SIZE - 100);
    const y = 150 + Math.random() * 100; // Higher platforms
    const width = 80;
    
    const platform = createGameObject(x, y, width, 16, 'platform');
    platforms.push(platform);
    
    // Add a bonus on each floating platform
    const bonus = createGameObject(x + width / 2 - 12, y - 40, 24, 24, 'bonus');
    bonuses.push(bonus);
  }
  
  // Add a few more enemies on the ground
  for (let i = 0; i < 3; i++) {
    const x = startX + Math.random() * CHUNK_SIZE;
    const enemy = createGameObject(x, 518, 32, 32, 'enemy');
    enemies.push(enemy);
  }
  
  // Extend the background elements
  extendBackground(startX, startX + CHUNK_SIZE);
  
  return { platforms, enemies, bonuses };
}

/**
 * Extend the background elements for the new chunk
 */
function extendBackground(startX, endX) {
  // Get the background layers
  const backgrounds = levelContainer.querySelectorAll('div');
  if (backgrounds.length < 3) return;
  
  const farBackground = backgrounds[0];
  const midBackground = backgrounds[1];
  const nearBackground = backgrounds[2];
  
  // Add mountains to far background
  for (let i = 0; i < CHUNK_SIZE / 200; i++) {
    const mountain = document.createElement('img');
    mountain.src = '/src/assets/images/mountains.png';
    mountain.style.position = 'absolute';
    mountain.style.height = 'auto';
    mountain.style.bottom = '0';
    mountain.style.left = `${startX + i * 200}px`;
    mountain.style.opacity = '0.8';
    
    // Ensure mountains are properly sized and positioned
    mountain.onload = function() {
      mountain.style.left = `${startX + i * (this.naturalWidth - 20)}px`;
    };
    
    farBackground.appendChild(mountain);
  }
  
  // Add bushes to mid background
  for (let i = 0; i < CHUNK_SIZE / 100; i++) {
    const bush = document.createElement('img');
    bush.src = '/src/assets/images/buisson.png';
    bush.style.position = 'absolute';
    bush.style.width = '80px';
    bush.style.height = 'auto';
    bush.style.bottom = '0';
    bush.style.left = `${startX + i * 100 + (i % 2) * 30}px`;
    bush.style.opacity = '0.8';
    midBackground.appendChild(bush);
  }
  
  // Add clouds to near background
  for (let i = 0; i < CHUNK_SIZE / 200; i++) {
    const cloud = document.createElement('img');
    cloud.src = '/src/assets/images/nuage.png';
    cloud.style.position = 'absolute';
    cloud.style.width = '100px';
    cloud.style.height = 'auto';
    cloud.style.left = `${startX + i * 200 + Math.random() * 100}px`;
    cloud.style.top = `${50 + Math.random() * 100}px`;
    cloud.style.opacity = '0.8';
    nearBackground.appendChild(cloud);
  }
}

// Export the game initialization function
export default initGame;
