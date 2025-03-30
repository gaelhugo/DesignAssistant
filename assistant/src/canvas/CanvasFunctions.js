export default class CanvasFunctions {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.width = canvas.width;
    this.height = canvas.height;

    this.images = [];
    this.draw();
  }

  clear() {
    this.images = [];
  }

  addImage(image) {
    console.log("Chargement de l'image: " + image);
    const img = new Image();
    img.src = "images/" + image.toLowerCase();
    img.crossOrigin = "anonymous";
    let _img = {};
    img.onload = () => {
      console.log("Image chargée: " + image);
      const rnd = Math.random() * 100;
      _img = {
        image: img,
        x: Math.random() * (this.width - 250),
        y: Math.random() * (this.height - 250),
        width: 150 + rnd,
        height: 150 + rnd,
      };
      this.images.push(_img);
    };
  }

  draw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    // console.log("Drawing");
    // this.images.forEach((img) => {
    //   this.ctx.drawImage(
    //     img.image,
    //     img.x + Math.random() * 2,
    //     img.y + Math.random() * 2,
    //     img.width,
    //     img.height
    //   );
    this.displayImagesGrid(this.images, {
      columns: Math.ceil(this.images.length / 2),
      spacing: 20,
    });
    // });
    requestAnimationFrame(() => this.draw());
  }

  /**
   * Displays images in a structured grid layout
   * @param {Array} images - Array of image URLs or objects
   * @param {Object} options - Layout options
   */
  displayImagesGrid(images, options = {}) {
    const { columns = 3, spacing = 20 } = options;
    const canvasWidth = this.canvas.width;
    const imageWidth = (canvasWidth - (columns + 1) * spacing) / columns;

    images.forEach((image, index) => {
      const row = Math.floor(index / columns);
      const col = index % columns;
      const x = col * (imageWidth + spacing) + spacing;
      const y = row * (imageWidth + spacing) + spacing;

      this.ctx.drawImage(image.image, x, y, imageWidth, imageWidth);
    });
  }
}
