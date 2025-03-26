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
}
