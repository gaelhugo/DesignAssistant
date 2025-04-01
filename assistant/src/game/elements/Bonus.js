import { GameObject } from './GameObject.js';

/**
 * Classe Bonus représentant les bonus collectables
 */
export class Bonus extends GameObject {
  constructor(x, y, width, height) {
    super(x, y, width, height, 'bonus');
    this.defaultTexture = '/src/assets/images/bonus.png';
  }

  /**
   * Crée l'élément DOM pour le bonus
   */
  createDOMElement() {
    const element = super.createDOMElement();
    element.style.zIndex = '7';
    this.updateTexture(this.defaultTexture);
    return element;
  }
}
