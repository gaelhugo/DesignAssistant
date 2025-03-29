/**
 * Point d'entrée principal de l'application.
 * Ce fichier initialise tous les composants et démarre l'application.
 */
import './styles/style.css';
import { ChatInterface } from './ui/ChatInterface.js';
import { FunctionCallHandler } from './functions/FunctionCallHandler.js';
import { FunctionRegistry } from './functions/FunctionRegistry.js';
import { JsonDictionaryManager } from './dictionary/JsonDictionaryManager.js';
import { DictionaryManager } from './dictionary/DictionaryManager.js';
import { LMStudioClient } from './api/LMStudioClient.js';
import { MinifyManager } from './minify/MinifyManager.js';

// Attendre que le DOM soit complètement chargé avant d'initialiser l'application
document.addEventListener('DOMContentLoaded', () => {
  // ===== CONFIGURATION DE BASE =====
  
  // Vérifier si le mode JSON est activé (sauvegardé dans le stockage local)
  const savedMode = localStorage.getItem('useJsonMode');
  const useJsonMode = savedMode !== null ? savedMode === 'true' : false;
  
  // Appliquer le thème par défaut (clair)
  document.body.classList.add('theme-light');
  
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
  
  // Enregistrer toutes les fonctions définies dans le registre
  functionRegistry.registerAllFunctions();
  
  // ===== INTERFACE UTILISATEUR =====
  
  // 1. Initialiser l'interface de chat
  const chatInterface = new ChatInterface(lmClient, dictManager, functionHandler);
  chatInterface.initialize();
  
  // 2. Initialiser le sélecteur de mode (JSON vs Standard)
  initializeModeSelector(useJsonMode, dictManager, functionHandler);
  
  // 3. Initialiser le sélecteur de thème
  initializeThemeSelector();
  
  // 4. Initialiser le terminal
  const terminal = initTerminal();
  
  // Connecter le terminal au registre de fonctions
  functionRegistry.initializeTerminal(terminal);
  
  // 5. Initialiser les boutons de l'interface ChatGPT
  initializeChatGPTInterface(terminal);
  
  // 6. Initialiser le gestionnaire de minimisation
  const minifyManager = new MinifyManager(chatInterface);
  minifyManager.initialize();
  
  // Fonction globale pour changer de thème
  window.changeTheme = (theme) => {
    // Supprimer toutes les classes de thème existantes
    document.body.classList.remove('theme-light', 'dark-theme', 'blue-theme', 'green-theme');
    
    // Ajouter la nouvelle classe de thème
    document.body.classList.add(theme);
    
    // Sauvegarder le thème dans le localStorage
    localStorage.setItem('theme', theme);
  };
  
  // Initialisation des boutons de thème
  const themeButtons = document.querySelectorAll('.theme-button');
  themeButtons.forEach(button => {
    button.addEventListener('click', () => {
      const theme = button.getAttribute('data-theme');
      window.changeTheme(theme);
    });
  });
  
  // Charger le thème sauvegardé ou utiliser le thème par défaut
  const savedTheme = localStorage.getItem('theme') || 'theme-light';
  window.changeTheme(savedTheme);
});

/**
 * Initialise le sélecteur de mode (JSON vs Standard).
 * 
 * @param {boolean} initialValue - La valeur initiale du mode
 * @param {Object} dictManager - Le gestionnaire de dictionnaire
 * @param {Object} functionHandler - Le gestionnaire de fonctions
 */
function initializeModeSelector(initialValue, dictManager, functionHandler) {
  const modeSelectorContainer = document.querySelector('.mode-selector');
  
  // Créer les éléments du sélecteur
  const label = document.createElement('label');
  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.checked = initialValue;
  
  const span = document.createElement('span');
  span.textContent = initialValue ? 'Mode JSON' : 'Mode Standard';
  
  // Assembler les éléments
  label.appendChild(checkbox);
  label.appendChild(span);
  modeSelectorContainer.appendChild(label);
  
  // Ajouter l'écouteur d'événement pour le changement de mode
  checkbox.addEventListener('change', (event) => {
    const useJsonMode = event.target.checked;
    span.textContent = useJsonMode ? 'Mode JSON' : 'Mode Standard';
    
    // Sauvegarder la préférence
    localStorage.setItem('useJsonMode', useJsonMode);
    
    // Recharger la page pour appliquer le changement
    window.location.reload();
  });
}

/**
 * Initialise le sélecteur de thème.
 * Permet de changer entre les thèmes clair, sombre, bleu et vert.
 */
function initializeThemeSelector() {
  const themeButtons = document.querySelectorAll(".theme-button");
  
  // Fonction pour changer de thème
  function changeTheme(themeName) {
    // Supprimer toutes les classes de thème du body
    document.body.classList.remove(
      "theme-light",
      "dark-theme",
      "blue-theme",
      "green-theme"
    );
    
    // Ajouter la classe du nouveau thème
    document.body.classList.add(themeName);
    
    // Sauvegarder le thème dans le localStorage
    localStorage.setItem("theme", themeName);
    
    // Mettre à jour l'apparence des boutons
    themeButtons.forEach(button => {
      button.classList.toggle("active", button.dataset.theme === themeName);
    });
  }
  
  // Ajouter les écouteurs d'événements pour chaque bouton
  themeButtons.forEach(button => {
    button.addEventListener("click", () => {
      const themeName = button.dataset.theme;
      changeTheme(themeName);
    });
  });
  
  // Charger le thème sauvegardé ou utiliser le thème par défaut
  const savedTheme = localStorage.getItem("theme") || "theme-light";
  changeTheme(savedTheme);
}

/**
 * Initialise le terminal.
 * 
 * @returns {Object} Les méthodes pour manipuler le terminal
 */
function initTerminal() {
  // Récupérer les éléments du DOM
  const terminalContainer = document.getElementById("terminal-container");
  const terminalHeader = document.getElementById("terminal-header");
  const terminalContent = document.getElementById("terminal-content");
  const closeButton = document.getElementById("close-terminal-button");
  const toggleButton = document.createElement("button");
  
  toggleButton.textContent = "Terminal";
  toggleButton.classList.add("toggle-terminal-button");
  document.querySelector(".chat-header").appendChild(toggleButton);
  
  // Fonction pour afficher/masquer le terminal
  toggleButton.addEventListener("click", () => {
    terminalContainer.classList.toggle("hidden");
  });
  
  // Fermer le terminal
  closeButton.addEventListener("click", () => {
    terminalContainer.classList.add("hidden");
  });
  
  // Rendre le terminal déplaçable
  let isDragging = false;
  let offsetX, offsetY;
  
  terminalHeader.addEventListener("mousedown", (e) => {
    isDragging = true;
    offsetX = e.clientX - terminalContainer.getBoundingClientRect().left;
    offsetY = e.clientY - terminalContainer.getBoundingClientRect().top;
    
    // Appliquer les styles pendant le déplacement
    terminalContainer.style.transition = "none";
    document.body.style.userSelect = "none";
  });
  
  document.addEventListener("mousemove", (e) => {
    if (!isDragging) return;
    
    const x = e.clientX - offsetX;
    const y = e.clientY - offsetY;
    
    // Limiter le déplacement pour que le terminal reste visible
    const maxX = window.innerWidth - terminalContainer.offsetWidth;
    const maxY = window.innerHeight - terminalContainer.offsetHeight;
    
    terminalContainer.style.left = `${Math.max(0, Math.min(x, maxX))}px`;
    terminalContainer.style.top = `${Math.max(0, Math.min(y, maxY))}px`;
    terminalContainer.style.bottom = "auto";
    terminalContainer.style.right = "auto";
  });
  
  document.addEventListener("mouseup", () => {
    isDragging = false;
    document.body.style.userSelect = "";
  });
  
  // Exposer les méthodes pour manipuler le terminal
  return {
    show: () => {
      terminalContainer.classList.remove("hidden");
    },
    hide: () => {
      terminalContainer.classList.add("hidden");
    },
    append: (content) => {
      const line = document.createElement("div");
      line.innerHTML = content;
      terminalContent.appendChild(line);
      
      // Auto-scroll vers le bas
      terminalContent.scrollTop = terminalContent.scrollHeight;
    },
    clear: () => {
      terminalContent.innerHTML = "";
    }
  };
}

/**
 * Initialise les fonctionnalités spécifiques à l'interface ChatGPT.
 * 
 * @param {Object} terminal - Le terminal
 */
function initializeChatGPTInterface(terminal) {
  // Gérer le bouton "Nouvelle conversation"
  const newChatButton = document.querySelector('.new-chat-button');
  newChatButton.addEventListener('click', () => {
    // Effacer l'historique des messages
    const chatDisplay = document.getElementById('chat-display');
    chatDisplay.innerHTML = '';
    
    // Effacer le champ de saisie
    const messageInput = document.getElementById('message-input');
    messageInput.value = '';
    messageInput.focus();
  });
  
  // Styliser le bouton d'envoi pour utiliser l'icône SVG
  const sendButton = document.getElementById('send-button');
  sendButton.innerHTML = `
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M7 11L12 6L17 11M12 18V7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  `;
}
