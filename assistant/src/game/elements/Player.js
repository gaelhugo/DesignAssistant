import { GameObject } from './GameObject.js';

/**
 * Player class representing the player character
 */
export class Player extends GameObject {
  constructor(x, y, width, height) {
    super(x, y, width, height, 'player');
    this.defaultTexture = '/src/assets/images/player.png';
  }

  /**
   * Create DOM element for the player
   */
  createDOMElement() {
    const element = super.createDOMElement();
    element.style.zIndex = '10';
    this.updateTexture(this.defaultTexture);
    return element;
  }

  /**
   * Update the player's direction and flip the sprite accordingly
   * @param {number} direction - Direction (1 for right, -1 for left)
   */
  updateDirection(direction) {
    this.direction = direction;
    const playerImg = this.element.querySelector('img');
    if (playerImg) {
      playerImg.style.transform = this.direction === 1 ? 'scaleX(1)' : 'scaleX(-1)';
    }
  }
}
