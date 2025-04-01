import GameObject from '../core/GameObject.js';

/**
 * Player class representing the main character
 */
export default class Player extends GameObject {
  constructor(x, y, texture) {
    super(x, y, 32, 32, texture);
    this.jumpForce = -400;
    this.moveSpeed = 200;
    this.gravity = 900;
    this.isJumping = false;
    this.isOnGround = false;
    this.direction = 1; // 1 for right, -1 for left
  }

  /**
   * Override createElement to add player-specific styling
   */
  createElement() {
    const element = super.createElement();
    element.style.zIndex = '10';
    return element;
  }

  /**
   * Make the player jump if on the ground
   */
  jump() {
    if (this.isOnGround) {
      this.velocityY = this.jumpForce;
      this.isJumping = true;
      this.isOnGround = false;
    }
  }

  /**
   * Move the player left
   */
  moveLeft() {
    this.velocityX = -this.moveSpeed;
    this.direction = -1;
    this.element.style.transform = 'scaleX(-1)';
  }

  /**
   * Move the player right
   */
  moveRight() {
    this.velocityX = this.moveSpeed;
    this.direction = 1;
    this.element.style.transform = 'scaleX(1)';
  }

  /**
   * Stop horizontal movement
   */
  stopMoving() {
    this.velocityX = 0;
  }

  /**
   * Update player position and apply gravity
   */
  update(deltaTime) {
    // Apply gravity
    this.velocityY += this.gravity * deltaTime;
    
    // Update position
    super.update(deltaTime);
  }

  /**
   * Handle collision with platforms
   * @param {GameObject} platform - The platform the player is colliding with
   */
  handlePlatformCollision(platform) {
    // Check if player is falling down (positive velocity Y)
    if (this.velocityY > 0) {
      // Check if player's feet are near the top of the platform
      const playerBottom = this.y + this.height;
      const platformTop = platform.y;
      
      if (Math.abs(playerBottom - platformTop) < 10) {
        // Land on the platform
        this.y = platform.y - this.height;
        this.velocityY = 0;
        this.isJumping = false;
        this.isOnGround = true;
      }
    }
  }
}
