import FileLoader from "./FileLoader.js";
import VideoGrid from "./VideoGrid.js";

/**
 * Classe App principale qui initialise et gère l'application
 */
export default class App {
  /**
   * Crée une nouvelle instance App
   * @param {HTMLElement} container - L'élément conteneur pour l'application
   */
  constructor(container) {
    this.container = container;
    this.videoGrid = null;
    this.fileNames = [];
  }

  /**
   * Initialise l'application
   */
  async initialize() {
    if (this.videoGrid) return;
    try {
      // Charge les noms de fichiers depuis lexical.txt
      this.fileNames = await FileLoader.loadLexicalFile();

      if (this.fileNames.length === 0) {
        console.error("Aucun nom de fichier trouvé dans lexical.txt");
        this.container.innerHTML =
          '<div class="error">Aucun fichier trouvé dans lexical.txt</div>';
        return;
      }

      // Initialise la grille vidéo
      this.videoGrid = new VideoGrid(this.container);
      await this.videoGrid.initialize(this.fileNames);

      console.log(
        "Application initialisée avec succès avec",
        this.fileNames.length,
        "éléments"
      );
    } catch (error) {
      console.error("Erreur lors de l'initialisation de l'application:", error);
      this.container.innerHTML = `<div class="error">Erreur lors de l'initialisation de l'application: ${error.message}</div>`;
    }
  }

  /**
   * Lit une séquence de vidéos automatiquement
   * @param {Array<number|string>} sequence - Tableau d'indices ou de noms à lire en séquence
   */
  playSequence(sequence) {
    if (!this.videoGrid) return;

    this.videoGrid.playSequence(sequence);
  }

  /**
   * Lit une séquence de vidéos par leurs noms
   * @param {string[]} nameSequence - Tableau de noms de vidéos à lire en séquence
   */
  playSequenceByName(nameSequence) {
    if (!this.videoGrid) return;

    this.videoGrid.playSequence(nameSequence);
  }

  /**
   * Arrête la séquence de lecture automatique en cours
   */
  stopSequence() {
    if (!this.videoGrid) return;

    this.videoGrid.stopSequence();
  }

  show() {
    document.getElementById("grid-content").classList.remove("hidden");
  }

  hide() {
    document.getElementById("grid-content").classList.add("hidden");
  }
}
