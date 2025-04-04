/**
 * Classe Background pour gérer les arrière-plans parallaxes
 */
export class Background {
  constructor(levelContainer, levelWidth) {
    this.levelContainer = levelContainer;
    this.levelWidth = levelWidth;
    this.farBackground = null;
    this.midBackground = null;
    this.nearBackground = null;

    // Textures par défaut
    this.mountainTexture = "/src/assets/images/mountains.png";
    this.hillTexture = "/src/assets/images/buisson.png";
    this.cloudTexture = "/src/assets/images/nuage.png";

    // Propriétés des montagnes
    this.mountainHeight = Math.random() * (700 - 250) + 250; // Hauteur en pixels
    this.mountainSpacing = Math.random() * (700 - 375) + 375; // Espacement proportionnel à la hauteur (1.5x la hauteur)
  }

  /**
   * Crée les couches d'arrière-plan parallaxes
   */
  createBackgroundLayers() {
    // Crée l'arrière-plan lointain (montagnes)
    this.farBackground = document.createElement("div");
    this.farBackground.style.position = "absolute";
    this.farBackground.style.width = `${this.levelWidth}px`;
    this.farBackground.style.height = `${this.mountainHeight}px`; // Utilise la hauteur des montagnes
    this.farBackground.style.bottom = "0";
    this.farBackground.style.left = "0";
    this.farBackground.style.zIndex = "1";

    // Crée l'arrière-plan moyen (collines)
    this.midBackground = document.createElement("div");
    this.midBackground.style.position = "absolute";
    this.midBackground.style.width = `${this.levelWidth}px`;
    this.midBackground.style.height = "100px";
    this.midBackground.style.bottom = "0";
    this.midBackground.style.left = "0";
    this.midBackground.style.zIndex = "2";

    // Crée l'arrière-plan proche (nuages)
    this.nearBackground = document.createElement("div");
    this.nearBackground.style.position = "absolute";
    this.nearBackground.style.width = `${this.levelWidth}px`;
    this.nearBackground.style.height = "200px";
    this.nearBackground.style.top = "0";
    this.nearBackground.style.left = "0";
    this.nearBackground.style.zIndex = "3";

    // Ajoute des éléments aux arrière-plans
    this.populateBackground(0, this.levelWidth);

    // Ajoute les arrière-plans au conteneur de niveau
    this.levelContainer.appendChild(this.farBackground);
    this.levelContainer.appendChild(this.midBackground);
    this.levelContainer.appendChild(this.nearBackground);
  }

  updateHeight() {
    this.mountainHeight = Math.random() * (700 - 250) + 250;
  }

  /**
   * Peuple l'arrière-plan avec des éléments
   * @param {number} startX - Position X de départ
   * @param {number} endX - Position X de fin
   */
  populateBackground(startX, endX) {
    const width = endX - startX;

    // Ajoute des montagnes à l'arrière-plan lointain avec un espacement proportionnel à leur taille
    // Calcule le point de départ pour assurer la continuité
    let mountainStartX = startX;
    if (startX > 0) {
      // Si ce n'est pas le début du niveau, ajuste le point de départ pour maintenir le motif
      mountainStartX = startX - (startX % this.mountainSpacing);
      // Ajoute une montagne juste avant le début pour éviter les discontinuités
      if (mountainStartX < startX) {
        this.createMountain(mountainStartX);
        mountainStartX += this.mountainSpacing;
      }
    }

    // Ajoute des montagnes jusqu'à la fin du segment
    for (let x = mountainStartX; x < endX; x += this.mountainSpacing) {
      this.createMountain(x);
    }

    // Ajoute des collines à l'arrière-plan moyen
    // Utilise un espacement fixe pour les collines
    const hillSpacing = 80;
    let hillStartX = startX;
    if (startX > 0) {
      // Si ce n'est pas le début du niveau, ajuste le point de départ pour maintenir le motif
      hillStartX = startX - (startX % hillSpacing);
      // Ajoute une colline juste avant le début pour éviter les discontinuités
      if (hillStartX < startX) {
        this.createHill(hillStartX);
        hillStartX += hillSpacing;
      }
    }

    // Ajoute des collines jusqu'à la fin du segment
    for (let x = hillStartX; x < endX; x += hillSpacing) {
      this.createHill(x);
    }

    // Ajoute des nuages à l'arrière-plan proche
    // Utilise un espacement variable pour les nuages pour un aspect plus naturel
    const cloudBaseSpacing = 200;
    let cloudStartX = startX;
    if (startX > 0) {
      // Si ce n'est pas le début du niveau, ajuste le point de départ pour maintenir le motif
      // Pour les nuages, utilise un décalage aléatoire pour éviter les motifs répétitifs
      cloudStartX = startX - (startX % cloudBaseSpacing) + Math.random() * 50;
      // Ajoute quelques nuages juste avant le début pour éviter les discontinuités
      if (cloudStartX < startX) {
        this.createCloud(cloudStartX);
        cloudStartX += cloudBaseSpacing + Math.random() * 50 - 25; // Variation de ±25
      }
    }

    // Ajoute des nuages jusqu'à la fin du segment avec un espacement variable
    for (
      let x = cloudStartX;
      x < endX;
      x += cloudBaseSpacing + Math.random() * 100 - 50
    ) {
      // Variation de ±50
      this.createCloud(x);
    }
  }

  /**
   * Crée un élément montagne
   * @param {number} x - Position X
   */
  createMountain(x) {
    const mountain = document.createElement("img");
    mountain.src = this.mountainTexture;
    mountain.style.position = "absolute";
    mountain.style.height = `${this.mountainHeight}px`; // Utilise la propriété de hauteur des montagnes
    mountain.style.bottom = "0";
    mountain.style.left = `${x}px`;
    mountain.style.opacity = "0.8";

    this.farBackground.appendChild(mountain);
    return mountain;
  }

  /**
   * Crée un élément colline
   * @param {number} x - Position X
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
   * Crée un élément nuage
   * @param {number} x - Position X
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
   * Étend l'arrière-plan pour un nouveau segment
   * @param {number} startX - Position X de départ
   * @param {number} endX - Position X de fin
   */
  extendBackground(startX, endX) {
    // Ajoute un chevauchement pour assurer une transition fluide
    const overlap = 100;
    const effectiveStartX = Math.max(0, startX - overlap);

    this.populateBackground(effectiveStartX, endX);
    this.levelWidth = endX;

    // Met à jour les largeurs des arrière-plans
    this.farBackground.style.width = `${this.levelWidth}px`;
    this.midBackground.style.width = `${this.levelWidth}px`;
    this.nearBackground.style.width = `${this.levelWidth}px`;
  }

  /**
   * Met à jour la position de la caméra pour l'effet parallaxe
   * @param {number} cameraX - Position X de la caméra
   */
  updateCamera(cameraX) {
    // Applique l'effet parallaxe aux couches d'arrière-plan
    if (this.farBackground && this.midBackground && this.nearBackground) {
      // Facteurs de parallaxe pour chaque couche
      const farFactor = 0.1;
      const midFactor = 0.15;
      const nearFactor = 0.05;

      // Applique la transformation avec les facteurs de parallaxe
      this.farBackground.style.transform = `translateX(${
        cameraX * farFactor
      }px)`;
      this.midBackground.style.transform = `translateX(${
        cameraX * midFactor
      }px)`;
      this.nearBackground.style.transform = `translateX(${
        cameraX * nearFactor
      }px)`;
    }
  }

  /**
   * Met à jour la texture des montagnes
   * @param {string} imagePath - Chemin vers la nouvelle image
   */
  updateMountainTexture(imagePath) {
    this.mountainTexture = imagePath;
    const mountains = this.farBackground.querySelectorAll("img");
    mountains.forEach((mountain) => {
      mountain.src = imagePath;
    });
  }

  /**
   * Met à jour la texture des collines
   * @param {string} imagePath - Chemin vers la nouvelle image
   */
  updateHillTexture(imagePath) {
    this.hillTexture = imagePath;
    const hills = this.midBackground.querySelectorAll("img");
    hills.forEach((hill) => {
      hill.src = imagePath;
    });
  }

  /**
   * Met à jour la texture des nuages
   * @param {string} imagePath - Chemin vers la nouvelle image
   */
  updateCloudTexture(imagePath) {
    this.cloudTexture = imagePath;
    const clouds = this.nearBackground.querySelectorAll("img");
    clouds.forEach((cloud) => {
      cloud.src = imagePath;
    });
  }

  /**
   * Initialise l'arrière-plan
   * @param {number} width - Largeur du niveau
   * @param {number} height - Hauteur du niveau
   */
  init(width, height) {
    this.levelWidth = width;
    this.levelHeight = height;

    // Crée les couches d'arrière-plan
    this.createBackgroundLayers();

    // Calcule une marge supplémentaire basée sur la largeur de l'écran
    const screenWidth = window.innerWidth || 800;
    const extraMargin = screenWidth * 1.5;

    // Peuple l'arrière-plan initial avec une marge supplémentaire
    this.populateBackground(0, this.levelWidth + extraMargin);
  }
}
