import GameObject from '../core/GameObject.js';

/**
 * Enemy class representing obstacles that can harm the player
 */
export default class Enemy extends GameObject {
  constructor(x, y, texture) {
    super(x, y, 32, 32, texture);
    this.moveSpeed = 100;
    this.direction = 1; // 1 for right, -1 for left
    this.patrolDistance = 100;
    this.startX = x;
  }

  /**
   * Override createElement to add enemy-specific styling
   */
  createElement() {
    const element = super.createElement();
    element.style.zIndex = '8';
    return element;
  }

  /**
   * Update enemy movement - patrol back and forth
   */
  update(deltaTime) {
    // Patrol logic - move back and forth
    this.velocityX = this.moveSpeed * this.direction;
    
    // Check if we need to change direction
    if (this.direction > 0 && this.x > this.startX + this.patrolDistance) {
      this.direction = -1;
      this.element.style.transform = 'scaleX(-1)';
    } else if (this.direction < 0 && this.x < this.startX) {
      this.direction = 1;
      this.element.style.transform = 'scaleX(1)';
    }
    
    super.update(deltaTime);
  }
}
