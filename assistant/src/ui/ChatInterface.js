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
    this.lmClient = lmClient; // Pour envoyer des messages à l'API
    this.dictManager = dictManager; // Pour gérer le dictionnaire de mots
    this.functionHandler = functionHandler; // Pour exécuter des fonctions

    // Initialisation du parser markdown pour formater les messages
    this.md = new MarkdownIt({
      html: false, // Désactive le HTML pour la sécurité
      linkify: true, // Convertit les URLs en liens cliquables
      typographer: true, // Active les améliorations typographiques
    });

    // Éléments du DOM (initialisés à null, seront définis dans initialize())
    this.dictionaryDisplay = null; // Affichage du dictionnaire
    this.chatDisplay = null; // Zone d'affichage des messages
    this.messageInput = null; // Champ de saisie du message
    this.sendButton = null; // Bouton d'envoi
    this.loadingElement = null; // Élément d'animation de chargement
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
    this.initEventListeners();
  }

  /**
   * Initialise les gestionnaires d'événements pour l'interface de chat.
   */
  initEventListeners() {
    // Gestionnaire pour le bouton d'envoi
    this.sendButton.addEventListener("click", () => this.sendMessage());

    // Gestionnaire pour la touche Entrée dans le champ de saisie
    this.messageInput.addEventListener("keydown", (event) => {
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
   * Affiche la liste des mots du dictionnaire dans l'interface.
   */
  showDictionary() {
    // Récupère la liste formatée des mots et l'affiche
    this.dictionaryDisplay.textContent =
      this.dictManager.getFormattedWordList();
  }

  /**
   * Ajoute un message à la conversation.
   * Gère différemment les messages de l'utilisateur et de l'assistant.
   *
   * @param {string} sender - L'expéditeur du message ('user' ou 'assistant')
   * @param {string} message - Le contenu du message
   */
  addMessageToChat(sender, message) {
    // Créer l'élément de message
    const messageElement = document.createElement("div");
    messageElement.classList.add("message");

    // Ajout de la classe appropriée selon l'expéditeur
    if (sender === "user") {
      messageElement.classList.add("user-message");
    } else {
      messageElement.classList.add("assistant-message");
    }

    // Ajouter le nom de l'expéditeur
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
          let argsText = "";
          if (Object.keys(args).length > 0) {
            // Traiter chaque valeur pour ajouter des espaces après les virgules
            const processedValues = Object.values(args).map((value) => {
              // Si c'est une chaîne de caractères avec des virgules, ajouter des espaces
              if (typeof value === "string") {
                // Remplacer toutes les virgules par une virgule suivie d'un espace
                return value.replace(/,(?!\s)/g, ", ");
              }
              return value;
            });

            // Joindre les valeurs avec des virgules et des espaces
            argsText = processedValues.join(", ");
          } else {
            argsText = "<em>Aucun argument</em>";
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
   * Envoie le message de l'utilisateur et affiche la réponse de l'assistant.
   * Cette fonction est appelée quand l'utilisateur clique sur Envoyer ou appuie sur Entrée.
   */
  async sendMessage() {
    // Récupérer le message de l'utilisateur
    const userMessage = this.messageInput.value.trim();
    if (!userMessage) return;

    // Ajouter le message de l'utilisateur à la conversation
    this.addMessageToChat("user", userMessage);

    // Effacer le champ de saisie
    this.messageInput.value = "";
    this.messageInput.style.height = "auto";

    // Afficher l'animation de chargement
    this.showLoadingAnimation();

    try {
      // Obtenir le prompt système qui définit le comportement du modèle
      const systemPrompt = this.dictManager.getSystemPrompt();

      // Formater le message pour ajouter des espaces après les virgules
      const formattedMessage = userMessage
        .replace(/,/g, ", ")
        .replace(/\s+/g, " ")
        .trim();

      // Obtenir la réponse de l'assistant
      const response = await this.lmClient.sendMessage(
        systemPrompt,
        formattedMessage
      );

      // Supprimer l'animation de chargement
      this.hideLoadingAnimation();

      // Ajouter la réponse de l'assistant à la conversation
      this.addMessageToChat("assistant", response);
    } catch (error) {
      // En cas d'erreur, supprimer l'animation de chargement
      this.hideLoadingAnimation();

      // Afficher un message d'erreur
      const errorMessage = `Erreur: ${error.message}`;
      this.addMessageToChat("assistant", errorMessage);
      console.error("Erreur lors de l'obtention de la réponse:", error);
    }
  }
}
