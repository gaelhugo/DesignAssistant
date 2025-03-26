/**
 * Point d'entrée principal de l'application.
 * Ce fichier initialise tous les composants et démarre l'application.
 */
import './styles/style.css';
import { DictionaryManager } from './dictionary/DictionaryManager.js';
import { JsonDictionaryManager } from './dictionary/JsonDictionaryManager.js';
import { LMStudioClient } from './api/LMStudioClient.js';
import { ChatInterface } from './ui/ChatInterface.js';
import { FunctionCallHandler } from './functions/FunctionCallHandler.js';
import { FunctionRegistry } from './functions/FunctionRegistry.js';

// Attendre que le DOM soit complètement chargé avant d'initialiser l'application
document.addEventListener('DOMContentLoaded', () => {
  // ===== CONFIGURATION DE BASE =====
  
  // Vérifier si le mode JSON est activé (sauvegardé dans le stockage local)
  const savedMode = localStorage.getItem('useJsonMode');
  const useJsonMode = savedMode !== null ? savedMode === 'true' : false;
  
  // Liste des mots autorisés pour le dictionnaire
  const dictionary = [
    "Arbre", "Fleur", "Eau", "Soleil", "Vent", "Terre", "Montagne", "Rivière", 
    "Forêt", "Océan", "Plage", "Ciel", "Nuage", "Pluie", "Neige", "Animal", 
    "Oiseau", "Poisson", "Insecte", "Feuille", "Racine", "Fruit", "Graine", 
    "Roche", "Sable", "Étoile", "Lune", "Herbe", "Prairie", "Saison"
  ];
  
  // Configuration de l'API LMStudio
  const lmUrl = "http://localhost:1234/v1/chat/completions";
  const modelName = "gemma-3-27b-it";
  
  // ===== INITIALISATION DES COMPOSANTS =====
  
  // 1. Créer le client pour communiquer avec l'API LMStudio
  const lmClient = new LMStudioClient(lmUrl, modelName);
  
  // 2. Créer le gestionnaire de dictionnaire selon le mode choisi
  const dictManager = useJsonMode 
    ? new JsonDictionaryManager(dictionary)  // Mode JSON
    : new DictionaryManager(dictionary);     // Mode standard
  
  // 3. Créer le gestionnaire d'appels de fonctions
  // En mode JSON, on lui passe le dictionnaire JSON pour qu'il puisse enregistrer les fonctions
  const functionHandler = new FunctionCallHandler(useJsonMode ? dictManager : null);
  
  // 4. Créer le registre de fonctions qui définit toutes les fonctions disponibles
  const functionRegistry = new FunctionRegistry(functionHandler);
  
  // 5. Initialiser le terminal pour afficher les résultats des fonctions
  const terminalElement = document.getElementById("function-results");
  functionRegistry.initializeTerminal(terminalElement);
  
  // 6. Enregistrer toutes les fonctions définies dans le registre
  functionRegistry.registerAllFunctions();
  
  // 7. Créer l'interface de chat qui gère l'affichage et les interactions
  const chatInterface = new ChatInterface(lmClient, dictManager, functionHandler);
  
  // 8. Démarrer l'interface de chat
  chatInterface.initialize();
  
  // ===== AJOUT DU SÉLECTEUR DE MODE =====
  
  // Créer ou récupérer le sélecteur de mode (JSON ou standard)
  let modeSelector = document.querySelector('.mode-selector');
  
  // Si le sélecteur n'existe pas encore, le créer
  if (!modeSelector) {
    // Créer l'élément
    modeSelector = document.createElement('div');
    modeSelector.classList.add('mode-selector');
    
    // Trouver l'emplacement où l'insérer (après le titre)
    const container = document.querySelector('.container');
    const title = document.querySelector('h1');
    container.insertBefore(modeSelector, title.nextSibling);
  }
  
  // Définir le contenu HTML du sélecteur
  modeSelector.innerHTML = `
    <label>
      <input type="checkbox" id="json-mode-toggle" ${useJsonMode ? 'checked' : ''}>
      Mode JSON
    </label>
  `;
  
  // ===== GESTION DU CHANGEMENT DE MODE =====
  
  // Récupérer la case à cocher du mode JSON
  const modeToggle = document.getElementById('json-mode-toggle');
  
  // Ajouter un écouteur d'événement pour le changement de mode
  modeToggle.addEventListener('change', () => {
    // Récupérer le nouvel état de la case à cocher
    const newMode = modeToggle.checked;
    
    // Sauvegarder le choix dans le stockage local
    localStorage.setItem('useJsonMode', newMode);
    
    // Recharger la page pour appliquer le changement
    window.location.reload();
  });
});
