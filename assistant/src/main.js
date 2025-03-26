import './style.css';
import { DictionaryManager } from './DictionaryManager.js';
import { JsonDictionaryManager } from './JsonDictionaryManager.js';
import { LMStudioClient } from './LMStudioClient.js';
import { ChatInterface } from './ChatInterface.js';
import { FunctionCallHandler } from './FunctionCallHandler.js';
import { FunctionRegistry } from './FunctionRegistry.js';

// Initialisation de l'application
document.addEventListener('DOMContentLoaded', () => {
  // Vérifier le mode sauvegardé au chargement
  const savedMode = localStorage.getItem('useJsonMode');
  const useJsonMode = savedMode !== null ? savedMode === 'true' : false;
  
  // Dictionnaire de mots
  const dictionary = [
    "Arbre", "Fleur", "Eau", "Soleil", "Vent", "Terre", "Montagne", "Rivière", 
    "Forêt", "Océan", "Plage", "Ciel", "Nuage", "Pluie", "Neige", "Animal", 
    "Oiseau", "Poisson", "Insecte", "Feuille", "Racine", "Fruit", "Graine", 
    "Roche", "Sable", "Étoile", "Lune", "Herbe", "Prairie", "Saison"
  ];
  
  // Configuration de l'API LMStudio
  const lmUrl = "http://localhost:1234/v1/chat/completions";
  const modelName = "gemma-3-27b-it";
  
  // Initialisation des composants
  const lmClient = new LMStudioClient(lmUrl, modelName);
  
  // Création des gestionnaires en fonction du mode
  const dictManager = useJsonMode 
    ? new JsonDictionaryManager(dictionary)
    : new DictionaryManager(dictionary);
  
  // Initialisation du gestionnaire de fonctions avec référence au JsonDictionaryManager
  const functionHandler = new FunctionCallHandler(useJsonMode ? dictManager : null);
  
  // Enregistrement des fonctions via le registre de fonctions
  const functionRegistry = new FunctionRegistry(functionHandler);
  
  // Initialiser le terminal dans le registre de fonctions
  functionRegistry.initializeTerminal();
  
  // Enregistrer toutes les fonctions
  functionRegistry.registerAllFunctions();
  
  // Création de l'interface de chat avec le gestionnaire de fonctions
  const chatInterface = new ChatInterface(lmClient, dictManager, functionHandler);
  
  // Démarrage de l'interface
  chatInterface.initialize();
  
  // Ajout d'un sélecteur de mode dans l'interface
  let modeSelector = document.querySelector('.mode-selector');
  if (!modeSelector) {
    modeSelector = document.createElement('div');
    modeSelector.classList.add('mode-selector');
    const container = document.querySelector('.container');
    const title = document.querySelector('h1');
    container.insertBefore(modeSelector, title.nextSibling);
  }
  modeSelector.innerHTML = `
    <label>
      <input type="checkbox" id="json-mode-toggle" ${useJsonMode ? 'checked' : ''}>
      Mode JSON
    </label>
  `;
  
  // Gestionnaire d'événement pour le changement de mode
  const modeToggle = document.getElementById('json-mode-toggle');
  modeToggle.addEventListener('change', () => {
    const newMode = modeToggle.checked;
    localStorage.setItem('useJsonMode', newMode);
    // Recharger la page pour appliquer le changement
    window.location.reload();
  });
});
