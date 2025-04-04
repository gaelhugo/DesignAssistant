/**
 * GameEngine - Mécaniques de base du jeu
 */
export class GameEngine {
  constructor() {
    // Constantes
    this.LEVEL_WIDTH = 3000;
    this.LEVEL_HEIGHT = 600;
    this.CHUNK_SIZE = 1000;
    this.GRAVITY = 0.5;
    this.FRICTION = 0.8;
    this.MAX_SPEED = 3;
    this.JUMP_FORCE = 12;
    this.MAX_JUMP_HEIGHT = 150;

    // État du jeu
    this.gameObjects = [];
    this.player = null;
    this.platforms = [];
    this.enemies = [];
    this.bonuses = [];
    this.score = 0;
    this.isGameOver = false;
    this.cameraX = 0;
    this.lastTimestamp = 0;
    this.animationFrameId = null;
    this.keysPressed = {};

    // Suivi de la position la plus éloignée atteinte par le joueur
    this.furthestX = 0;

    // Callbacks
    this.onScoreUpdate = null;
    this.onGameOver = null;
    this.onCameraUpdate = null;
    this.onGenerateNewChunks = null;

    this.canMove = true;
  }

  /**
   * Initialise les écouteurs d'événements
   */
  initEventListeners() {
    document.addEventListener("keydown", (e) => {
      this.keysPressed[e.key] = true;
    });

    document.addEventListener("keyup", (e) => {
      this.keysPressed[e.key] = false;
    });
  }

  /**
   * Boucle principale du jeu
   * @param {number} timestamp - Horodatage actuel
   */
  gameLoop(timestamp) {
    if (this.isGameOver) return;

    // Gère les entrées du joueur
    this.handleInput();

    // Met à jour les objets du jeu
    this.updateGameObjects();

    // Vérifie les collisions
    this.checkCollisions();

    // Met à jour la position de la caméra
    if (this.onCameraUpdate) {
      this.onCameraUpdate();
    }

    // Génère de nouveaux segments de niveau si nécessaire
    if (this.onGenerateNewChunks) {
      this.onGenerateNewChunks();
    }

    // Continue la boucle de jeu
    this.lastTimestamp = timestamp;
    this.animationFrameId = requestAnimationFrame(this.gameLoop.bind(this));
  }

  /**
   * Gère les entrées du joueur
   */
  handleInput() {
    if (this.canMove) {
      if (!this.player) return;

      // Déplacement vers la gauche
      if (this.keysPressed["ArrowLeft"]) {
        this.player.velocityX = -this.MAX_SPEED;
        this.player.updateDirection(-1);
      }
      // Déplacement vers la droite
      else if (this.keysPressed["ArrowRight"]) {
        this.player.velocityX = this.MAX_SPEED;
        this.player.updateDirection(1);
      }
      // Pas de mouvement horizontal
      else {
        this.player.velocityX *= this.FRICTION;
      }

      // Saut (seulement si au sol)
      if (this.keysPressed["ArrowUp"] && this.player.isOnGround) {
        this.player.velocityY = -this.JUMP_FORCE;
        this.player.isOnGround = false;
      }
    }
  }

  /**
   * Met à jour tous les objets du jeu
   */
  updateGameObjects() {
    // Met à jour le joueur
    if (this.player) {
      // Applique la gravité
      this.player.velocityY += this.GRAVITY;

      // Met à jour la position
      this.player.x += this.player.velocityX;
      this.player.y += this.player.velocityY;

      // Maintient le joueur dans les limites du niveau
      if (this.player.x < 0) {
        this.player.x = 0;
        this.player.velocityX = 0;
      }

      // Met à jour la position la plus éloignée atteinte
      if (this.player.x > this.furthestX) {
        this.furthestX = this.player.x;
      }

      // Vérifie si le joueur est tombé du niveau
      if (this.player.y > this.LEVEL_HEIGHT) {
        this.gameOver();
        return;
      }

      // Met à jour la position de l'élément DOM
      this.player.updatePosition();
    }

    // Met à jour les ennemis
    for (const enemy of this.enemies) {
      // IA simple: va-et-vient
      enemy.x += enemy.velocityX;

      // Change de direction si atteint le bord de la plateforme
      let onPlatform = false;
      for (const platform of this.platforms) {
        if (
          enemy.x + enemy.width > platform.x &&
          enemy.x < platform.x + platform.width &&
          enemy.y + enemy.height === platform.y
        ) {
          onPlatform = true;

          // Vérifie si l'ennemi est au bord de la plateforme
          if (
            enemy.x <= platform.x ||
            enemy.x + enemy.width >= platform.x + platform.width
          ) {
            enemy.velocityX *= -1;
            enemy.updateDirection(enemy.velocityX > 0 ? 1 : -1);
          }
          break;
        }
      }

      // Si pas sur une plateforme, change de direction
      if (!onPlatform) {
        enemy.velocityX *= -1;
        enemy.updateDirection(enemy.velocityX > 0 ? 1 : -1);
      }

      // Définit la vitesse initiale si non définie
      if (enemy.velocityX === 0) {
        enemy.velocityX = 1 * enemy.direction;
      }

      // Met à jour la position de l'élément DOM
      enemy.updatePosition();
    }

    // Met à jour les bonus (animation flottante simple)
    for (const bonus of this.bonuses) {
      bonus.y += Math.sin(Date.now() / 500) * 0.5;
      bonus.updatePosition();
    }
  }

  /**
   * Vérifie les collisions entre les objets du jeu
   */
  checkCollisions() {
    if (!this.player) return;

    // Réinitialise l'état au sol du joueur
    this.player.isOnGround = false;

    // Vérifie les collisions avec les plateformes
    for (const platform of this.platforms) {
      // Vérifie si le joueur est en collision avec la plateforme
      if (this.isColliding(this.player, platform)) {
        // Venant d'en haut (atterrissage sur la plateforme)
        if (
          this.player.velocityY > 0 &&
          this.player.y + this.player.height - this.player.velocityY <=
            platform.y
        ) {
          this.player.y = platform.y - this.player.height;
          this.player.velocityY = 0;
          this.player.isOnGround = true;
        }
        // Venant d'en bas (heurtant la plateforme par dessous)
        else if (
          this.player.velocityY < 0 &&
          this.player.y - this.player.velocityY >= platform.y + platform.height
        ) {
          this.player.y = platform.y + platform.height;
          this.player.velocityY = 0;
        }
        // Venant du côté (heurtant la plateforme par le côté)
        else {
          if (
            this.player.x + this.player.width / 2 <
            platform.x + platform.width / 2
          ) {
            this.player.x = platform.x - this.player.width;
          } else {
            this.player.x = platform.x + platform.width;
          }
          this.player.velocityX = 0;
        }
      }
    }

    // Vérifie les collisions avec les ennemis
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const enemy = this.enemies[i];

      // Vérifie si le joueur est en collision avec l'ennemi
      if (this.isColliding(this.player, enemy)) {
        // Venant d'en haut (sautant sur l'ennemi)
        if (
          this.player.velocityY > 0 &&
          this.player.y + this.player.height - this.player.velocityY <= enemy.y
        ) {
          // Supprime l'ennemi
          this.removeGameObject(enemy);
          this.enemies.splice(i, 1);

          // Fait rebondir le joueur
          this.player.velocityY = -this.JUMP_FORCE * 0.7;

          // Ajoute des points
          this.score += 100;
          if (this.onScoreUpdate) {
            this.onScoreUpdate(this.score);
          }
        } else {
          // Joueur touché par l'ennemi
          this.gameOver();
          return;
        }
      }
    }

    // Vérifie les collisions avec les bonus
    for (let i = this.bonuses.length - 1; i >= 0; i--) {
      const bonus = this.bonuses[i];

      // Vérifie si le joueur est en collision avec le bonus
      if (this.isColliding(this.player, bonus)) {
        // Supprime le bonus
        this.removeGameObject(bonus);
        this.bonuses.splice(i, 1);

        // Ajoute des points
        this.score += 50;
        if (this.onScoreUpdate) {
          this.onScoreUpdate(this.score);
        }
      }
    }
  }

  /**
   * Vérifie si deux objets du jeu sont en collision
   * @param {Object} a - Premier objet du jeu
   * @param {Object} b - Second objet du jeu
   * @returns {boolean} - Vrai si en collision
   */
  isColliding(a, b) {
    return (
      a.x < b.x + b.width &&
      a.x + a.width > b.x &&
      a.y < b.y + b.height &&
      a.y + a.height > b.y
    );
  }

  /**
   * Supprime un objet du jeu
   * @param {Object} gameObject - Objet du jeu à supprimer
   */
  removeGameObject(gameObject) {
    // Supprime du DOM
    if (gameObject.element && gameObject.element.parentNode) {
      gameObject.element.parentNode.removeChild(gameObject.element);
    }

    // Supprime du tableau des objets du jeu
    const index = this.gameObjects.indexOf(gameObject);
    if (index !== -1) {
      this.gameObjects.splice(index, 1);
    }
  }

  /**
   * Définit le callback pour les mises à jour de score
   * @param {Function} callback - Fonction de callback
   */
  setScoreUpdateCallback(callback) {
    this.onScoreUpdate = callback;
  }

  /**
   * Définit le callback pour la fin de partie
   * @param {Function} callback - Fonction de callback
   */
  setGameOverCallback(callback) {
    this.onGameOver = callback;
  }

  /**
   * Définit le callback pour les mises à jour de caméra
   * @param {Function} callback - Fonction de callback
   */
  setCameraUpdateCallback(callback) {
    this.onCameraUpdate = callback;
  }

  /**
   * Définit le callback pour la génération de nouveaux segments
   * @param {Function} callback - Fonction de callback
   */
  setGenerateNewChunksCallback(callback) {
    this.onGenerateNewChunks = callback;
  }

  /**
   * Fin de partie
   */
  gameOver() {
    this.isGameOver = true;
    if (this.onGameOver) {
      this.onGameOver(this.score);
    }
  }
}
