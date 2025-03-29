/**
 * Gestionnaire de canvas plein écran.
 * Gère la création, le redimensionnement et le dessin du canvas.
 */
import CanvasFunctions from "./CanvasFunctions.js";
export class CanvasManager {
  /**
   * Initialise le gestionnaire de canvas.
   */
  constructor() {
    this.canvas = null;

    this.initialize();
  }

  /**
   * Initialise le canvas et les écouteurs d'événements.
   */
  initialize() {
    this.createCanvas();

    // Configurer le canvas pour qu'il soit toujours à la bonne taille
    this.resizeCanvas();
    window.addEventListener("resize", () => this.resizeCanvas());

    // Écouter les changements de thème
    const themeButtons = document.querySelectorAll(".theme-button");
    themeButtons.forEach((button) => {
      button.addEventListener("click", () => {
        // Redessiner le canvas avec la nouvelle couleur de thème
        setTimeout(() => this.resizeCanvas(), 100);
      });
    });

    // Initialiser les fonctions du canvas
    this.canvasFunctions = new CanvasFunctions(this.canvas);
  }

  /**
   * Crée le canvas plein écran.
   */
  createCanvas() {
    this.canvas = document.createElement("canvas");
    this.canvas.classList.add("fullscreen-canvas", "hidden");
    this.canvas.id = "fullscreen-canvas";

    // Ajouter à la page
    document.body.appendChild(this.canvas);
  }

  /**
   * Redimensionne le canvas pour qu'il occupe tout l'écran.
   */
  resizeCanvas() {
    if (this.canvas) {
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;

      // Obtenir le thème actuel
      const body = document.body;
      let bgColor = "#f7f7f8"; // Couleur par défaut (light theme)

      if (body.classList.contains("dark-theme")) {
        bgColor = "#343541";
      } else if (body.classList.contains("blue-theme")) {
        bgColor = "#f0f9ff";
      } else if (body.classList.contains("green-theme")) {
        bgColor = "#ecfdf5";
      }

      // Dessiner le fond selon le thème actuel
      const ctx = this.canvas.getContext("2d");
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
  }

  /**
   * Affiche le canvas.
   */
  show() {
    if (this.canvas) {
      this.canvas.classList.remove("hidden");
      this.resizeCanvas();
    }
  }

  /**
   * Cache le canvas.
   */
  hide() {
    if (this.canvas) {
      this.canvas.classList.add("hidden");
    }
  }

  /**
   * Vérifie si le canvas est visible.
   *
   * @returns {boolean} - true si le canvas est visible, false sinon
   */
  isVisible() {
    return this.canvas && !this.canvas.classList.contains("hidden");
  }
}
