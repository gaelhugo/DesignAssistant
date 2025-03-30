/**
 * Gestionnaire de la fonctionnalité de minimisation du chat.
 * Permet de basculer entre le mode normal et le mode minimisé.
 */
import { CanvasManager } from "../canvas/CanvasManager.js";

export class MinifyManager {
  /**
   * Initialise le gestionnaire de minimisation.
   *
   * @param {Object} chatInterface - L'interface de chat à minimiser
   */
  constructor(chatInterface) {
    this.chatInterface = chatInterface;
    this.isMinified = false;
    this.minifyButton = null;
    this.expandButton = null;
    this.minifiedChat = null;
    this.canvasManager = new CanvasManager();
  }

  /**
   * Initialise les éléments de l'interface et les écouteurs d'événements.
   */
  initialize() {
    // Utiliser le bouton de minimisation existant dans le HTML
    this.minifyButton = document.getElementById("minify-button");

    // Créer le conteneur pour le chat minimisé (caché par défaut)
    this.createMinifiedChat();

    // Ajouter les écouteurs d'événements
    this.addEventListeners();

    // Initialiser complètement après le chargement du DOM
    // this.completeInitialization();
  }

  /**
   * Crée le conteneur pour le chat minimisé.
   */
  createMinifiedChat() {
    // Créer le conteneur principal
    this.minifiedChat = document.createElement("div");
    this.minifiedChat.classList.add("minified-chat", "hidden");

    // Créer le bouton d'expansion
    this.expandButton = document.createElement("button");
    this.expandButton.classList.add("expand-button");
    this.expandButton.innerHTML =
      '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h6v6"></path><path d="M9 21H3v-6"></path><path d="M21 3l-7 7"></path><path d="M3 21l7-7"></path></svg>';
    this.expandButton.title = "Agrandir le chat";

    // Créer l'input minifié
    const minifiedInput = document.createElement("div");
    minifiedInput.classList.add("minified-input-container");

    // Créer le loader minimaliste (ligne simple)
    const minifiedLoader = document.createElement("div");
    minifiedLoader.classList.add("minified-loader");
    minifiedLoader.id = "minified-loader";

    // Copier l'input existant pour maintenir les fonctionnalités
    const originalInput = document.getElementById("message-input");
    const minifiedTextarea = document.createElement("textarea");
    minifiedTextarea.id = "minified-message-input";
    minifiedTextarea.classList.add("minified-input-area");
    minifiedTextarea.placeholder = "Poser une question...";
    minifiedTextarea.rows = 1;

    // Créer le bouton d'envoi minifié
    const minifiedSendButton = document.createElement("button");
    minifiedSendButton.id = "minified-send-button";
    minifiedSendButton.classList.add("minified-send-button");

    // Utiliser le même SVG que celui défini dans index.html pour le bouton principal
    minifiedSendButton.innerHTML = `
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
      >
        <path d="M.5 1.5l15 6.5-15 6.5m0-13v4l7 2.5L.5 12v4" />
      </svg>
    `;

    // Assembler l'input minifié
    minifiedInput.appendChild(minifiedTextarea);
    minifiedInput.appendChild(minifiedSendButton);

    // Ajouter le loader à la fin du chat minimisé (pas dans l'input)
    this.minifiedChat.appendChild(this.expandButton);
    this.minifiedChat.appendChild(minifiedInput);
    this.minifiedChat.appendChild(minifiedLoader);

    // Ajouter à la page
    document.body.appendChild(this.minifiedChat);
  }

  /**
   * Ajoute les écouteurs d'événements pour les boutons.
   */
  addEventListeners() {
    // Écouteur pour le bouton de minimisation
    this.minifyButton.addEventListener("click", () => this.minimize());

    // Écouteur pour le bouton d'expansion
    this.expandButton.addEventListener("click", () => this.expand());

    // Écouteur pour le textarea minifié
    const minifiedTextarea = document.getElementById("minified-message-input");
    minifiedTextarea.addEventListener("keydown", (event) => {
      if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        this.sendMessageFromMinified();
      }
    });

    // Auto-resize du textarea minifié
    minifiedTextarea.addEventListener("input", () => {
      minifiedTextarea.style.height = "auto";
      minifiedTextarea.style.height =
        Math.min(minifiedTextarea.scrollHeight, 100) + "px";
    });

    // Écouteur pour le bouton d'envoi minifié
    const minifiedSendButton = document.getElementById("minified-send-button");
    minifiedSendButton.addEventListener("click", () =>
      this.sendMessageFromMinified()
    );

    // Copier le SVG du bouton principal vers le bouton minifié
    setTimeout(() => {
      const mainSendButton = document.getElementById("send-button");
      const minifiedSendButton = document.getElementById(
        "minified-send-button"
      );

      if (mainSendButton && minifiedSendButton) {
        minifiedSendButton.innerHTML = mainSendButton.innerHTML;
      }
    }, 100);
  }

  /**
   * Initialisation complète: après le chargement du DOM, copier le SVG du bouton principal
   */
  // completeInitialization() {
  // // Attendre que le DOM soit complètement chargé
  // window.addEventListener('DOMContentLoaded', () => {
  //   // Récupérer le SVG du bouton principal
  //   const mainSendButton = document.getElementById('send-button');
  //   const minifiedSendButton = document.getElementById('minified-send-button');
  //   if (mainSendButton && minifiedSendButton) {
  //     // Copier exactement le même contenu SVG
  //     minifiedSendButton.innerHTML = mainSendButton.innerHTML;
  //   }
  // });
  // }

  /**
   * Minimise le chat et affiche le canvas plein écran.
   */
  minimize() {
    // Cacher la sidebar
    const sidebar = document.querySelector(".sidebar");
    if (sidebar) {
      sidebar.classList.add("hidden");
    }

    // Cacher l'interface principale, mais pas le terminal
    const mainContent = document.querySelector(".main-content");
    if (mainContent) {
      mainContent.classList.add("hidden");
    }

    // Vérifier si le terminal est ouvert
    const terminalContainer = document.getElementById("terminal-container");
    const isTerminalVisible =
      terminalContainer && !terminalContainer.classList.contains("hidden");

    // Afficher le canvas plein écran (sauf si le terminal est visible)
    // if (!isTerminalVisible) {
    this.canvasManager.show();
    // }

    // Afficher le chat minimisé
    if (this.minifiedChat) {
      this.minifiedChat.classList.remove("hidden");
    }

    // Ne pas forcer l'ouverture du terminal s'il n'est pas déjà ouvert
    // Le terminal reste simplement dans son état actuel (ouvert ou fermé)
  }

  /**
   * Agrandit le chat et cache le canvas plein écran.
   */
  expand() {
    // Afficher la sidebar
    const sidebar = document.querySelector(".sidebar");
    if (sidebar) {
      sidebar.classList.remove("hidden");
    }

    // Afficher l'interface principale
    const mainContent = document.querySelector(".main-content");
    if (mainContent) {
      mainContent.classList.remove("hidden");
    }

    // Cacher le canvas plein écran
    this.canvasManager.hide();

    // Cacher le chat minimisé
    if (this.minifiedChat) {
      this.minifiedChat.classList.add("hidden");
    }

    // Laisser le terminal dans son état actuel
    // (pas de changement de position ou de visibilité)
  }

  /**
   * Envoie un message depuis l'interface minimisée.
   */
  sendMessageFromMinified() {
    const minifiedTextarea = document.getElementById("minified-message-input");
    const message = minifiedTextarea.value.trim();

    if (!message) return;

    // Sauvegarder la hauteur actuelle du textarea
    const currentHeight = minifiedTextarea.style.height;

    // Afficher le loader
    const loader = document.getElementById("minified-loader");
    if (loader) {
      loader.classList.add("active");
    }

    // Désactiver le textarea et le bouton pendant le traitement
    // mais conserver sa hauteur
    minifiedTextarea.disabled = true;
    minifiedTextarea.style.height = currentHeight || "32px";

    const sendButton = document.getElementById("minified-send-button");
    if (sendButton) {
      sendButton.disabled = true;
    }

    // Copier le message dans le textarea principal
    const originalTextarea = document.getElementById("message-input");
    originalTextarea.value = message;

    // Déclencher l'envoi du message via l'interface de chat
    if (typeof this.chatInterface.sendMessage === "function") {
      this.chatInterface.sendMessage();

      // Observer les changements dans le chat pour détecter la fin du traitement
      this.observeChatForResponse();
    } else {
      // Fallback si la méthode n'est pas disponible directement
      const mainSendButton = document.getElementById("send-button");
      mainSendButton.click();

      // Observer les changements dans le chat pour détecter la fin du traitement
      this.observeChatForResponse();
    }

    // Vider le textarea minimisé mais conserver sa hauteur
    minifiedTextarea.value = "";
  }

  /**
   * Observe les changements dans le chat pour détecter quand une réponse est reçue.
   */
  observeChatForResponse() {
    const chatDisplay = document.getElementById("chat-display");

    // Créer un observateur de mutations pour surveiller les changements dans le chat
    const observer = new MutationObserver((mutations) => {
      // Vérifier si de nouveaux messages ont été ajoutés
      const hasNewMessages = mutations.some(
        (mutation) =>
          mutation.type === "childList" && mutation.addedNodes.length > 0
      );

      if (hasNewMessages) {
        // Désactiver le loader
        const loader = document.getElementById("minified-loader");
        if (loader) {
          loader.classList.remove("active");
        }

        // Réactiver le textarea et le bouton
        const minifiedTextarea = document.getElementById(
          "minified-message-input"
        );
        if (minifiedTextarea) {
          minifiedTextarea.disabled = false;
          minifiedTextarea.focus();

          // Réinitialiser la hauteur pour qu'elle s'adapte au contenu
          minifiedTextarea.style.height = "auto";
          minifiedTextarea.style.height =
            Math.min(minifiedTextarea.scrollHeight, 100) + "px";
          if (minifiedTextarea.scrollHeight < 32) {
            minifiedTextarea.style.height = "32px";
          }
        }

        const sendButton = document.getElementById("minified-send-button");
        if (sendButton) {
          sendButton.disabled = false;
        }

        // Arrêter l'observation
        observer.disconnect();
      }
    });

    // Configurer l'observateur pour surveiller les ajouts d'enfants
    observer.observe(chatDisplay, { childList: true, subtree: true });

    // Timeout de sécurité pour désactiver le loader après 30 secondes si aucune réponse n'est reçue
    setTimeout(() => {
      observer.disconnect();

      // Désactiver le loader
      const loader = document.getElementById("minified-loader");
      if (loader) {
        loader.classList.remove("active");
      }

      // Réactiver le textarea et le bouton
      const minifiedTextarea = document.getElementById(
        "minified-message-input"
      );
      if (minifiedTextarea) {
        minifiedTextarea.disabled = false;

        // Réinitialiser la hauteur pour qu'elle s'adapte au contenu
        minifiedTextarea.style.height = "auto";
        minifiedTextarea.style.height =
          Math.min(minifiedTextarea.scrollHeight, 100) + "px";
        if (minifiedTextarea.scrollHeight < 32) {
          minifiedTextarea.style.height = "32px";
        }
      }

      const sendButton = document.getElementById("minified-send-button");
      if (sendButton) {
        sendButton.disabled = false;
      }
    }, 30000);
  }
}
