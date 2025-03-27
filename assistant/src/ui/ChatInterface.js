/**
 * Interface pour l'application de chat.
 * Cette classe gère l'interface utilisateur du chat, l'affichage des messages
 * et l'interaction avec l'API LMStudio.
 */
import MarkdownIt from "markdown-it";

export class ChatInterface {
  /**
   * Initialise l'interface de chat.
   *
   * @param {Object} lmClient - Le client pour communiquer avec LMStudio
   * @param {Object} dictManager - Le gestionnaire de dictionnaire de mots
   * @param {Object} functionHandler - Le gestionnaire de fonctions (optionnel)
   */
  constructor(lmClient, dictManager, functionHandler = null) {
    // Stockage des dépendances
    this.lmClient = lmClient;           // Pour envoyer des messages à l'API
    this.dictManager = dictManager;     // Pour gérer le dictionnaire de mots
    this.functionHandler = functionHandler; // Pour exécuter des fonctions

    // Initialisation du parser markdown pour formater les messages
    this.md = new MarkdownIt({
      html: false,        // Désactive le HTML pour la sécurité
      linkify: true,      // Convertit les URLs en liens cliquables
      typographer: true,  // Active les améliorations typographiques
    });

    // Éléments du DOM (initialisés à null, seront définis dans initialize())
    this.dictionaryDisplay = null; // Affichage du dictionnaire
    this.chatDisplay = null;       // Zone d'affichage des messages
    this.messageInput = null;      // Champ de saisie du message
    this.sendButton = null;        // Bouton d'envoi
  }

  /**
   * Initialise l'interface utilisateur en récupérant les éléments du DOM
   * et en configurant les événements.
   */
  initialize() {
    // Récupération des éléments du DOM par leur ID
    this.dictionaryDisplay = document.getElementById("dictionary-display");
    this.chatDisplay = document.getElementById("chat-display");
    this.messageInput = document.getElementById("message-input");
    this.sendButton = document.getElementById("send-button");

    // Affichage du dictionnaire de mots disponibles
    this.showDictionary();

    // Configuration des événements (clic sur bouton, appui sur Entrée)
    this.addEventListeners();
  }

  /**
   * Ajoute les écouteurs d'événements pour l'interface.
   * - Clic sur le bouton d'envoi
   * - Appui sur la touche Entrée dans le champ de saisie
   */
  addEventListeners() {
    // Envoi du message quand on clique sur le bouton
    this.sendButton.addEventListener("click", () => {
      this.sendMessage();
    });

    // Envoi du message quand on appuie sur Entrée dans le champ
    this.messageInput.addEventListener("keypress", (event) => {
      if (event.key === "Enter") {
        this.sendMessage();
      }
    });
  }

  /**
   * Affiche la liste des mots du dictionnaire dans l'interface.
   */
  showDictionary() {
    // Récupère la liste formatée des mots et l'affiche
    this.dictionaryDisplay.textContent = this.dictManager.getFormattedWordList();
  }

  /**
   * Ajoute un message à la zone de conversation.
   * Gère différemment les messages de l'utilisateur et de l'assistant.
   *
   * @param {string} sender - L'expéditeur du message ('user' ou 'assistant')
   * @param {string} message - Le contenu du message
   */
  addMessageToChat(sender, message) {
    // Création du conteneur de message
    const messageElement = document.createElement("div");
    messageElement.classList.add("message");

    // Ajout de la classe appropriée selon l'expéditeur
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

    // Traitement spécial pour les messages de l'assistant (potentiellement JSON)
    if (sender === "assistant") {
      try {
        // Essayer de traiter comme JSON
        const cleanedMessage = this.cleanJsonResponse(message);
        const jsonResponse = JSON.parse(cleanedMessage);

        // Si on a un gestionnaire de fonctions, traiter l'appel de fonction
        if (this.functionHandler) {
          this.functionHandler.processResponse(jsonResponse);
        }

        // Afficher uniquement les valeurs des arguments, sans le nom de fonction ni les clés
        if (jsonResponse.name && jsonResponse.arguments) {
          // C'est un appel de fonction
          const args = jsonResponse.arguments;
          
          // Créer une représentation textuelle simple des arguments (juste les valeurs)
          let argsText = '';
          if (Object.keys(args).length > 0) {
            argsText = Object.values(args).join(' ');
          } else {
            argsText = '<em>Aucun argument</em>';
          }
          
          contentElement.innerHTML = `<div class="function-result">${argsText}</div>`;
        } else {
          // Fallback pour les autres types de JSON
          contentElement.innerHTML = `<pre>${JSON.stringify(
            jsonResponse,
            null,
            2
          )}</pre>`;
        }
      } catch (e) {
        // Si ce n'est pas du JSON valide, afficher comme texte normal avec markdown
        contentElement.innerHTML = this.md.render(message);
      }
    } else {
      // Pour les messages utilisateur, afficher avec markdown
      contentElement.innerHTML = this.md.render(message);
    }

    // Ajouter le contenu au message
    messageElement.appendChild(contentElement);

    // Ajouter le message à la conversation
    this.chatDisplay.appendChild(messageElement);

    // Faire défiler vers le bas pour voir le nouveau message
    this.chatDisplay.scrollTop = this.chatDisplay.scrollHeight;
  }

  /**
   * Nettoie une réponse JSON qui pourrait être entourée de backticks markdown.
   * Par exemple, si le modèle renvoie ```json { ... } ```, cette fonction extrait { ... }
   *
   * @param {string} response - La réponse à nettoyer
   * @returns {string} - La réponse nettoyée
   */
  cleanJsonResponse(response) {
    // Expression régulière pour trouver du JSON dans des blocs de code markdown
    const jsonRegex = /```(?:json)?\s*([\s\S]*?)```/;
    const match = response.match(jsonRegex);

    if (match && match[1]) {
      // Si trouvé dans des backticks, retourner le contenu
      return match[1].trim();
    }

    // Sinon, retourner la réponse telle quelle
    return response.trim();
  }

  /**
   * Affiche un indicateur de chargement pendant que l'assistant génère une réponse.
   *
   * @returns {HTMLElement} - L'élément de chargement créé (pour pouvoir le supprimer plus tard)
   */
  showLoadingIndicator() {
    // Créer un élément de message pour l'indicateur de chargement
    const loadingElement = document.createElement("div");
    loadingElement.classList.add("message", "assistant-message");

    // Ajouter le nom de l'expéditeur
    const senderElement = document.createElement("div");
    senderElement.classList.add("message-sender");
    senderElement.textContent = "Assistant";
    loadingElement.appendChild(senderElement);

    // Ajouter le contenu avec l'animation de chargement
    const contentElement = document.createElement("div");
    contentElement.classList.add("message-content");
    
    // Créer l'animation de chargement
    const loadingAnimation = document.createElement("div");
    loadingAnimation.classList.add("loading-animation");
    contentElement.appendChild(loadingAnimation);

    // Assembler et ajouter à la conversation
    loadingElement.appendChild(contentElement);
    this.chatDisplay.appendChild(loadingElement);
    
    // Faire défiler vers le bas
    this.chatDisplay.scrollTop = this.chatDisplay.scrollHeight;

    return loadingElement;
  }

  /**
   * Envoie le message de l'utilisateur et affiche la réponse de l'assistant.
   * Cette fonction est appelée quand l'utilisateur clique sur Envoyer ou appuie sur Entrée.
   */
  async sendMessage() {
    // Récupérer le message de l'utilisateur et supprimer les espaces inutiles
    const userMessage = this.messageInput.value.trim();

    // Ne rien faire si le message est vide
    if (!userMessage) {
      return;
    }

    // Ajouter le message de l'utilisateur à la conversation
    this.addMessageToChat("user", userMessage);

    // Effacer le champ de saisie
    this.messageInput.value = "";

    // Afficher l'indicateur de chargement
    const loadingElement = this.showLoadingIndicator();

    try {
      // Obtenir le prompt système qui définit le comportement du modèle
      const systemPrompt = this.dictManager.getSystemPrompt();
      
      // Envoyer le message à LMStudio et attendre la réponse
      const response = await this.lmClient.sendMessage(
        systemPrompt,
        userMessage
      );

      // Supprimer l'indicateur de chargement
      this.chatDisplay.removeChild(loadingElement);

      // Ajouter la réponse de l'assistant à la conversation
      this.addMessageToChat("assistant", response);
    } catch (error) {
      // En cas d'erreur, supprimer l'indicateur de chargement
      this.chatDisplay.removeChild(loadingElement);

      // Afficher un message d'erreur
      const errorMessage = `Erreur: ${error.message}`;
      this.addMessageToChat("assistant", errorMessage);
    }
  }
}
