import GameObject from '../core/GameObject.js';

/**
 * Bonus class representing collectible items that give points or power-ups
 */
export default class Bonus extends GameObject {
  constructor(x, y, texture) {
    super(x, y, 24, 24, texture);
    this.collected = false;
    this.points = 100;
    this.floatOffset = 0;
    this.floatSpeed = 2;
  }

  /**
   * Override createElement to add bonus-specific styling
   */
  createElement() {
    const element = super.createElement();
    element.style.zIndex = '7';
    return element;
  }

  /**
   * Update bonus animation (floating effect)
   */
  update(deltaTime) {
    if (!this.collected) {
      // Create a floating effect
      this.floatOffset += this.floatSpeed * deltaTime;
      const floatY = Math.sin(this.floatOffset) * 5;
      
      if (this.element) {
        this.element.style.transform = `translateY(${floatY}px)`;
      }
    }
  }

  /**
   * Collect the bonus
   */
  collect() {
    if (!this.collected) {
      this.collected = true;
      if (this.element) {
        this.element.style.opacity = '0';
        this.element.style.transition = 'opacity 0.3s, transform 0.3s';
        this.element.style.transform = 'scale(1.5) translateY(-20px)';
        
        // Remove from DOM after animation
        setTimeout(() => {
          if (this.element && this.element.parentNode) {
            this.element.parentNode.removeChild(this.element);
          }
        }, 300);
      }
      return this.points;
    }
    return 0;
  }
}
