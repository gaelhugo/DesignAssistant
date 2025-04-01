/**
 * Classe de base GameObject pour tous les éléments du jeu
 */
export class GameObject {
  constructor(x, y, width, height, type) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.type = type;
    this.velocityX = 0;
    this.velocityY = 0;
    this.isOnGround = false;
    this.direction = 1;
    this.element = null;
  }

  /**
   * Crée l'élément DOM pour l'objet du jeu
   */
  createDOMElement() {
    const element = document.createElement("div");
    element.style.position = "absolute";
    element.style.left = `${this.x}px`;
    element.style.top = `${this.y}px`;
    element.style.width = `${this.width}px`;
    element.style.height = `${this.height}px`;
    this.element = element;
    return element;
  }

  /**
   * Met à jour la position de l'élément DOM
   */
  updatePosition() {
    if (this.element) {
      this.element.style.left = `${this.x}px`;
      this.element.style.top = `${this.y}px`;
    }
  }

  /**
   * Met à jour la texture de l'objet du jeu
   * @param {string} imagePath - Chemin vers la nouvelle image
   */
  updateTexture(imagePath) {
    if (!this.element) return;
    
    // Trouve l'élément image existant ou en crée un nouveau
    let imgElement = this.element.querySelector('img');
    if (!imgElement) {
      imgElement = document.createElement('img');
      imgElement.style.width = '100%';
      imgElement.style.height = '100%';
      imgElement.style.objectFit = 'contain';
      this.element.appendChild(imgElement);
    }
    
    // Met à jour la source de l'image
    imgElement.src = imagePath;
  }
}
