/**
 * Point d'entrée principal de l'application.
 * Ce fichier initialise tous les composants et démarre l'application.
 */
import "./styles/style.css";
import "./styles/dragDrop.css";
import "./styles/mediaInput.css";
import "./styles/game.css";
import { ChatInterface } from "./ui/ChatInterface.js";
import { FunctionCallHandler } from "./functions/FunctionCallHandler.js";
import { FunctionRegistry } from "./functions/FunctionRegistry.js";
import { JsonDictionaryManager } from "./dictionary/JsonDictionaryManager.js";
import { DictionaryManager } from "./dictionary/DictionaryManager.js";
import { LMStudioClient } from "./api/LMStudioClient.js";
import { MinifyManager } from "./minify/MinifyManager.js";
import { TerminalInterface } from "./ui/TerminalInterface.js";
import { ThemeSelector } from "./ui/ThemeSelector.js";
import { ModeSelector } from "./ui/ModeSelector.js";
import { DragAndDropManager } from "./ui/DragAndDropManager.js";

// Attendre que le DOM soit complètement chargé avant d'initialiser l'application
// document.addEventListener("DOMContentLoaded", () => {
function start() {
  // ===== CONFIGURATION DE BASE =====

  // Vérifier si le mode JSON est activé (sauvegardé dans le stockage local)
  const savedMode = localStorage.getItem("useJsonMode");
  const useJsonMode = savedMode !== null ? savedMode === "true" : false;

  // Liste des mots autorisés pour le dictionnaire
  const dictionary = [
    "Car",
    "Tree",
    "Bicycle",
    "Dog",
    "Sign",
    "Trolley",
    "RockFire",
    "SmallRockFire",
    "RedCloud",
    "HitCloud",
    "Fire",
    "Rock",
    "PinkCottonCandyCloud",
    "YellowCottonCandyCloud",
    "LittleRockFire",
    "Rock2",
    "BlueCottonCandyCloud",
    "PinkCottonCandyCloudOnStick",
    "Explosion",
    "DeadGrassStone",
    "GreenStone",
    "GreenStone2",
    "Grass",
    "Blue Tree",
    "GreenStone3",
    "Summer Grass",
    "FlowerGrass",
    "FluffyTree",
    "Rocks",
    "SimpleRock",
    "Dirt",
    "PineTree",
    "StoneGrass",
    "GrassFlower",
    "GreenBush",
    "Bush",
    "Zombie",
    "Skeleton",
    "ThroneStructure",
    "spikyStone",
    "Zombie2",
    "Skeleton2",
    "WoodenFence",
    "RoundStone",
    "DressedZombie",
    "StoneWall",
    "GraveStone",
    "GraveStone2",
    "BigWoodenFence",
    "Spikes",
    "cup",
    "Pot",
    "Mask1",
    "Enemy",
    "BirdEnemy",
    "Bird",
    "Monster2",
    "BigEnemy",
    "Mask2",
    "BadOctopus",
    "Ninja",
    "Monster",
    "BlueMountain",
    "BlueMountain2",
    "BlueMountain3",
    "OrangeMountain",
    "SpikyMountain",
    "OrangeCoral",
    "Truck",
    "BlueIcyCloud",
    "PinkCoral",
    "OrangeCar",
    "BlueIcyCloud2",
    "PinkCoral2",
    "YellowCar",
    "YellowCoral",
    "Pine",
    "AppleTree",
    "Bushy",
    "Palm",
    "Leopard",
    "PlantPot",
    "LogBush",
    "Dove",
    "TurtleShell",
    "Mouse",
    "Cactus",
    "Parrot",
    "TropicalFruit",
    "YellowBird",
    "JungleBush",
    "JungleFruit",
    "Cacao",
    "SnowPile",
    "Snowman",
    "TownHouse",
    "Cotage",
    "SnowSpike",
    "Snowman2",
    "OrangeHouse",
    "GreenHouse",
    "SnowPile2",
    "MushroomGuy",
    "Building",
    "City",
    "SnowBall",
    "Mushroom",
    "Hotel",
    "Museum",
    "Pyramid",
    "Blue Crystal",
    "SmallCactus",
    "TallPyramid",
    "Pink Crystal",
    "TreeCactus",
    "Star",
    "BlueAsteroid",
    "Shard",
    "CuteCactus",
    "HalfMoon",
    "Asteroid",
    "Planet",
    "Ghost",
    "IcyMoutain",
    "DumbZombie",
    "Wolf",
    "Ghost2",
    "SaunaBucket",
    "Wolfy",
    "Halloween",
    "Moutain",
    "Robot",
    "WahsingMachine",
    "RedGround",
    "OrangeGround",
    "WaterGround",
    "GrassGround",
    "StoneGround",
    "SandGround",
    "SandGroundBackground",
    "DirtGround",
    "CityBackground",
    "IcyMoutainBackground",
    "HillBackground",
    "VolcanoBackground",
    "StarBonus",
    "BubbleBonus",
    "RubyBonus",
    "FluffyCloud",
    "CoinBonus",
    "CandyLandBackground",
    "PinkHeartBonus",
    "OceanBackground",
    "DesertPyramidBackground",
    "BeachSandBackground",
    "SnowGround",
  ];

  // Configuration de l'API LMStudio
  const lmUrl = "http://localhost:1234/v1/chat/completions";
  const modelName = "gemma-3-12b-it";

  // ===== INITIALISATION DES COMPOSANTS =====

  // 1. Créer le client pour communiquer avec l'API LMStudio
  const lmClient = new LMStudioClient(lmUrl, modelName);

  // 2. Créer le gestionnaire de dictionnaire selon le mode choisi
  const dictManager = useJsonMode
    ? new JsonDictionaryManager(dictionary) // Mode JSON
    : new DictionaryManager(dictionary); // Mode standard

  // 3. Créer le gestionnaire d'appels de fonctions
  // En mode JSON, on lui passe le dictionnaire JSON pour qu'il puisse enregistrer les fonctions
  const functionHandler = new FunctionCallHandler(
    useJsonMode ? dictManager : null
  );

  // ===== INTERFACE UTILISATEUR =====

  // 1. Initialiser l'interface de chat
  const chatInterface = new ChatInterface(
    lmClient,
    dictManager,
    functionHandler
  );
  chatInterface.initialize();

  // 2. Initialiser le sélecteur de mode (JSON vs Standard)
  const modeSelector = new ModeSelector(
    useJsonMode,
    dictManager,
    functionHandler
  );

  // 3. Initialiser le sélecteur de thème
  const themeSelector = new ThemeSelector();

  // 4. Initialiser le terminal
  const terminalElement = document.getElementById("terminal-content");
  const terminal = new TerminalInterface(terminalElement);
  terminal.initialize();

  // 6. Initialiser le gestionnaire de minimisation
  const minifyManager = new MinifyManager(chatInterface);
  minifyManager.initialize();

  // 4. Créer le registre de fonctions qui définit toutes les fonctions disponibles
  const functionRegistry = new FunctionRegistry(functionHandler, minifyManager);

  // 5. Enregistrer toutes les fonctions définies dans le registre
  functionRegistry.registerAllFunctions();

  // 6. Configurer le terminal dans le registre de fonctions
  functionRegistry.initializeTerminal(terminal);

  // Initialize drag and drop for dictionary display
  const dictionaryDisplay = document.getElementById("dictionary-display");
  new DragAndDropManager(dictionaryDisplay, dictManager);
}

window.addEventListener("DOMContentLoaded", () => {
  start();
});
