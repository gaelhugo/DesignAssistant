/**
 * Classe GridItem responsable de la gestion d'un élément de grille unique avec image et vidéo
 */
export default class GridItem {
  /**
   * Crée une nouvelle instance de GridItem
   * @param {string} id - L'identifiant de l'élément
   * @param {string} imagePath - Chemin vers l'image
   * @param {string} videoPath - Chemin vers la vidéo
   * @param {Function} onVideoEnd - Fonction de rappel à appeler lorsque la vidéo se termine
   */
  constructor(id, imagePath, videoPath, onVideoEnd = null) {
    this.id = id;
    this.imagePath = imagePath;
    this.videoPath = videoPath;
    this.element = null;
    this.imageElement = null;
    this.videoElement = null;
    this.isActive = false;
    this.onVideoEnd = onVideoEnd;
    this.isHovered = false;
    this.originalTransform = "";
    this.isPreloaded = false;
  }

  /**
   * Crée les éléments DOM pour cet élément de grille
   * @returns {HTMLElement} L'élément de grille créé
   */
  createElement() {
    // Crée l'élément conteneur
    this.element = document.createElement("div");
    this.element.className = "grid-item";
    this.element.dataset.id = this.id;

    // Crée l'élément image
    this.imageElement = document.createElement("img");
    this.imageElement.src = this.imagePath;
    this.imageElement.alt = `Image ${this.id}`;
    this.element.appendChild(this.imageElement);

    // Crée l'élément vidéo
    this.videoElement = document.createElement("video");
    this.videoElement.src = this.videoPath;
    this.videoElement.muted = true;
    this.videoElement.playsInline = true;
    this.videoElement.loop = false;
    this.videoElement.preload = "auto"; // Définit le préchargement sur auto
    this.element.appendChild(this.videoElement);

    // Ajoute les écouteurs d'événements
    // this.element.addEventListener("mouseenter", () => this.handleMouseEnter());
    // this.element.addEventListener("mouseleave", () => this.handleMouseLeave());
    this.videoElement.addEventListener("ended", () => this.handleVideoEnd());

    // Commence le préchargement de la vidéo
    this.preloadVideo();

    return this.element;
  }

  /**
   * Précharge le contenu de la vidéo
   */
  preloadVideo() {
    // Crée une promesse qui se résout lorsque la vidéo est suffisamment chargée pour être lue
    this.preloadPromise = new Promise((resolve) => {
      // Vérifie si la vidéo est déjà suffisamment chargée
      if (this.videoElement.readyState >= 3) {
        this.isPreloaded = true;
        resolve();
        return;
      }

      // Configure les écouteurs d'événements pour le chargement
      const canPlayHandler = () => {
        this.isPreloaded = true;
        this.videoElement.removeEventListener("canplay", canPlayHandler);
        resolve();
      };

      // Écoute l'événement canplay
      this.videoElement.addEventListener("canplay", canPlayHandler);

      // Force le navigateur à commencer le chargement de la vidéo
      this.videoElement.load();
    });

    return this.preloadPromise;
  }

  /**
   * Vérifie si la vidéo est préchargée
   * @returns {boolean} Vrai si la vidéo est préchargée
   */
  isVideoPreloaded() {
    return this.isPreloaded || this.videoElement.readyState >= 3;
  }

  /**
   * Gère l'événement d'entrée de la souris
   */
  handleMouseEnter() {
    this.isHovered = true;
    this.activate();
  }

  /**
   * Gère l'événement de sortie de la souris
   */
  handleMouseLeave() {
    this.isHovered = false;
    if (this.isActive) {
      this.deactivate();
    }
  }

  /**
   * Gère l'événement de fin de vidéo
   */
  handleVideoEnd() {
    if (!this.isHovered && this.onVideoEnd) {
      this.onVideoEnd(this);
    }

    if (!this.isHovered) {
      this.deactivate();
    }
  }

  /**
   * Calcule la position ajustée pour maintenir l'élément zoomé dans la fenêtre
   * @param {number} scale - Le facteur d'échelle
   * @returns {Object} - Les valeurs de translation x et y
   */
  calculateEdgeAdjustment(scale) {
    const rect = this.element.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // Calcule combien l'élément va s'étendre dans chaque direction
    const expandX = (rect.width * (scale - 1)) / 2;
    const expandY = (rect.height * (scale - 1)) / 2;

    // Calcule les distances jusqu'aux bords de la fenêtre
    const distToLeft = rect.left;
    const distToRight = viewportWidth - rect.right;
    const distToTop = rect.top;
    const distToBottom = viewportHeight - rect.bottom;

    // Calcule les ajustements nécessaires
    let adjustX = 0;
    let adjustY = 0;

    // Ajuste pour les bords gauche/droite
    if (distToLeft < expandX) {
      adjustX = expandX - distToLeft;
    } else if (distToRight < expandX) {
      adjustX = -(expandX - distToRight);
    }

    // Ajuste pour les bords haut/bas
    if (distToTop < expandY) {
      adjustY = expandY - distToTop;
    } else if (distToBottom < expandY) {
      adjustY = -(expandY - distToBottom);
    }

    return { x: adjustX, y: adjustY };
  }

  /**
   * Active cet élément de grille (zoom et lecture de la vidéo)
   */
  activate() {
    if (this.isActive) return;

    this.isActive = true;
    this.element.classList.add("active");

    // Applique l'effet de zoom avec une légère rotation pour un effet 3D plus dramatique
    const scale = 4;
    const rotateX = -5; // légère inclinaison

    // Calcule les ajustements de bord
    const adjustment = this.calculateEdgeAdjustment(scale);

    // Sauvegarde la transformation originale pour la restauration ultérieure
    this.originalTransform = this.element.style.transform;

    // Applique la transformation avec les ajustements
    this.element.style.transform = `translate(${adjustment.x}px, ${adjustment.y}px) scale(${scale}) rotateX(${rotateX}deg)`;
    this.element.style.zIndex = "10";

    // Lit la vidéo
    this.videoElement.currentTime = 0;
    this.videoElement.play().catch((error) => {
      console.error("Erreur lors de la lecture de la vidéo:", error);
    });
  }

  /**
   * Désactive cet élément de grille (supprime le zoom et arrête la vidéo)
   */
  deactivate() {
    if (!this.isActive) return;

    this.isActive = false;
    this.element.classList.remove("active");

    // Restaure la transformation originale ou réinitialise à la valeur par défaut
    this.element.style.transform =
      this.originalTransform || "scale(1) rotateX(0deg)";
    this.element.style.zIndex = "1";

    // Met la vidéo en pause
    this.videoElement.pause();
  }

  /**
   * Déclenche programmatiquement l'effet de survol et lit la vidéo
   * @returns {Promise} Promesse qui se résout lorsque la vidéo se termine
   */
  async playVideo() {
    // S'assure que la vidéo est préchargée avant la lecture
    if (!this.isVideoPreloaded()) {
      await this.preloadVideo();
    }

    return new Promise((resolve) => {
      const onEnd = () => {
        this.videoElement.removeEventListener("ended", onEnd);
        this.deactivate();
        resolve();
      };

      this.videoElement.addEventListener("ended", onEnd);
      this.activate();
    });
  }
}
