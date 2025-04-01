import { GameObject } from './GameObject.js';

/**
 * Enemy class representing game enemies
 */
export class Enemy extends GameObject {
  constructor(x, y, width, height) {
    super(x, y, width, height, 'enemy');
    this.defaultTexture = '/src/assets/images/enemy.png';
  }

  /**
   * Create DOM element for the enemy
   */
  createDOMElement() {
    const element = super.createDOMElement();
    element.style.zIndex = '8';
    this.updateTexture(this.defaultTexture);
    return element;
  }

  /**
   * Update the enemy's direction and flip the sprite accordingly
   * @param {number} direction - Direction (1 for right, -1 for left)
   */
  updateDirection(direction) {
    this.direction = direction;
    const enemyImg = this.element.querySelector('img');
    if (enemyImg) {
      enemyImg.style.transform = this.direction === 1 ? 'scaleX(1)' : 'scaleX(-1)';
    }
  }
}
