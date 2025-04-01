import { GameObject } from './GameObject.js';

/**
 * Classe Enemy représentant les ennemis du jeu
 */
export class Enemy extends GameObject {
  constructor(x, y, width, height) {
    super(x, y, width, height, 'enemy');
    this.defaultTexture = '/src/assets/images/enemy.png';
  }

  /**
   * Crée l'élément DOM pour l'ennemi
   */
  createDOMElement() {
    const element = super.createDOMElement();
    element.style.zIndex = '8';
    this.updateTexture(this.defaultTexture);
    return element;
  }

  /**
   * Met à jour la direction de l'ennemi et retourne le sprite en conséquence
   * @param {number} direction - Direction (1 pour droite, -1 pour gauche)
   */
  updateDirection(direction) {
    this.direction = direction;
    const enemyImg = this.element.querySelector('img');
    if (enemyImg) {
      enemyImg.style.transform = this.direction === 1 ? 'scaleX(1)' : 'scaleX(-1)';
    }
  }
}
