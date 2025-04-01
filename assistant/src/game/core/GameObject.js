/**
 * Base class for all game objects
 */
export default class GameObject {
  constructor(x, y, width, height, texture) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.texture = texture;
    this.element = null;
    this.velocityX = 0;
    this.velocityY = 0;
    
    console.log(`Created GameObject at (${x}, ${y}) with texture: ${texture}`);
  }

  /**
   * Create the DOM element for this game object
   */
  createElement() {
    this.element = document.createElement('div');
    this.element.style.position = 'absolute';
    this.element.style.width = `${this.width}px`;
    this.element.style.height = `${this.height}px`;
    this.element.style.backgroundImage = `url(${this.texture})`;
    this.element.style.backgroundSize = 'contain';
    this.element.style.backgroundRepeat = 'no-repeat';
    this.updatePosition();
    
    console.log(`Created element for GameObject with texture: ${this.texture}`);
    
    return this.element;
  }

  /**
   * Update the position of the element based on current x,y coordinates
   */
  updatePosition() {
    if (this.element) {
      this.element.style.left = `${this.x}px`;
      this.element.style.top = `${this.y}px`;
    }
  }

  /**
   * Change the texture of the game object
   * @param {string} newTexture - Path to the new texture
   */
  setTexture(newTexture) {
    this.texture = newTexture;
    if (this.element) {
      this.element.style.backgroundImage = `url(${this.texture})`;
    }
  }

  /**
   * Update method to be called on each frame
   * @param {number} deltaTime - Time since last update in milliseconds
   */
  update(deltaTime) {
    // Base update method, to be overridden by subclasses
    this.x += this.velocityX * deltaTime;
    this.y += this.velocityY * deltaTime;
    this.updatePosition();
  }

  /**
   * Check if this object collides with another object
   * @param {GameObject} other - The other game object to check collision with
   * @returns {boolean} - True if collision detected, false otherwise
   */
  collidesWith(other) {
    return (
      this.x < other.x + other.width &&
      this.x + this.width > other.x &&
      this.y < other.y + other.height &&
      this.y + this.height > other.y
    );
  }
}
