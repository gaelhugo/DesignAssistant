/**
 * Base GameObject class for all game elements
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
   * Create DOM element for the game object
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
   * Update the position of the DOM element
   */
  updatePosition() {
    if (this.element) {
      this.element.style.left = `${this.x}px`;
      this.element.style.top = `${this.y}px`;
    }
  }

  /**
   * Update the texture of the game object
   * @param {string} imagePath - Path to the new image
   */
  updateTexture(imagePath) {
    if (!this.element) return;
    
    // Find existing image element or create a new one
    let imgElement = this.element.querySelector('img');
    if (!imgElement) {
      imgElement = document.createElement('img');
      imgElement.style.width = '100%';
      imgElement.style.height = '100%';
      imgElement.style.objectFit = 'contain';
      this.element.appendChild(imgElement);
    }
    
    // Update the image source
    imgElement.src = imagePath;
  }
}
