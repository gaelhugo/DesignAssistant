/**
 * Interface pour l'application de chat.
 */
import MarkdownIt from "markdown-it";
import { SquareMediaInputManager } from "./SquareMediaInputManager.js";

export class ChatInterface {
  /**
   * Initialise l'interface de chat.
   *
   * @param {Object} lmClient - Le client LMStudio
   * @param {Object} dictManager - Le gestionnaire de dictionnaire
   * @param {Object} functionHandler - Le gestionnaire de fonctions (optionnel)
   */
  constructor(lmClient, dictManager, functionHandler = null) {
    this.lmClient = lmClient;
    this.dictManager = dictManager;
    this.functionHandler = functionHandler;
    this.USE_MEDIA = false;
    this.mediaManager = new SquareMediaInputManager(this);

    // Initialisation du parser markdown
    this.md = new MarkdownIt({
      html: false,
      linkify: true,
      typographer: true,
    });

    // Éléments du DOM
    this.dictionaryDisplay = null;
    this.chatDisplay = null;
    this.messageInput = null;
    this.sendButton = null;
    this.loadingElement = null;
  }

  /**
   * Initialise l'interface utilisateur.
   */
  initialize() {
    // Récupération des éléments du DOM
    this.dictionaryDisplay = document.getElementById("dictionary-display");
    this.chatDisplay = document.getElementById("chat-display");
    this.messageInput = document.getElementById("message-input");
    this.sendButton = document.getElementById("send-button");

    // Add media button to input container
    const inputContainer = document.querySelector(".input-container");
    inputContainer.insertBefore(
      this.mediaManager.getMediaButton(),
      inputContainer.firstChild
    );

    // Initialize new chat button
    const newChatButton = document.querySelector(".new-chat-button");
    if (newChatButton) {
      newChatButton.addEventListener("click", () => this.startNewChat());
    }

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
    this.sendButton.addEventListener("click", () => {
      this.sendMessage();
    });

    // Envoi du message avec la touche Entrée
    this.messageInput.addEventListener("keypress", (event) => {
      if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        this.sendMessage();
      }
    });

    // Auto-resize textarea as user types
    this.messageInput.addEventListener("input", () => {
      this.messageInput.style.height = "auto";
      this.messageInput.style.height =
        Math.min(this.messageInput.scrollHeight, 200) + "px";
    });
  }

  /**
   * Appelé lorsque des médias sont capturés.
   *
   * @param {string} mediaData - Les données des médias capturés
   */
  onMediaCaptured(mediaData) {
    const mediaButton = this.mediaManager.getMediaButton();
    mediaButton.classList.add("has-media");
  }

  /**
   * Démarre un nouveau chat.
   */
  startNewChat() {
    if (this.chatDisplay) {
      this.chatDisplay.innerHTML = "";
    }
    if (this.messageInput) {
      this.messageInput.value = "";
      this.messageInput.style.height = "auto";
    }
    if (this.mediaManager) {
      this.mediaManager.clearCurrentMedia();
      this.mediaManager.getMediaButton().classList.remove("has-media");
    }
  }

  /**
   * Affiche le dictionnaire dans l'interface.
   */
  showDictionary() {
    this.dictionaryDisplay.textContent =
      this.dictManager.getFormattedWordList();
  }

  /**
   * Ajoute un message à la zone de conversation.
   *
   * @param {string} sender - L'expéditeur du message ('user' ou 'assistant')
   * @param {string} message - Le contenu du message
   */
  addMessageToChat(sender, message) {
    // Création du conteneur de message
    const messageElement = document.createElement("div");
    messageElement.classList.add("message");

    if (sender === "user") {
      messageElement.classList.add("user-message");
    } else {
      messageElement.classList.add("assistant-message");
    }

    // Ajout du nom de l'expéditeur
    const senderElement = document.createElement("div");
    senderElement.classList.add("message-sender");
    senderElement.textContent = sender === "user" ? "Vous" : "Assistant";
    messageElement.appendChild(senderElement);

    // Ajout du contenu du message
    const contentElement = document.createElement("div");
    contentElement.classList.add("message-content");

    // Si c'est une réponse de l'assistant, vérifier si c'est du JSON
    if (sender === "assistant") {
      try {
        // Nettoyer la réponse pour extraire le JSON des backticks markdown
        const cleanedMessage = this.cleanJsonResponse(message);

        // Essayer de parser le message comme JSON
        const jsonResponse = JSON.parse(cleanedMessage);

        // Vérifier si on a un gestionnaire de fonctions et traiter l'appel de fonction
        if (this.functionHandler) {
          this.functionHandler.processResponse(jsonResponse);
        }

        // Afficher le JSON formaté pour toutes les réponses
        contentElement.innerHTML = `<pre>${JSON.stringify(
          jsonResponse,
          null,
          2
        )}</pre>`;
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
   * Nettoie une réponse potentiellement formatée en markdown pour extraire le JSON.
   *
   * @param {string} response - La réponse à nettoyer
   * @returns {string} - La réponse nettoyée
   */
  cleanJsonResponse(response) {
    // Vérifier si la réponse est entourée de backticks (format markdown)
    const jsonRegex = /```(?:json)?\s*([\s\S]*?)```/;
    const match = response.match(jsonRegex);

    if (match && match[1]) {
      return match[1].trim();
    }

    // Si pas de backticks, retourner la réponse telle quelle
    return response.trim();
  }

  /**
   * Affiche une animation de chargement dans la conversation.
   */
  showLoadingAnimation() {
    // Créer le conteneur de l'animation
    const loadingElement = document.createElement("div");
    loadingElement.classList.add(
      "message",
      "assistant-message",
      "loading-message"
    );

    // Créer les points de chargement
    const dotsContainer = document.createElement("div");
    dotsContainer.classList.add("loading-dots");

    // Ajouter trois points
    for (let i = 0; i < 3; i++) {
      const dot = document.createElement("div");
      dot.classList.add("dot");
      dotsContainer.appendChild(dot);
    }

    // Ajouter les points au message
    loadingElement.appendChild(dotsContainer);

    // Ajouter l'animation à la conversation
    this.chatDisplay.appendChild(loadingElement);

    // Faire défiler vers le bas
    this.chatDisplay.scrollTop = this.chatDisplay.scrollHeight;

    // Stocker une référence à l'élément pour pouvoir le supprimer plus tard
    this.loadingElement = loadingElement;
    return loadingElement;
  }

  /**
   * Supprime l'animation de chargement de la conversation.
   */
  hideLoadingAnimation() {
    if (this.loadingElement && this.loadingElement.parentNode) {
      this.loadingElement.parentNode.removeChild(this.loadingElement);
      this.loadingElement = null;
    }
  }

  /**
   * Envoie le message de l'utilisateur et affiche la réponse.
   */
  async sendMessage() {
    const userMessage = this.messageInput.value.trim();

    if (!userMessage) {
      return;
    }

    // Get any media data if available
    const mediaData = this.mediaManager.getCurrentMediaData();

    // Add user message to chat
    this.addMessageToChat("user", userMessage);

    // If there's media, add it to the chat
    if (mediaData) {
      const mediaElement = document.createElement("img");
      mediaElement.src = mediaData;
      mediaElement.className = "chat-media";
      this.chatDisplay.lastElementChild.appendChild(mediaElement);
    }

    // Clear input and media
    this.messageInput.value = "";
    this.messageInput.style.height = "auto";
    this.mediaManager.clearCurrentMedia();
    this.mediaManager.getMediaButton().classList.remove("has-media");

    // Show loading animation
    const loadingElement = this.showLoadingAnimation();

    try {
      const systemPrompt = this.dictManager.getSystemPrompt();
      let response;

      if (mediaData) {
        response = await this.lmClient.sendMessageWithImage(
          systemPrompt,
          userMessage,
          mediaData
        );
      } else {
        response = await this.lmClient.sendMessage(systemPrompt, userMessage);
      }

      // Hide loading animation and show response
      this.hideLoadingAnimation();
      this.addMessageToChat("assistant", response);
    } catch (error) {
      this.hideLoadingAnimation();
      const errorMessage = `Erreur: ${error.message}`;
      this.addMessageToChat("assistant", errorMessage);
    }
  }
}
