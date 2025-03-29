/**
 * Interface pour le terminal de résultats de fonctions.
 * Cette classe gère l'affichage des résultats de fonctions dans un terminal stylisé.
 */
export class TerminalInterface {
  /**
   * Initialise l'interface du terminal.
   *
   * @param {HTMLElement} terminalElement - L'élément DOM qui contiendra le terminal
   */
  constructor(terminalElement) {
    // Élément DOM qui contiendra le terminal
    this.terminalElement = terminalElement;
    this.terminalContainer = document.getElementById("terminal-container");
    this.terminalHeader = document.getElementById("terminal-header");
    this.closeButton = document.getElementById("close-terminal-button");
    
    // Initialiser les boutons et le comportement du terminal
    this.setupTerminalControls();
    this.setupDraggable();
  }

  /**
   * Initialise le terminal avec un message d'état vide si nécessaire.
   * Cette méthode est appelée au démarrage de l'application.
   */
  initialize() {
    // Vérifier si le terminal est vide
    if (!this.terminalElement.hasChildNodes()) {
      // Si oui, ajouter un message d'état vide
      this.addEmptyState();
    }
  }

  /**
   * Configure les boutons de contrôle du terminal (ouverture/fermeture).
   */
  setupTerminalControls() {
    // Créer le bouton de basculement
    const toggleButton = document.createElement("button");
    toggleButton.textContent = "Terminal";
    toggleButton.classList.add("toggle-terminal-button");
    document.querySelector(".chat-header").appendChild(toggleButton);
    
    // Afficher/masquer le terminal
    toggleButton.addEventListener("click", () => {
      this.toggle();
    });
    
    // Fermer le terminal
    this.closeButton.addEventListener("click", () => {
      this.hide();
    });
  }
  
  /**
   * Configure le comportement de déplacement du terminal.
   */
  setupDraggable() {
    let isDragging = false;
    let offsetX, offsetY;
    
    this.terminalHeader.addEventListener("mousedown", (e) => {
      isDragging = true;
      offsetX = e.clientX - this.terminalContainer.getBoundingClientRect().left;
      offsetY = e.clientY - this.terminalContainer.getBoundingClientRect().top;
      
      // Appliquer les styles pendant le déplacement
      this.terminalContainer.style.transition = "none";
      document.body.style.userSelect = "none";
    });
    
    document.addEventListener("mousemove", (e) => {
      if (!isDragging) return;
      
      const x = e.clientX - offsetX;
      const y = e.clientY - offsetY;
      
      // Limiter le déplacement pour que le terminal reste visible
      const maxX = window.innerWidth - this.terminalContainer.offsetWidth;
      const maxY = window.innerHeight - this.terminalContainer.offsetHeight;
      
      this.terminalContainer.style.left = `${Math.max(0, Math.min(x, maxX))}px`;
      this.terminalContainer.style.top = `${Math.max(0, Math.min(y, maxY))}px`;
      this.terminalContainer.style.bottom = "auto";
      this.terminalContainer.style.right = "auto";
    });
    
    document.addEventListener("mouseup", () => {
      isDragging = false;
      document.body.style.userSelect = "";
    });
  }

  /**
   * Ajoute un message d'état vide au terminal.
   * Ce message est affiché quand aucune fonction n'a encore été exécutée.
   */
  addEmptyState() {
    // Créer une ligne de terminal
    const emptyLine = document.createElement("div");
    emptyLine.classList.add("terminal-line");
    
    // Ajouter le symbole du prompt ($)
    const promptElement = document.createElement("span");
    promptElement.classList.add("terminal-prompt");
    promptElement.textContent = "$";
    emptyLine.appendChild(promptElement);
    
    // Ajouter le message d'état vide
    const textElement = document.createElement("span");
    textElement.classList.add("terminal-text", "empty-state");
    textElement.textContent = "Aucun résultat de fonction à afficher";
    emptyLine.appendChild(textElement);
    
    // Ajouter la ligne au terminal
    this.terminalElement.appendChild(emptyLine);
  }

  /**
   * Ajoute un résultat de fonction au terminal.
   * Affiche la commande exécutée et son résultat dans un format de terminal.
   * 
   * @param {string} functionName - Nom de la fonction exécutée
   * @param {Object} args - Arguments passés à la fonction
   * @param {Object} result - Résultat de l'exécution de la fonction
   */
  addFunctionResult(functionName, args, result) {
    // Supprimer le message "Aucun résultat" si présent
    const emptyState = this.terminalElement.querySelector(".empty-state");
    if (emptyState) {
      const emptyLine = emptyState.closest(".terminal-line");
      if (emptyLine) {
        this.terminalElement.removeChild(emptyLine);
      }
    }

    // ===== AFFICHAGE DE LA COMMANDE =====
    
    // Créer une ligne pour la commande
    const commandLine = document.createElement("div");
    commandLine.classList.add("terminal-line");

    // Ajouter le symbole du prompt ($)
    const promptElement = document.createElement("span");
    promptElement.classList.add("terminal-prompt");
    promptElement.textContent = "$";
    commandLine.appendChild(promptElement);

    // Ajouter la commande (nom de fonction + arguments)
    const commandElement = document.createElement("span");
    commandElement.classList.add("terminal-text", "terminal-command");
    commandElement.textContent = `${functionName}(${JSON.stringify(args)})`;
    commandLine.appendChild(commandElement);

    // Ajouter la ligne de commande au terminal
    this.terminalElement.appendChild(commandLine);

    // ===== AFFICHAGE DU RÉSULTAT =====
    
    // Créer une ligne pour le résultat
    const resultLine = document.createElement("div");
    resultLine.classList.add("terminal-line");

    // Ajouter le symbole d'indentation (>)
    const indentElement = document.createElement("span");
    indentElement.classList.add("terminal-prompt");
    indentElement.textContent = ">";
    resultLine.appendChild(indentElement);

    // Ajouter le conteneur pour le résultat
    const resultElement = document.createElement("span");
    resultElement.classList.add("terminal-text");

    // Créer l'élément qui contiendra le résultat formaté
    const resultOutput = document.createElement("div");
    resultOutput.classList.add("terminal-result");

    // Ajouter une classe spéciale selon le succès ou l'échec
    if (result && result.success === true) {
      resultOutput.classList.add("terminal-success");
    } else if (result && result.success === false) {
      resultOutput.classList.add("terminal-error");
    }

    // Formater le résultat en JSON avec indentation pour lisibilité
    resultOutput.textContent = JSON.stringify(result, null, 2);

    // Assembler les éléments
    resultElement.appendChild(resultOutput);
    resultLine.appendChild(resultElement);
    this.terminalElement.appendChild(resultLine);

    // Faire défiler vers le bas pour voir le nouveau résultat
    this.terminalElement.scrollTop = this.terminalElement.scrollHeight;
  }

  /**
   * Affiche les résultats d'une fonction dans le terminal avec un formatage amélioré.
   *
   * @param {string} functionName - Le nom de la fonction
   * @param {Object} args - Les arguments de la fonction
   * @param {Object} result - Le résultat de la fonction
   */
  showInTerminal(functionName, args, result) {
    // Supprimer le message "Aucun résultat" si présent
    const emptyState = this.terminalElement.querySelector(".empty-state");
    if (emptyState) {
      const emptyLine = emptyState.closest(".terminal-line");
      if (emptyLine) {
        this.terminalElement.removeChild(emptyLine);
      }
    }
    
    // Formater les arguments pour un meilleur affichage
    let processedArgs = {};
    for (const key in args) {
      if (typeof args[key] === "string" && args[key].includes(",")) {
        // Ajouter des espaces après les virgules dans les chaînes de caractères
        processedArgs[key] = args[key]
          .replace(/,/g, ", ")
          .replace(/\s+/g, " ")
          .trim();
      } else {
        processedArgs[key] = args[key];
      }
    }

    const timestamp = new Date().toLocaleTimeString();
    const argsStr = JSON.stringify(processedArgs, null, 2);
    const resultStr = JSON.stringify(result, null, 2);

    const content = `
      <div class="terminal-line">
        <span style="color: #75b5aa">[${timestamp}]</span>
        <span style="color: #f8c555">Fonction: ${functionName}</span>
        <div style="margin-left: 15px; margin-top: 5px;">
          <span style="color: #7ec699">Arguments:</span>
          <pre style="color: #dcdcdc; margin: 5px 0;">${argsStr}</pre>
          <span style="color: ${
            result.success !== false ? "#7ec699" : "#e06c75"
          }">Résultat:</span>
          <pre style="color: #dcdcdc; margin: 5px 0;">${resultStr}</pre>
        </div>
      </div>
    `;

    this.append(content);
  }

  /**
   * Efface tout le contenu du terminal et réinitialise l'état vide.
   * Utile pour réinitialiser l'interface.
   */
  clear() {
    // Vider le terminal en supprimant tous les enfants
    while (this.terminalElement.firstChild) {
      this.terminalElement.removeChild(this.terminalElement.firstChild);
    }
    
    // Ajouter un nouvel état vide
    this.addEmptyState();
  }
  
  /**
   * Affiche le terminal.
   */
  show() {
    this.terminalContainer.classList.remove("hidden");
  }
  
  /**
   * Cache le terminal.
   */
  hide() {
    this.terminalContainer.classList.add("hidden");
  }
  
  /**
   * Bascule l'affichage du terminal.
   */
  toggle() {
    this.terminalContainer.classList.toggle("hidden");
  }
  
  /**
   * Ajoute du contenu HTML au terminal.
   * 
   * @param {string} content - Le contenu HTML à ajouter
   */
  append(content) {
    const line = document.createElement("div");
    line.innerHTML = content;
    this.terminalElement.appendChild(line);
    
    // Auto-scroll vers le bas
    this.terminalElement.scrollTop = this.terminalElement.scrollHeight;
  }
}
