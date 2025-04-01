import { GameObject } from './GameObject.js';

/**
 * Classe Platform représentant les plateformes du jeu
 */
export class Platform extends GameObject {
  constructor(x, y, width, height) {
    super(x, y, width, height, 'platform');
    this.defaultTexture = '/src/assets/images/platform.png';
  }

  /**
   * Crée l'élément DOM pour la plateforme
   */
  createDOMElement() {
    const element = super.createDOMElement();
    element.style.zIndex = '5';
    
    // Pour les plateformes, nous utilisons background-image au lieu d'un élément img
    element.style.backgroundImage = `url(${this.defaultTexture})`;
    element.style.backgroundRepeat = 'repeat-x';
    element.style.backgroundSize = 'auto 100%';
    
    return element;
  }

  /**
   * Met à jour la texture de la plateforme
   * @param {string} imagePath - Chemin vers la nouvelle image
   */
  updateTexture(imagePath) {
    if (!this.element) return;
    
    // Pour les plateformes, met à jour l'image de fond
    this.element.style.backgroundImage = `url(${imagePath})`;
  }
}
