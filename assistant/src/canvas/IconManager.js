export default class IconManager {
  constructor(ctx) {
    this.ctx = ctx;

    this.icons = {};
    // this.spreadsheets = [];
    this.images = [];
    this.cropData = [];
    // this.loadSpreadsheetIcons();

    this.canvasMemory = document.createElement("canvas");
    this.memoryctx = this.canvasMemory.getContext("2d");
  }

  async loadSpreadsheetIcons() {
    // Load all spreadsheets and their data
    for (let i = 1; i <= 13; i++) {
      console.log(`Loading spreadsheet ${i}...`);
      try {
        const response = await fetch(`/images/spreadsheet${i}.json`);
        if (!response.ok) {
          throw new Error(
            `Failed to load spreadsheet${i}.json: ${response.status} ${response.statusText}`
          );
        }
        const data = await response.json();
        this.cropData.push(data);
        console.log(`Successfully loaded JSON for spreadsheet ${i}`);

        const img = new Image();
        img.src = `/images/spreadsheet${i}.png`;
        console.log(`Starting to load image ${i}: ${img.src}`);

        await new Promise((resolve, reject) => {
          img.onload = () => {
            console.log(`Successfully loaded image ${i}`);
            resolve();
          };
          img.onerror = () => {
            reject(new Error(`Failed to load image ${img.src}`));
          };
        });

        this.images.push(img);
      } catch (error) {
        console.error(`Error loading spreadsheet ${i}:`, error);
        throw error;
      }
    }

    console.log(this.images);

    // formatter le dictionnaire
    this.cropData.forEach((spreadsheet, index) => {
      spreadsheet.forEach((infos) => {
        if (!this.icons.hasOwnProperty(infos.label)) {
          this.icons[infos.label] = {
            crop: {
              x: infos.box_2d[0],
              y: infos.box_2d[1],
              width: infos.box_2d[2] - infos.box_2d[0],
              height: infos.box_2d[3] - infos.box_2d[1],
            },
            image: this.images[index],
          };
        }
      });
    });
    console.log("Icons loaded:", this.icons);

    // this.drawIcon(
    //   "towel",
    //   window.innerWidth * Math.random(),
    //   window.innerHeight * Math.random()
    // );
  }

  drawIcon(lexique, x, y, new_width = null, new_height = null) {
    // this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.drawImage(
      this.icons[lexique].image,
      this.icons[lexique].crop.x,
      this.icons[lexique].crop.y,
      this.icons[lexique].crop.width,
      this.icons[lexique].crop.height,
      x,
      y,
      !new_width ? this.icons[lexique].crop.width : new_width,
      !new_height ? this.icons[lexique].crop.height : new_height
    );
  }

  listDict() {
    // Liste les icônes disponibles
    const iconList = Object.keys(this.icons);
    iconList.forEach((icon) => {
      console.log(icon);
    });
  }

  // fonction pour récupérer le dataurl d'une icone
  getIconDataUrl(lexique) {
    if (!this.icons[lexique]) {
      // throw new Error(`Icon with lexique "${lexique}" does not exist.`);
      console.warn(`Icon with lexique "${lexique}" does not exist.`);
      return null;
    } else {
      // const canvas = document.createElement("canvas");
      // const ctx = canvas.getContext("2d");
      this.memoryctx.clearRect(
        0,
        0,
        this.canvasMemory.width,
        this.canvasMemory.height
      );
      this.canvasMemory.width = this.icons[lexique].crop.width;
      this.canvasMemory.height = this.icons[lexique].crop.height;

      this.memoryctx.drawImage(
        this.icons[lexique].image,
        this.icons[lexique].crop.x,
        this.icons[lexique].crop.y,
        this.icons[lexique].crop.width,
        this.icons[lexique].crop.height,
        0,
        0,
        this.icons[lexique].crop.width,
        this.icons[lexique].crop.height
      );
      // console.log("texture to be ready", lexique);
      return this.canvasMemory.toDataURL();
    }
  }
}
