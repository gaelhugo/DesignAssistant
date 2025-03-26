import './style.css';
import { DictionaryManager } from './DictionaryManager.js';
import { JsonDictionaryManager } from './JsonDictionaryManager.js';
import { LMStudioClient } from './LMStudioClient.js';
import { ChatInterface } from './ChatInterface.js';

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
  const dictManager = useJsonMode 
    ? new JsonDictionaryManager(dictionary)
    : new DictionaryManager(dictionary);
  const chatInterface = new ChatInterface(lmClient, dictManager);
  
  // Démarrage de l'interface
  chatInterface.initialize();
  
  // Ajout d'un sélecteur de mode dans l'interface
  const modeSelector = document.createElement('div');
  modeSelector.classList.add('mode-selector');
  modeSelector.innerHTML = `
    <label>
      <input type="checkbox" id="json-mode-toggle" ${useJsonMode ? 'checked' : ''}>
      Mode JSON
    </label>
  `;
  
  // Insérer le sélecteur après le titre principal
  const container = document.querySelector('.container');
  const title = document.querySelector('h1');
  container.insertBefore(modeSelector, title.nextSibling);
  
  // Gestionnaire d'événement pour le changement de mode
  document.getElementById('json-mode-toggle').addEventListener('change', (event) => {
    // Recharger la page pour appliquer le changement
    localStorage.setItem('useJsonMode', event.target.checked);
    window.location.reload();
  });
});
