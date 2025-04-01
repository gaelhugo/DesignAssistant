import { GameObject } from './GameObject.js';

/**
 * Classe Player représentant le personnage du joueur
 */
export class Player extends GameObject {
  constructor(x, y, width, height) {
    super(x, y, width, height, 'player');
    this.defaultTexture = '/src/assets/images/player.png';
  }

  /**
   * Crée l'élément DOM pour le joueur
   */
  createDOMElement() {
    const element = super.createDOMElement();
    element.style.zIndex = '10';
    this.updateTexture(this.defaultTexture);
    return element;
  }

  /**
   * Met à jour la direction du joueur et retourne le sprite en conséquence
   * @param {number} direction - Direction (1 pour droite, -1 pour gauche)
   */
  updateDirection(direction) {
    this.direction = direction;
    const playerImg = this.element.querySelector('img');
    if (playerImg) {
      playerImg.style.transform = this.direction === 1 ? 'scaleX(1)' : 'scaleX(-1)';
    }
  }
}
