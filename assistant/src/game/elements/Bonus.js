import { GameObject } from './GameObject.js';

/**
 * Bonus class representing collectible bonuses
 */
export class Bonus extends GameObject {
  constructor(x, y, width, height) {
    super(x, y, width, height, 'bonus');
    this.defaultTexture = '/src/assets/images/bonus.png';
  }

  /**
   * Create DOM element for the bonus
   */
  createDOMElement() {
    const element = super.createDOMElement();
    element.style.zIndex = '7';
    this.updateTexture(this.defaultTexture);
    return element;
  }
}
