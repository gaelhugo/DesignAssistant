import { GameObject } from './GameObject.js';

/**
 * Platform class representing game platforms
 */
export class Platform extends GameObject {
  constructor(x, y, width, height) {
    super(x, y, width, height, 'platform');
    this.defaultTexture = '/src/assets/images/platform.png';
  }

  /**
   * Create DOM element for the platform
   */
  createDOMElement() {
    const element = super.createDOMElement();
    element.style.zIndex = '5';
    
    // For platforms, we use background-image instead of an img element
    element.style.backgroundImage = `url(${this.defaultTexture})`;
    element.style.backgroundRepeat = 'repeat-x';
    element.style.backgroundSize = 'auto 100%';
    
    return element;
  }

  /**
   * Update the texture of the platform
   * @param {string} imagePath - Path to the new image
   */
  updateTexture(imagePath) {
    if (!this.element) return;
    
    // For platforms, update the background image
    this.element.style.backgroundImage = `url(${imagePath})`;
  }
}
