/**
 * Gestionnaire de la fonctionnalité de minimisation du chat.
 * Permet de basculer entre le mode normal et le mode minimisé.
 */
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
    this.canvas = null;
    this.minifiedChat = null;
  }

  /**
   * Initialise les éléments de l'interface et les écouteurs d'événements.
   */
  initialize() {
    // Utiliser le bouton de minimisation existant dans le HTML
    this.minifyButton = document.getElementById('minify-button');
    
    // Créer le conteneur pour le chat minimisé (caché par défaut)
    this.createMinifiedChat();
    
    // Créer le canvas plein écran (caché par défaut)
    this.createCanvas();
    
    // Ajouter les écouteurs d'événements
    this.addEventListeners();
  }

  /**
   * Crée le bouton de minimisation et l'ajoute à l'interface.
   * Note: Cette méthode n'est plus utilisée car le bouton est maintenant dans le HTML.
   */
  createMinifyButton() {
    // Méthode conservée pour référence, mais non utilisée
    this.minifyButton = document.createElement('button');
    this.minifyButton.classList.add('minify-button');
    this.minifyButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="4 14 10 14 10 20"></polyline><polyline points="20 10 14 10 14 4"></polyline><line x1="14" y1="10" x2="21" y2="3"></line><line x1="3" y1="21" x2="10" y2="14"></line></svg>';
    this.minifyButton.title = 'Minimiser le chat';
    
    // Ajouter le bouton à l'en-tête du chat
    const chatHeader = document.querySelector('.chat-header');
    if (chatHeader) {
      chatHeader.appendChild(this.minifyButton);
    } else {
      console.error('Chat header not found');
    }
  }

  /**
   * Crée le conteneur pour le chat minimisé.
   */
  createMinifiedChat() {
    this.minifiedChat = document.createElement('div');
    this.minifiedChat.classList.add('minified-chat', 'hidden');
    
    // Créer le bouton d'expansion
    this.expandButton = document.createElement('button');
    this.expandButton.classList.add('expand-button');
    this.expandButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h6v6"></path><path d="M9 21H3v-6"></path><path d="M21 3l-7 7"></path><path d="M3 21l7-7"></path></svg>';
    this.expandButton.title = 'Agrandir le chat';
    
    // Créer l'input minifié
    const minifiedInput = document.createElement('div');
    minifiedInput.classList.add('minified-input-container');
    
    // Copier l'input existant pour maintenir les fonctionnalités
    const originalInput = document.getElementById('message-input');
    const minifiedTextarea = document.createElement('textarea');
    minifiedTextarea.id = 'minified-message-input';
    minifiedTextarea.classList.add('minified-input-area');
    minifiedTextarea.placeholder = 'Poser une question...';
    minifiedTextarea.rows = 1;
    
    // Créer le bouton d'envoi minifié
    const minifiedSendButton = document.createElement('button');
    minifiedSendButton.id = 'minified-send-button';
    minifiedSendButton.classList.add('minified-send-button');
    
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
    
    // Assembler le chat minimisé
    this.minifiedChat.appendChild(this.expandButton);
    this.minifiedChat.appendChild(minifiedInput);
    
    // Ajouter à la page
    document.body.appendChild(this.minifiedChat);
  }

  /**
   * Crée le canvas plein écran.
   */
  createCanvas() {
    this.canvas = document.createElement('canvas');
    this.canvas.classList.add('fullscreen-canvas', 'hidden');
    this.canvas.id = 'fullscreen-canvas';
    
    // Ajouter à la page
    document.body.appendChild(this.canvas);
    
    // Configurer le canvas pour qu'il soit toujours à la bonne taille
    this.resizeCanvas();
    window.addEventListener('resize', () => this.resizeCanvas());
  }

  /**
   * Redimensionne le canvas pour qu'il occupe tout l'écran.
   */
  resizeCanvas() {
    if (this.canvas) {
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;
      
      // Obtenir le thème actuel
      const body = document.body;
      let bgColor = '#f7f7f8'; // Couleur par défaut (light theme)
      
      if (body.classList.contains('dark-theme')) {
        bgColor = '#343541';
      } else if (body.classList.contains('blue-theme')) {
        bgColor = '#f0f9ff';
      } else if (body.classList.contains('green-theme')) {
        bgColor = '#ecfdf5';
      }
      
      // Dessiner le fond selon le thème actuel
      const ctx = this.canvas.getContext('2d');
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
  }

  /**
   * Ajoute les écouteurs d'événements pour les boutons.
   */
  addEventListeners() {
    // Écouteur pour le bouton de minimisation
    this.minifyButton.addEventListener('click', () => this.minimize());
    
    // Écouteur pour le bouton d'expansion
    this.expandButton.addEventListener('click', () => this.expand());
    
    // Écouteur pour le textarea minifié
    const minifiedTextarea = document.getElementById('minified-message-input');
    minifiedTextarea.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        this.sendMessageFromMinified();
      }
    });
    
    // Auto-resize du textarea minifié
    minifiedTextarea.addEventListener('input', () => {
      minifiedTextarea.style.height = 'auto';
      minifiedTextarea.style.height = Math.min(minifiedTextarea.scrollHeight, 100) + 'px';
    });
    
    // Écouteur pour le bouton d'envoi minifié
    const minifiedSendButton = document.getElementById('minified-send-button');
    minifiedSendButton.addEventListener('click', () => this.sendMessageFromMinified());
    
    // Écouteur pour les changements de thème
    const themeButtons = document.querySelectorAll('.theme-button');
    themeButtons.forEach(button => {
      button.addEventListener('click', () => {
        // Redessiner le canvas avec la nouvelle couleur de thème
        setTimeout(() => this.resizeCanvas(), 100);
      });
    });
    
    // Copier le SVG du bouton principal vers le bouton minifié
    setTimeout(() => {
      const mainSendButton = document.getElementById('send-button');
      const minifiedSendButton = document.getElementById('minified-send-button');
      
      if (mainSendButton && minifiedSendButton) {
        minifiedSendButton.innerHTML = mainSendButton.innerHTML;
      }
    }, 100);
  }

  /**
   * Initialisation complète: après le chargement du DOM, copier le SVG du bouton principal
   */
  completeInitialization() {
    // Attendre que le DOM soit complètement chargé
    window.addEventListener('DOMContentLoaded', () => {
      // Récupérer le SVG du bouton principal
      const mainSendButton = document.getElementById('send-button');
      const minifiedSendButton = document.getElementById('minified-send-button');
      
      if (mainSendButton && minifiedSendButton) {
        // Copier exactement le même contenu SVG
        minifiedSendButton.innerHTML = mainSendButton.innerHTML;
      }
    });
  }

  /**
   * Minimise le chat et affiche le canvas plein écran.
   */
  minimize() {
    if (this.isMinified) return;
    
    // Masquer l'interface principale
    document.querySelector('.chatgpt-layout').classList.add('hidden');
    
    // Afficher le chat minimisé et le canvas
    this.minifiedChat.classList.remove('hidden');
    this.canvas.classList.remove('hidden');
    
    // Mettre à jour l'état
    this.isMinified = true;
    
    // Redimensionner le canvas
    this.resizeCanvas();
  }

  /**
   * Agrandit le chat et masque le canvas.
   */
  expand() {
    if (!this.isMinified) return;
    
    // Afficher l'interface principale
    document.querySelector('.chatgpt-layout').classList.remove('hidden');
    
    // Masquer le chat minimisé et le canvas
    this.minifiedChat.classList.add('hidden');
    this.canvas.classList.add('hidden');
    
    // Mettre à jour l'état
    this.isMinified = false;
  }

  /**
   * Envoie un message depuis l'interface minimisée.
   */
  sendMessageFromMinified() {
    const minifiedTextarea = document.getElementById('minified-message-input');
    const message = minifiedTextarea.value.trim();
    
    if (!message) return;
    
    // Copier le message dans le textarea principal
    const originalTextarea = document.getElementById('message-input');
    originalTextarea.value = message;
    
    // Déclencher l'envoi du message via l'interface de chat
    if (typeof this.chatInterface.sendMessage === 'function') {
      this.chatInterface.sendMessage();
    } else {
      // Fallback si la méthode n'est pas disponible directement
      const sendButton = document.getElementById('send-button');
      sendButton.click();
    }
    
    // Effacer le textarea minifié
    minifiedTextarea.value = '';
    minifiedTextarea.style.height = 'auto';
  }
}
