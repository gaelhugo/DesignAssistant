/**
 * Interface pour l'application de chat.
 */
import MarkdownIt from 'markdown-it';

export class ChatInterface {
  /**
   * Initialise l'interface de chat.
   * 
   * @param {Object} lmClient - Le client LMStudio
   * @param {Object} dictManager - Le gestionnaire de dictionnaire
   */
  constructor(lmClient, dictManager) {
    this.lmClient = lmClient;
    this.dictManager = dictManager;
    
    // Initialisation du parser markdown
    this.md = new MarkdownIt({
      html: false,
      linkify: true,
      typographer: true
    });
    
    // Éléments du DOM
    this.dictionaryDisplay = null;
    this.chatDisplay = null;
    this.messageInput = null;
    this.sendButton = null;
  }

  /**
   * Initialise l'interface utilisateur.
   */
  initialize() {
    // Récupération des éléments du DOM
    this.dictionaryDisplay = document.getElementById('dictionary-display');
    this.chatDisplay = document.getElementById('chat-display');
    this.messageInput = document.getElementById('message-input');
    this.sendButton = document.getElementById('send-button');
    
    // Affichage du dictionnaire
    this.showDictionary();
    
    // Ajout des écouteurs d'événements
    this.addEventListeners();
  }

  /**
   * Ajoute les écouteurs d'événements pour l'interface.
   */
  addEventListeners() {
    // Envoi du message avec le bouton
    this.sendButton.addEventListener('click', () => {
      this.sendMessage();
    });
    
    // Envoi du message avec la touche Entrée
    this.messageInput.addEventListener('keypress', (event) => {
      if (event.key === 'Enter') {
        this.sendMessage();
      }
    });
  }

  /**
   * Affiche le dictionnaire dans l'interface.
   */
  showDictionary() {
    this.dictionaryDisplay.textContent = this.dictManager.getFormattedWordList();
  }

  /**
   * Ajoute un message à la zone de conversation.
   * 
   * @param {string} sender - L'expéditeur du message ('user' ou 'assistant')
   * @param {string} message - Le contenu du message
   */
  addMessageToChat(sender, message) {
    // Création du conteneur de message
    const messageElement = document.createElement('div');
    messageElement.classList.add('message');
    
    if (sender === 'user') {
      messageElement.classList.add('user-message');
    } else {
      messageElement.classList.add('assistant-message');
    }
    
    // Ajout du nom de l'expéditeur
    const senderElement = document.createElement('div');
    senderElement.classList.add('message-sender');
    senderElement.textContent = sender === 'user' ? 'Vous' : 'Assistant';
    messageElement.appendChild(senderElement);
    
    // Ajout du contenu du message
    const contentElement = document.createElement('div');
    contentElement.classList.add('message-content');
    
    // Si c'est une réponse de l'assistant, vérifier si c'est du JSON
    if (sender === 'assistant') {
      try {
        // Essayer de parser le message comme JSON
        const jsonResponse = JSON.parse(message);
        
        // Vérifier si c'est une réponse de dictionnaire au format JSON
        if (jsonResponse.name === 'reponse_dictionnaire' && jsonResponse.arguments && Array.isArray(jsonResponse.arguments.mots)) {
          // Formater les mots du dictionnaire
          const formattedText = jsonResponse.arguments.mots.join(' ');
          // Rendre le texte avec markdown
          contentElement.innerHTML = this.md.render(formattedText);
          
          // Ajouter une note indiquant que c'est une réponse JSON
          const jsonNote = document.createElement('div');
          jsonNote.classList.add('json-note');
          jsonNote.textContent = '(Réponse au format JSON)';
          messageElement.appendChild(jsonNote);
        } else {
          // Si c'est du JSON mais pas au format attendu, afficher le JSON formaté
          contentElement.innerHTML = `<pre>${JSON.stringify(jsonResponse, null, 2)}</pre>`;
        }
      } catch (e) {
        // Si ce n'est pas du JSON, afficher le message avec markdown
        contentElement.innerHTML = this.md.render(message);
      }
    } else {
      // Pour les messages utilisateur, afficher avec markdown de base
      contentElement.innerHTML = this.md.render(message);
    }
    
    messageElement.appendChild(contentElement);
    
    // Ajout du message à la conversation
    this.chatDisplay.appendChild(messageElement);
    
    // Défilement vers le bas pour voir le nouveau message
    this.chatDisplay.scrollTop = this.chatDisplay.scrollHeight;
  }

  /**
   * Affiche un indicateur de chargement pendant que l'assistant génère une réponse.
   * 
   * @returns {HTMLElement} - L'élément de chargement créé
   */
  showLoadingIndicator() {
    const loadingElement = document.createElement('div');
    loadingElement.classList.add('message', 'assistant-message');
    
    const senderElement = document.createElement('div');
    senderElement.classList.add('message-sender');
    senderElement.textContent = 'Assistant';
    loadingElement.appendChild(senderElement);
    
    const loadingIndicator = document.createElement('div');
    loadingIndicator.classList.add('loading');
    loadingElement.appendChild(loadingIndicator);
    
    this.chatDisplay.appendChild(loadingElement);
    this.chatDisplay.scrollTop = this.chatDisplay.scrollHeight;
    
    return loadingElement;
  }

  /**
   * Envoie le message de l'utilisateur et affiche la réponse.
   */
  async sendMessage() {
    const userMessage = this.messageInput.value.trim();
    
    // Vérification que le message n'est pas vide
    if (!userMessage) {
      return;
    }
    
    // Effacer la zone de saisie
    this.messageInput.value = '';
    
    // Afficher le message de l'utilisateur
    this.addMessageToChat('user', userMessage);
    
    // Afficher l'indicateur de chargement
    const loadingElement = this.showLoadingIndicator();
    
    try {
      // Obtenir le prompt système
      const systemPrompt = this.dictManager.getSystemPrompt();
      
      // Envoyer le message à LMStudio et obtenir la réponse
      const response = await this.lmClient.sendMessage(systemPrompt, userMessage);
      
      // Supprimer l'indicateur de chargement
      this.chatDisplay.removeChild(loadingElement);
      
      // Afficher la réponse
      this.addMessageToChat('assistant', response);
    } catch (error) {
      // Supprimer l'indicateur de chargement
      this.chatDisplay.removeChild(loadingElement);
      
      // Afficher l'erreur
      this.addMessageToChat('assistant', `Erreur: ${error.message}`);
      console.error('Erreur lors de l\'envoi du message:', error);
    }
  }
}
