/**
 * SimpleGame - Une classe de jeu de plateforme qui sépare le moteur de jeu des éléments de design
 */
import { GameEngine } from "./GameEngine.js";
import { Player } from "./elements/Player.js";
import { Enemy } from "./elements/Enemy.js";
import { Platform } from "./elements/Platform.js";
import { Bonus } from "./elements/Bonus.js";
import { Background } from "./elements/Background.js";
import IconManager from "../canvas/IconManager.js";

export class SimpleGame {
  constructor(gameContainerId) {
    // Moteur de jeu
    this.engine = new GameEngine();

    // Éléments DOM
    this.gameContainer = document.getElementById(gameContainerId);
    this.levelContainer = null;
    this.scoreElement = null;

    // Gestionnaire d'arrière-plan
    this.background = null;

    this.initIconManager();
    // this.startTextures();
    // this.textInputZone = document.querySelector(".minified-input-container");

    // this.textInputZone.addEventListener("click", () => {
    //   if (!this.isWriting) {
    //     this.engine.canMove = false;
    //     this.isWriting = true;
    //   }
    // });
  }

  async initIconManager() {
    this.iconManager = new IconManager();
    await this.iconManager.loadSpreadsheetIcons();
    console.log("IconManager initialisé avec succès");
    console.log(this.iconManager.listDict());
  }

  show() {
    this.gameContainer.classList.remove("hidden");
  }

  hide() {
    this.gameContainer.classList.add("hidden");
  }

  /**
   * Initialise le jeu
   */
  initGame() {
    console.log("Initialisation du jeu...");

    // Configure le conteneur du jeu
    this.gameContainer.style.overflow = "hidden";
    this.gameContainer.style.backgroundColor = "#87CEEB";

    // Crée le conteneur de niveau
    this.levelContainer = document.createElement("div");
    this.levelContainer.style.position = "absolute";
    this.levelContainer.style.width = `${this.engine.LEVEL_WIDTH}px`;
    this.levelContainer.style.height = `${this.engine.LEVEL_HEIGHT}px`;
    this.levelContainer.style.bottom = "0";
    this.levelContainer.style.left = "0";
    this.gameContainer.appendChild(this.levelContainer);

    // Crée l'affichage du score
    this.scoreElement = document.createElement("div");
    this.scoreElement.classList.add("score");
    this.scoreElement.style.position = "absolute";
    this.scoreElement.style.fontSize = "24px";
    this.scoreElement.style.fontWeight = "bold";
    this.scoreElement.style.textShadow = "2px 2px 4px rgba(0, 0, 0, 0.5)";
    this.scoreElement.textContent = "Score: 0";
    this.gameContainer.appendChild(this.scoreElement);

    // Initialise les écouteurs d'événements
    this.engine.initEventListeners();

    // Configure les callbacks
    this.engine.setScoreUpdateCallback((score) => {
      this.scoreElement.textContent = `Score: ${score}`;
    });

    this.engine.setGameOverCallback((score) => {
      this.showGameOverScreen(score);
    });

    this.engine.setCameraUpdateCallback(() => {
      this.updateCamera();
    });

    this.engine.setGenerateNewChunksCallback(() => {
      this.generateNewLevelChunks();
    });

    // Crée l'arrière-plan
    this.background = new Background(
      this.levelContainer,
      this.engine.LEVEL_WIDTH
    );
    this.background.init(this.engine.LEVEL_WIDTH, this.engine.LEVEL_HEIGHT);

    // Crée le niveau
    this.createLevel();

    // Démarre la boucle de jeu
    this.engine.lastTimestamp = performance.now();
    this.engine.animationFrameId = requestAnimationFrame(
      this.engine.gameLoop.bind(this.engine)
    );

    console.log("Jeu initialisé avec succès");

    // this.updateEnemyTexture("/images/spreadsheet1.json");
    this.backgroundObject = document.getElementById("game-container");

    this.isWriting = false;
  }

  /**
   * Crée le niveau initial
   */
  createLevel() {
    // Crée un sol continu avec des trous occasionnels
    for (let x = 0; x < this.engine.LEVEL_WIDTH; x += 100) {
      // Crée des trous occasionnels (15% de chance) mais pas au début
      if (Math.random() < 0.15 && x > 400) {
        x += 100; // Saute cette section pour créer un trou
        continue;
      }
      this.createGameObject(x, 550, 100, 16, "platform");
    }

    // Crée un motif simple et clair de plateformes
    // Zone de départ - une plateforme sûre pour commencer
    this.createGameObject(50, 500, 150, 16, "platform");

    // Première section - sauts simples avec hauteur croissante
    this.createGameObject(250, 500, 150, 16, "platform");
    const platform1 = this.createGameObject(450, 450, 150, 16, "platform");
    this.createGameObject(650, 450, 150, 16, "platform");
    const platform2 = this.createGameObject(850, 400, 150, 16, "platform");
    this.createGameObject(1050, 400, 150, 16, "platform");

    // Deuxième section - plateformes à hauteurs constantes
    this.createGameObject(1300, 450, 150, 16, "platform");
    const platform3 = this.createGameObject(1500, 450, 150, 16, "platform");
    this.createGameObject(1700, 400, 150, 16, "platform");
    const platform4 = this.createGameObject(1900, 400, 150, 16, "platform");
    this.createGameObject(2100, 450, 150, 16, "platform");
    const platform5 = this.createGameObject(2300, 450, 150, 16, "platform");
    this.createGameObject(2500, 400, 150, 16, "platform");
    const platform6 = this.createGameObject(2700, 400, 150, 16, "platform");

    // Ajoute quelques plateformes flottantes pour les bonus (pas trop)
    this.createGameObject(600, 300, 100, 16, "platform");
    this.createGameObject(1200, 300, 100, 16, "platform");
    this.createGameObject(1800, 300, 100, 16, "platform");
    this.createGameObject(2400, 300, 100, 16, "platform");

    // Place des ennemis stratégiquement (pas sur chaque plateforme)
    // Première section - juste quelques ennemis pour commencer
    this.createGameObject(480, 418, 32, 32, "enemy"); // Sur la plateforme à 450, 450
    this.createGameObject(880, 368, 32, 32, "enemy"); // Sur la plateforme à 850, 400

    // Deuxième section - plus d'ennemis mais toujours gérable
    this.createGameObject(1530, 418, 32, 32, "enemy"); // Sur la plateforme à 1500, 450
    this.createGameObject(1930, 368, 32, 32, "enemy"); // Sur la plateforme à 1900, 400
    this.createGameObject(2330, 418, 32, 32, "enemy"); // Sur la plateforme à 2300, 450
    this.createGameObject(2730, 368, 32, 32, "enemy"); // Sur la plateforme à 2700, 400

    // Ennemis au sol - juste quelques-uns, espacés
    this.createGameObject(350, 518, 32, 32, "enemy");
    this.createGameObject(1200, 518, 32, 32, "enemy");
    this.createGameObject(2000, 518, 32, 32, "enemy");

    // Ajoute des bonus à des emplacements stratégiques
    // Sur les plateformes flottantes
    this.createGameObject(650, 270, 24, 24, "bonus");
    this.createGameObject(1250, 270, 24, 24, "bonus");
    this.createGameObject(1850, 270, 24, 24, "bonus");
    this.createGameObject(2450, 270, 24, 24, "bonus");

    // Au-dessus des plateformes régulières
    this.createGameObject(300, 450, 24, 24, "bonus");
    this.createGameObject(750, 370, 24, 24, "bonus");
    this.createGameObject(1400, 400, 24, 24, "bonus");
    this.createGameObject(2200, 400, 24, 24, "bonus");

    // Crée le joueur
    this.engine.player = this.createGameObject(70, 468, 32, 32, "player");
  }

  /**
   * Crée un objet de jeu
   * @param {number} x - Position X
   * @param {number} y - Position Y
   * @param {number} width - Largeur
   * @param {number} height - Hauteur
   * @param {string} type - Type d'objet de jeu
   * @returns {Object} - Objet de jeu créé
   */
  createGameObject(x, y, width, height, type) {
    console.log(`Création de ${type} à (${x}, ${y})`);

    let gameObject;

    // Crée l'objet de jeu approprié en fonction du type
    switch (type) {
      case "player":
        gameObject = new Player(x, y, width, height);
        break;
      case "enemy":
        gameObject = new Enemy(x, y, width, height);
        break;
      case "platform":
        gameObject = new Platform(x, y, width, height);
        break;
      case "bonus":
        gameObject = new Bonus(x, y, width, height);
        break;
      default:
        console.error(`Type d'objet de jeu inconnu : ${type}`);
        return null;
    }

    // Crée l'élément DOM
    const element = gameObject.createDOMElement();

    // Ajoute au conteneur de niveau
    this.levelContainer.appendChild(element);

    // Ajoute aux collections appropriées dans le moteur
    this.engine.gameObjects.push(gameObject);

    if (type === "platform") {
      this.engine.platforms.push(gameObject);
    } else if (type === "enemy") {
      this.engine.enemies.push(gameObject);
    } else if (type === "bonus") {
      this.engine.bonuses.push(gameObject);
    }

    return gameObject;
  }

  /**
   * Met à jour la position de la caméra pour suivre le joueur
   */
  updateCamera() {
    if (!this.engine.player) return;

    // Calcule la position de la caméra (centre le joueur dans la vue)
    const targetX = -this.engine.player.x + 400 - this.engine.player.width / 2;

    // Limite la caméra pour ne pas montrer au-delà du bord gauche du niveau
    this.engine.cameraX = Math.min(0, targetX);

    // Applique la position de la caméra au conteneur de niveau
    this.levelContainer.style.transform = `translateX(${this.engine.cameraX}px)`;

    // Met à jour le parallaxe d'arrière-plan
    this.background.updateCamera(this.engine.cameraX);
  }

  /**
   * Génère de nouveaux segments de niveau
   */
  generateNewLevelChunks() {
    // Vérifie si le joueur a atteint la fin du niveau actuel
    if (
      this.engine.player.x + this.engine.player.width >
      this.engine.LEVEL_WIDTH - this.engine.CHUNK_SIZE
    ) {
      // Génère un nouveau segment de niveau
      const newChunk = this.generateLevelChunk(
        this.engine.LEVEL_WIDTH,
        this.engine.LEVEL_HEIGHT
      );

      // Met à jour la largeur du niveau
      this.engine.LEVEL_WIDTH += this.engine.CHUNK_SIZE;
      this.levelContainer.style.width = `${this.engine.LEVEL_WIDTH}px`;

      // Étend l'arrière-plan avec une marge supplémentaire pour éviter les apparitions soudaines
      // Calcule une marge basée sur la largeur de l'écran
      const screenWidth = this.gameContainer.offsetWidth || 800;
      const extraMargin = screenWidth * 1.5; // Marge supplémentaire pour éviter les apparitions soudaines

      this.background.extendBackground(
        this.engine.LEVEL_WIDTH - this.engine.CHUNK_SIZE,
        this.engine.LEVEL_WIDTH + extraMargin // Étend au-delà de la limite visible
      );

      // Ajoute les nouvelles plateformes, ennemis et bonus au niveau
      for (const platform of newChunk.platforms) {
        this.engine.platforms.push(platform);
        this.engine.gameObjects.push(platform);
      }
      for (const enemy of newChunk.enemies) {
        this.engine.enemies.push(enemy);
        this.engine.gameObjects.push(enemy);
      }
      for (const bonus of newChunk.bonuses) {
        this.engine.bonuses.push(bonus);
        this.engine.gameObjects.push(bonus);
      }
    }
  }

  /**
   * Génère un nouveau segment de niveau
   * @param {number} startX - Position X de départ
   * @param {number} height - Hauteur du niveau
   * @returns {Object} - Segment généré avec plateformes, ennemis et bonus
   */
  generateLevelChunk(startX, height) {
    const platforms = [];
    const enemies = [];
    const bonuses = [];

    // Crée un sol avec des trous
    for (let x = startX; x < startX + this.engine.CHUNK_SIZE; x += 64) {
      // Crée des trous dans le sol pour le défi (environ 20% de chance de trou)
      if (Math.random() < 0.2) {
        // Saute la création d'une plateforme ici pour créer un trou
        x += 64; // Rend le trou d'au moins 2 plateformes de large
        continue;
      }
      platforms.push(this.createGameObject(x, 550, 64, 16, "platform"));
    }

    // Crée un chemin de plateformes qui peut être traversé
    // Commence avec des plateformes à différentes hauteurs
    const platformHeights = [450, 400, 350, 300, 250];
    let lastPlatformX = startX + 100;

    for (let i = 0; i < 8; i++) {
      // Sélectionne une hauteur aléatoire pour cette plateforme
      const height =
        platformHeights[Math.floor(Math.random() * platformHeights.length)];

      // Crée une plateforme
      const platformWidth = Math.random() * 100 + 100; // Entre 100 et 200
      const platform = this.createGameObject(
        lastPlatformX,
        height,
        platformWidth,
        16,
        "platform"
      );
      platforms.push(platform);

      // Ajoute un ennemi sur certaines plateformes (30% de chance), mais seulement si la plateforme est assez grande
      // Largeur minimale pour une plateforme avec ennemi est de 80px (largeur de l'ennemi + espace pour se déplacer)
      if (Math.random() < 0.3 && platformWidth >= 80) {
        const enemy = this.createGameObject(
          lastPlatformX + platformWidth / 2 - 16,
          height - 32,
          32,
          32,
          "enemy"
        );
        enemies.push(enemy);
      }

      // Ajoute un bonus au-dessus de certaines plateformes (40% de chance)
      if (Math.random() < 0.4) {
        const bonus = this.createGameObject(
          lastPlatformX + platformWidth / 2 - 12,
          height - 50,
          24,
          24,
          "bonus"
        );
        bonuses.push(bonus);
      }

      // Calcule la position de la prochaine plateforme
      // Assure qu'elle est atteignable avec un saut (utilise MAX_JUMP_HEIGHT)
      const jumpDistance = Math.random() * 150 + 50; // Entre 50 et 200
      lastPlatformX += platformWidth + jumpDistance;
    }

    // Ajoute quelques plateformes flottantes avec des bonus
    for (let i = 0; i < 3; i++) {
      const x = startX + Math.random() * (this.engine.CHUNK_SIZE - 100);
      const y = 150 + Math.random() * 100; // Plateformes plus hautes
      const width = 80;

      const platform = this.createGameObject(x, y, width, 16, "platform");
      platforms.push(platform);

      // Ajoute un bonus sur chaque plateforme flottante
      const bonus = this.createGameObject(
        x + width / 2 - 12,
        y - 40,
        24,
        24,
        "bonus"
      );
      bonuses.push(bonus);
    }

    // Ajoute quelques ennemis supplémentaires au sol
    for (let i = 0; i < 3; i++) {
      // Trouve une plateforme appropriée pour placer l'ennemi
      const availablePlatforms = platforms.filter(
        (p) => p.y === 550 && p.width >= 80
      ); // Plateformes au sol avec largeur suffisante

      if (availablePlatforms.length > 0) {
        // Choisit une plateforme aléatoire parmi celles disponibles
        const platform =
          availablePlatforms[
            Math.floor(Math.random() * availablePlatforms.length)
          ];
        // Place l'ennemi sur le dessus de la plateforme
        const x = platform.x + Math.random() * (platform.width - 32);
        const enemy = this.createGameObject(
          x,
          platform.y - 32,
          32,
          32,
          "enemy"
        );
        enemies.push(enemy);
      }
    }

    return { platforms, enemies, bonuses };
  }

  /**
   * Affiche l'écran de fin de partie
   * @param {number} score - Score final
   */
  showGameOverScreen(score) {
    // Crée l'élément de fond pour l'écran de fin de jeu
    const gameOverBackground = document.createElement("div");
    gameOverBackground.className = "game-over-background";

    // Crée le panneau de fin de jeu
    const gameOverElement = document.createElement("div");
    gameOverElement.className = "game-over-panel";

    // Contenu HTML avec des classes pour le style et styles inline pour le bouton
    gameOverElement.innerHTML = `
      <h2 class="game-over-title">Fin de partie</h2>
      <div class="score-label">Votre score</div>
      <span class="score-value">${score}</span>
      <button id="restart-button" style="
        background-color: #FF5722; 
        color: white; 
        border: none; 
        padding: 12px 24px; 
        margin-top: 20px; 
        border-radius: 30px; 
        font-size: 18px; 
        font-weight: bold; 
        cursor: pointer; 
        text-transform: uppercase;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
        min-width: 150px;
      ">Rejouer</button>
    `;

    // Ajoute les éléments au conteneur
    this.gameContainer.appendChild(gameOverBackground);
    this.gameContainer.appendChild(gameOverElement);

    // Ajoute la fonctionnalité du bouton de redémarrage
    document.getElementById("restart-button").addEventListener("click", () => {
      // Animation de sortie
      gameOverBackground.style.animation =
        "fadeIn 0.3s ease-in-out reverse forwards";
      gameOverElement.style.animation = "scaleIn 0.3s ease-in reverse forwards";

      // Supprime les éléments après l'animation
      setTimeout(() => {
        if (gameOverBackground.parentNode) {
          this.gameContainer.removeChild(gameOverBackground);
        }
        if (gameOverElement.parentNode) {
          this.gameContainer.removeChild(gameOverElement);
        }
        this.restartGame();
      }, 300);
    });
  }

  /**
   * Redémarre le jeu
   */
  restartGame() {
    // Efface tous les objets du jeu
    for (const gameObject of this.engine.gameObjects) {
      if (gameObject.element && gameObject.element.parentNode) {
        gameObject.element.parentNode.removeChild(gameObject.element);
      }
    }

    // Réinitialise l'état du jeu
    this.engine.gameObjects = [];
    this.engine.player = null;
    this.engine.platforms = [];
    this.engine.enemies = [];
    this.engine.bonuses = [];
    this.engine.score = 0;
    this.engine.isGameOver = false;
    this.engine.cameraX = 0;
    this.engine.LEVEL_WIDTH = 3000;

    // Met à jour l'affichage du score
    this.scoreElement.textContent = "Score: 0";

    // Réinitialise la position du conteneur de niveau
    this.levelContainer.style.transform = "translateX(0)";
    this.levelContainer.style.width = `${this.engine.LEVEL_WIDTH}px`;

    // Supprime tous les enfants du conteneur de niveau
    while (this.levelContainer.firstChild) {
      this.levelContainer.removeChild(this.levelContainer.firstChild);
    }

    // Recrée l'arrière-plan
    this.background = new Background(
      this.levelContainer,
      this.engine.LEVEL_WIDTH
    );
    this.background.init(this.engine.LEVEL_WIDTH, this.engine.LEVEL_HEIGHT);

    // Crée un nouveau niveau
    this.createLevel();

    // Annule toute animation existante
    if (this.engine.animationFrameId) {
      cancelAnimationFrame(this.engine.animationFrameId);
    }

    // Redémarre la boucle de jeu
    this.engine.lastTimestamp = performance.now();
    this.engine.animationFrameId = requestAnimationFrame(
      this.engine.gameLoop.bind(this.engine)
    );
  }

  /**
   * Met à jour la texture du joueur
   * @param {string} imagePath - Chemin vers la nouvelle image
   */
  updatePlayerTexture(imagePath) {
    if (this.engine.player) {
      this.engine.player.updateTexture(imagePath);
    }
  }

  /**
   * Met à jour la texture des ennemis
   * @param {string} imagePath - Chemin vers la nouvelle image
   */
  updateEnemyTexture(imagePath) {
    this.engine.enemies.forEach((enemy) => {
      enemy.updateTexture(imagePath);
    });
  }

  /**
   * Met à jour la texture des plateformes
   * @param {string} imagePath - Chemin vers la nouvelle image
   */
  updatePlatformTexture(imagePath) {
    this.engine.platforms.forEach((platform) => {
      console.log("updatePlatformTexture", imagePath);
      platform.updateTexture(imagePath);
    });
  }

  /**
   * Met à jour la texture des bonus
   * @param {string} imagePath - Chemin vers la nouvelle image
   */
  updateBonusTexture(imagePath) {
    this.engine.bonuses.forEach((bonus) => {
      bonus.updateTexture(imagePath);
    });
  }

  /**
   * Met à jour la texture des montagnes dans l'arrière-plan
   * @param {string} imagePath - Chemin vers la nouvelle image
   */
  updateMountainTexture(imagePath) {
    if (this.background) {
      this.background.updateMountainTexture(imagePath);
    }
  }

  /**
   * Met à jour la texture des collines dans l'arrière-plan
   * @param {string} imagePath - Chemin vers la nouvelle image
   */
  updateHillTexture(imagePath) {
    if (this.background) {
      this.background.updateHillTexture(imagePath);
    }
  }

  /**
   * Met à jour la texture des nuages dans l'arrière-plan
   * @param {string} imagePath - Chemin vers la nouvelle image
   */
  updateCloudTexture(imagePath) {
    if (this.background) {
      this.background.updateCloudTexture(imagePath);
    }
  }

  lmstudioMessage(motclefs) {
    console.log("motclefs", motclefs);

    const cloudTex = this.iconManager.getIconDataUrl(motclefs[0]);
    if (cloudTex) this.updateCloudTexture(cloudTex);

    const bgTex = this.iconManager.getIconDataUrl(motclefs[1]);
    if (bgTex) this.updateMountainTexture(bgTex);

    const enemyTex = this.iconManager.getIconDataUrl(motclefs[2]);
    if (enemyTex) this.updateEnemyTexture(enemyTex);

    const bonusTex = this.iconManager.getIconDataUrl(motclefs[3]);
    if (bonusTex) this.updateBonusTexture(bonusTex);

    const plateformTex = this.iconManager.getIconDataUrl(motclefs[4]);
    if (plateformTex) this.updatePlatformTexture(plateformTex);

    const hillTex = this.iconManager.getIconDataUrl(motclefs[5]);
    if (hillTex) this.updateHillTexture(hillTex);

    const bgColor = motclefs[6];
    this.backgroundObject.style.backgroundColor = bgColor;
  }

  startTextures() {
    // const plateformTex = this.iconManager.getIconDataUrl("Dirt");
    // this.updatePlatformTexture(plateformTex);
    // const cloudTex = this.iconManager.getIconDataUrl("Clouds");
    // this.updateCloudTexture(cloudTex);
    // const bgTex = this.iconManager.getIconDataUrl("Mountain");
    // this.updateMountainTexture(bgTex);
    // const bonusTex = this.iconManager.getIconDataUrl("Dove");
    // this.updateBonusTexture(bonusTex);
    // const hillTex = this.iconManager.getIconDataUrl("Pine");
    // this.updateHillTexture(hillTex);
    // const enemyTex = this.iconManager.getIconDataUrl("Zombie");
    // this.updateEnemyTexture(enemyTex);
  }
}
