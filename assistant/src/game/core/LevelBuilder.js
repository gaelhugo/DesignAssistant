import Player from '../entities/Player.js';
import Platform from '../entities/Platform.js';
import Enemy from '../entities/Enemy.js';
import Bonus from '../entities/Bonus.js';

/**
 * LevelBuilder class to help create game levels
 */
export default class LevelBuilder {
  constructor(game) {
    this.game = game;
  }

  /**
   * Create the player at the specified position
   * @param {number} x - X position
   * @param {number} y - Y position
   * @param {string} texture - Path to player texture
   * @returns {Player} - The created player object
   */
  createPlayer(x, y, texture) {
    const player = new Player(x, y, texture);
    this.game.addGameObject(player);
    return player;
  }

  /**
   * Create a platform at the specified position
   * @param {number} x - X position
   * @param {number} y - Y position
   * @param {number} width - Width of the platform
   * @param {string} texture - Path to platform texture
   * @returns {Platform} - The created platform object
   */
  createPlatform(x, y, width, texture) {
    const platform = new Platform(x, y, width, texture);
    this.game.addGameObject(platform);
    return platform;
  }

  /**
   * Create an enemy at the specified position
   * @param {number} x - X position
   * @param {number} y - Y position
   * @param {string} texture - Path to enemy texture
   * @returns {Enemy} - The created enemy object
   */
  createEnemy(x, y, texture) {
    const enemy = new Enemy(x, y, texture);
    this.game.addGameObject(enemy);
    return enemy;
  }

  /**
   * Create a bonus at the specified position
   * @param {number} x - X position
   * @param {number} y - Y position
   * @param {string} texture - Path to bonus texture
   * @returns {Bonus} - The created bonus object
   */
  createBonus(x, y, texture) {
    const bonus = new Bonus(x, y, texture);
    this.game.addGameObject(bonus);
    return bonus;
  }

  /**
   * Create a simple level with platforms, enemies, and bonuses
   * @param {string} playerTexture - Path to player texture
   * @param {string} platformTexture - Path to platform texture
   * @param {string} enemyTexture - Path to enemy texture
   * @param {string} bonusTexture - Path to bonus texture
   */
  createSimpleLevel(playerTexture, platformTexture, enemyTexture, bonusTexture) {
    // Create the ground
    this.createPlatform(0, 550, 800, platformTexture);
    
    // Create some platforms
    this.createPlatform(100, 450, 200, platformTexture);
    this.createPlatform(400, 400, 200, platformTexture);
    this.createPlatform(200, 300, 150, platformTexture);
    this.createPlatform(500, 250, 150, platformTexture);
    this.createPlatform(100, 150, 150, platformTexture);
    
    // Create some enemies
    this.createEnemy(450, 368, enemyTexture);
    this.createEnemy(150, 418, enemyTexture);
    this.createEnemy(250, 518, enemyTexture);
    
    // Create some bonuses
    this.createBonus(150, 120, bonusTexture);
    this.createBonus(550, 220, bonusTexture);
    this.createBonus(250, 270, bonusTexture);
    this.createBonus(500, 370, bonusTexture);
    this.createBonus(300, 520, bonusTexture);
    
    // Create the player last so it appears on top
    this.createPlayer(50, 500, playerTexture);
  }
}
