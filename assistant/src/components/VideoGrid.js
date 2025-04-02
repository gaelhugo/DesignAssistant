import GridItem from "./GridItem.js";

/**
 * Classe VideoGrid responsable de la création et de la gestion de la grille d'éléments vidéo
 */
export default class VideoGrid {
  /**
   * Crée une nouvelle instance de VideoGrid
   * @param {HTMLElement} container - L'élément conteneur pour la grille
   * @param {string[]} fileNames - Tableau des noms de fichiers à charger
   */
  constructor(container) {
    this.container = container;
    this.gridItems = [];
    this.gridElement = null;
    this.aspectRatio = 16 / 9;
    this.currentlyPlaying = null;
    this.autoPlaySequence = [];
    this.isAutoPlaying = false;
  }

  /**
   * Initialise la grille avec les noms de fichiers donnés
   * @param {string[]} fileNames - Tableau des noms de fichiers à charger
   */
  async initialize(fileNames) {
    this.createGridElement();

    // Crée les éléments de grille
    for (const fileName of fileNames) {
      const id = fileName.trim();
      const imagePath = `/thumbnails/${id}.png`;
      const videoPath = `/videos/${id}.mp4`;

      const gridItem = new GridItem(id, imagePath, videoPath, (item) => {
        this.currentlyPlaying = null;
      });

      this.gridItems.push(gridItem);
      this.gridElement.appendChild(gridItem.createElement());
    }

    // Calcule et définit la disposition optimale de la grille
    this.calculateOptimalGrid();

    // Ajoute un écouteur de redimensionnement pour recalculer la grille lors du redimensionnement de la fenêtre
    window.addEventListener("resize", () => {
      this.calculateOptimalGrid();
    });
  }

  /**
   * Crée l'élément conteneur de la grille
   */
  createGridElement() {
    this.gridElement = document.createElement("div");
    this.gridElement.className = "grid-container";
    this.container.appendChild(this.gridElement);
  }

  /**
   * Calcule la disposition optimale de la grille en fonction du nombre d'éléments et de la taille de l'écran
   */
  calculateOptimalGrid() {
    const containerWidth = this.container.clientWidth;
    const containerHeight = this.container.clientHeight;
    const itemCount = this.gridItems.length;

    // Trouve le nombre optimal de colonnes et de lignes
    let bestColumns = 1;
    let bestRows = itemCount;
    let bestFit = 0;

    // Essaie différents nombres de colonnes pour trouver la meilleure disposition
    for (let cols = 1; cols <= itemCount; cols++) {
      const rows = Math.ceil(itemCount / cols);

      // Calcule les dimensions des éléments en fonction du conteneur et du ratio d'aspect
      const itemWidth = containerWidth / cols;
      const itemHeight = itemWidth / this.aspectRatio;
      const totalHeight = itemHeight * rows;

      // Vérifie si cette disposition s'adapte mieux au conteneur
      if (totalHeight <= containerHeight) {
        const usage =
          (itemWidth * cols * itemHeight * rows) /
          (containerWidth * containerHeight);
        if (usage > bestFit) {
          bestFit = usage;
          bestColumns = cols;
          bestRows = rows;
        }
      }
    }

    // Si aucune bonne disposition n'a été trouvée (toutes trop hautes), essaie d'optimiser pour la hauteur
    if (bestFit === 0) {
      for (let rows = 1; rows <= itemCount; rows++) {
        const cols = Math.ceil(itemCount / rows);

        // Calcule les dimensions des éléments en fonction du conteneur et du ratio d'aspect
        const itemHeight = containerHeight / rows;
        const itemWidth = itemHeight * this.aspectRatio;
        const totalWidth = itemWidth * cols;

        // Vérifie si cette disposition s'adapte au conteneur
        if (totalWidth <= containerWidth) {
          const usage =
            (itemWidth * cols * itemHeight * rows) /
            (containerWidth * containerHeight);
          if (usage > bestFit) {
            bestFit = usage;
            bestColumns = cols;
            bestRows = rows;
          }
        }
      }
    }

    // Applique la disposition de la grille
    this.gridElement.style.gridTemplateColumns = `repeat(${bestColumns}, 1fr)`;
    this.gridElement.style.gridTemplateRows = `repeat(${bestRows}, 1fr)`;
  }

  /**
   * Trouve l'index d'un élément de grille par son ID/nom
   * @param {string} name - Le nom/ID de l'élément de grille à trouver
   * @returns {number} L'index de l'élément, ou -1 si non trouvé
   */
  findGridItemIndexByName(name) {
    const nameStr = name.toString().trim();

    // Trouve tous les indices des éléments avec le nom correspondant
    const matchingIndices = this.gridItems
      .map((item, index) => (item.id === nameStr ? index : -1))
      .filter((index) => index !== -1);

    if (matchingIndices.length === 0) {
      return -1; // Aucune correspondance trouvée
    }

    // Sélectionne aléatoirement l'un des indices correspondants
    const randomIndex = Math.floor(Math.random() * matchingIndices.length);
    return matchingIndices[randomIndex];
  }

  /**
   * Précharge toutes les vidéos dans la grille
   * @returns {Promise} Promesse qui se résout lorsque toutes les vidéos sont préchargées
   */
  preloadAllVideos() {
    const preloadPromises = this.gridItems.map((item) => item.preloadVideo());
    return Promise.all(preloadPromises);
  }

  /**
   * Précharge une séquence spécifique de vidéos
   * @param {Array<number|string>} sequence - Tableau d'indices ou de noms à précharger
   * @returns {Promise} Promesse qui se résout lorsque toutes les vidéos de la séquence sont préchargées
   */
  async preloadSequence(sequence) {
    const preloadPromises = [];

    for (const item of sequence) {
      let index;

      // Vérifie si l'élément est un nombre (index) ou une chaîne (nom)
      if (typeof item === "number") {
        index = item;
      } else {
        // Trouve l'index par nom
        index = this.findGridItemIndexByName(item);
      }

      if (index >= 0 && index < this.gridItems.length) {
        const gridItem = this.gridItems[index];
        preloadPromises.push(gridItem.preloadVideo());
      }
    }

    return Promise.all(preloadPromises);
  }

  /**
   * Lit une séquence de vidéos automatiquement
   * @param {Array<number|string>} sequence - Tableau d'indices ou de noms à lire en séquence
   */
  async playSequence(sequence) {
    if (this.isAutoPlaying) return;

    this.isAutoPlaying = true;
    this.autoPlaySequence = sequence;

    // Précharge toutes les vidéos de la séquence avant de commencer la lecture
    await this.preloadSequence(sequence);

    for (const item of sequence) {
      let index;

      // Vérifie si l'élément est un nombre (index) ou une chaîne (nom)
      if (typeof item === "number") {
        index = item;
      } else {
        // Trouve l'index par nom
        index = this.findGridItemIndexByName(item);
      }

      if (index >= 0 && index < this.gridItems.length) {
        const gridItem = this.gridItems[index];
        await gridItem.playVideo();

        // Petit délai entre les vidéos
        await new Promise((resolve) => setTimeout(resolve, 300));
      } else {
        console.warn(`Élément non trouvé dans la séquence: ${item}`);
      }
    }

    this.isAutoPlaying = false;
  }

  /**
   * Arrête la séquence de lecture automatique en cours
   */
  stopSequence() {
    this.isAutoPlaying = false;
    this.autoPlaySequence = [];

    // Désactive tous les éléments
    for (const item of this.gridItems) {
      item.deactivate();
    }
  }
}
