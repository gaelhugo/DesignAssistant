/**
 * Interface pour le terminal de résultats de fonctions.
 */
export class TerminalInterface {
  /**
   * Initialise l'interface du terminal.
   *
   * @param {HTMLElement} terminalElement - L'élément DOM du terminal
   */
  constructor(terminalElement) {
    this.terminalElement = terminalElement;
  }

  /**
   * Initialise le terminal avec un message d'état vide.
   */
  initialize() {
    // Créer un message d'état vide si le terminal est vide
    if (!this.terminalElement.hasChildNodes()) {
      this.addEmptyState();
    }
  }

  /**
   * Ajoute un état vide au terminal.
   */
  addEmptyState() {
    const emptyLine = document.createElement("div");
    emptyLine.classList.add("terminal-line");
    
    const promptElement = document.createElement("span");
    promptElement.classList.add("terminal-prompt");
    promptElement.textContent = "$";
    emptyLine.appendChild(promptElement);
    
    const textElement = document.createElement("span");
    textElement.classList.add("terminal-text", "empty-state");
    textElement.textContent = "Aucun résultat de fonction à afficher";
    emptyLine.appendChild(textElement);
    
    this.terminalElement.appendChild(emptyLine);
  }

  /**
   * Ajoute un résultat de fonction au terminal.
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

    // Créer la ligne de commande
    const commandLine = document.createElement("div");
    commandLine.classList.add("terminal-line");

    // Ajouter le prompt
    const promptElement = document.createElement("span");
    promptElement.classList.add("terminal-prompt");
    promptElement.textContent = "$";
    commandLine.appendChild(promptElement);

    // Ajouter la commande
    const commandElement = document.createElement("span");
    commandElement.classList.add("terminal-text", "terminal-command");
    commandElement.textContent = `${functionName}(${JSON.stringify(args)})`;
    commandLine.appendChild(commandElement);

    // Ajouter la ligne de commande au terminal
    this.terminalElement.appendChild(commandLine);

    // Créer la ligne de résultat
    const resultLine = document.createElement("div");
    resultLine.classList.add("terminal-line");

    // Ajouter l'indentation pour le résultat
    const indentElement = document.createElement("span");
    indentElement.classList.add("terminal-prompt");
    indentElement.textContent = ">";
    resultLine.appendChild(indentElement);

    // Ajouter le résultat
    const resultElement = document.createElement("span");
    resultElement.classList.add("terminal-text");

    // Créer l'élément de résultat formaté
    const resultOutput = document.createElement("div");
    resultOutput.classList.add("terminal-result");

    // Ajouter une classe de succès ou d'erreur en fonction du résultat
    if (result && result.success === true) {
      resultOutput.classList.add("terminal-success");
    } else if (result && result.success === false) {
      resultOutput.classList.add("terminal-error");
    }

    // Formater le résultat en JSON avec indentation
    resultOutput.textContent = JSON.stringify(result, null, 2);

    // Ajouter le résultat formaté à l'élément de texte
    resultElement.appendChild(resultOutput);
    resultLine.appendChild(resultElement);

    // Ajouter la ligne de résultat au terminal
    this.terminalElement.appendChild(resultLine);

    // Faire défiler vers le bas pour voir le nouveau résultat
    this.terminalElement.scrollTop = this.terminalElement.scrollHeight;
  }

  /**
   * Efface le contenu du terminal.
   */
  clear() {
    // Vider le terminal
    while (this.terminalElement.firstChild) {
      this.terminalElement.removeChild(this.terminalElement.firstChild);
    }
    
    // Ajouter un état vide
    this.addEmptyState();
  }
}
