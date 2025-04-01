/**
 * Background class for managing parallax backgrounds
 */
export class Background {
  constructor(levelContainer, levelWidth) {
    this.levelContainer = levelContainer;
    this.levelWidth = levelWidth;
    this.farBackground = null;
    this.midBackground = null;
    this.nearBackground = null;
    
    // Default textures
    this.mountainTexture = '/src/assets/images/mountains.png';
    this.hillTexture = '/src/assets/images/buisson.png';
    this.cloudTexture = '/src/assets/images/nuage.png';
    
    // Spacing for mountains to prevent overlaps
    this.mountainSpacing = 300; // Increased spacing between mountains
  }

  /**
   * Create the parallax background layers
   */
  createBackground() {
    // Create far background (mountains)
    this.farBackground = document.createElement("div");
    this.farBackground.style.position = "absolute";
    this.farBackground.style.width = `${this.levelWidth}px`;
    this.farBackground.style.height = "200px";
    this.farBackground.style.bottom = "0";
    this.farBackground.style.left = "0";
    this.farBackground.style.zIndex = "1";

    // Create mid background (hills)
    this.midBackground = document.createElement("div");
    this.midBackground.style.position = "absolute";
    this.midBackground.style.width = `${this.levelWidth}px`;
    this.midBackground.style.height = "100px";
    this.midBackground.style.bottom = "0";
    this.midBackground.style.left = "0";
    this.midBackground.style.zIndex = "2";

    // Create near background (clouds)
    this.nearBackground = document.createElement("div");
    this.nearBackground.style.position = "absolute";
    this.nearBackground.style.width = `${this.levelWidth}px`;
    this.nearBackground.style.height = "200px";
    this.nearBackground.style.top = "0";
    this.nearBackground.style.left = "0";
    this.nearBackground.style.zIndex = "3";

    // Add elements to the backgrounds
    this.populateBackground(0, this.levelWidth);

    // Add backgrounds to level container
    this.levelContainer.appendChild(this.farBackground);
    this.levelContainer.appendChild(this.midBackground);
    this.levelContainer.appendChild(this.nearBackground);
  }

  /**
   * Populate the background with elements
   * @param {number} startX - Starting X position
   * @param {number} endX - Ending X position
   */
  populateBackground(startX, endX) {
    const width = endX - startX;
    
    // Add mountains to far background with fixed spacing
    for (let i = 0; i < width / this.mountainSpacing; i++) {
      this.createMountain(startX + i * this.mountainSpacing);
    }

    // Add hills to mid background
    for (let i = 0; i < width / 100; i++) {
      this.createHill(startX + i * 80);
    }

    // Add clouds to near background
    for (let i = 0; i < width / 200; i++) {
      this.createCloud(startX + i * 200 + Math.random() * 100);
    }
  }

  /**
   * Create a mountain element
   * @param {number} x - X position
   */
  createMountain(x) {
    const mountain = document.createElement("img");
    mountain.src = this.mountainTexture;
    mountain.style.position = "absolute";
    mountain.style.height = "200px"; // Fixed height for consistency
    mountain.style.bottom = "0";
    mountain.style.left = `${x}px`;
    mountain.style.opacity = "0.8";
    
    // No need for onload adjustment which was causing the overlap issues
    this.farBackground.appendChild(mountain);
    return mountain;
  }

  /**
   * Create a hill element
   * @param {number} x - X position
   */
  createHill(x) {
    const hill = document.createElement("img");
    hill.src = this.hillTexture;
    hill.style.position = "absolute";
    hill.style.width = "100px";
    hill.style.height = "auto";
    hill.style.bottom = "0";
    hill.style.left = `${x}px`;
    hill.style.opacity = "0.9";
    this.midBackground.appendChild(hill);
    return hill;
  }

  /**
   * Create a cloud element
   * @param {number} x - X position
   */
  createCloud(x) {
    const cloud = document.createElement("img");
    cloud.src = this.cloudTexture;
    cloud.style.position = "absolute";
    cloud.style.width = "100px";
    cloud.style.height = "auto";
    cloud.style.left = `${x}px`;
    cloud.style.top = `${50 + Math.random() * 100}px`;
    cloud.style.opacity = "0.8";
    this.nearBackground.appendChild(cloud);
    return cloud;
  }

  /**
   * Extend the background for a new chunk
   * @param {number} startX - Starting X position
   * @param {number} endX - Ending X position
   */
  extendBackground(startX, endX) {
    this.populateBackground(startX, endX);
    this.levelWidth = endX;
    
    // Update background widths
    this.farBackground.style.width = `${this.levelWidth}px`;
    this.midBackground.style.width = `${this.levelWidth}px`;
    this.nearBackground.style.width = `${this.levelWidth}px`;
  }

  /**
   * Update the camera position for parallax effect
   * @param {number} cameraX - Camera X position
   */
  updateCamera(cameraX) {
    // Apply parallax effect to background layers
    if (this.farBackground && this.midBackground && this.nearBackground) {
      // Far background (mountains) - slowest parallax
      this.farBackground.style.transform = `translateX(${cameraX * 0.2}px)`;

      // Mid background (hills) - medium parallax
      this.midBackground.style.transform = `translateX(${cameraX * 0.5}px)`;

      // Near background (clouds) - fastest parallax
      this.nearBackground.style.transform = `translateX(${cameraX * 0.8}px)`;
    }
  }

  /**
   * Update the texture for mountains
   * @param {string} imagePath - Path to the new image
   */
  updateMountainTexture(imagePath) {
    this.mountainTexture = imagePath;
    const mountains = this.farBackground.querySelectorAll('img');
    mountains.forEach(mountain => {
      mountain.src = imagePath;
    });
  }

  /**
   * Update the texture for hills
   * @param {string} imagePath - Path to the new image
   */
  updateHillTexture(imagePath) {
    this.hillTexture = imagePath;
    const hills = this.midBackground.querySelectorAll('img');
    hills.forEach(hill => {
      hill.src = imagePath;
    });
  }

  /**
   * Update the texture for clouds
   * @param {string} imagePath - Path to the new image
   */
  updateCloudTexture(imagePath) {
    this.cloudTexture = imagePath;
    const clouds = this.nearBackground.querySelectorAll('img');
    clouds.forEach(cloud => {
      cloud.src = imagePath;
    });
  }
}
