import GameObject from '../core/GameObject.js';

/**
 * Platform class representing solid ground for the player to stand on
 */
export default class Platform extends GameObject {
  constructor(x, y, width, texture) {
    super(x, y, width, 16, texture);
    this.isSolid = true;
  }

  /**
   * Override createElement to add platform-specific styling
   */
  createElement() {
    const element = super.createElement();
    element.style.zIndex = '5';
    return element;
  }
}
