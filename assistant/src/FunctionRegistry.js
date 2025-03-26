/**
 * Gestionnaire d'enregistrement des fonctions.
 */
import { TerminalInterface } from "./TerminalInterface.js";

export class FunctionRegistry {
  /**
   * Initialise le registre de fonctions.
   * 
   * @param {Object} functionHandler - Le gestionnaire de fonctions
   */
  constructor(functionHandler) {
    this.functionHandler = functionHandler;
    this.terminal = null;
  }

  /**
   * Initialise le terminal pour afficher les résultats de fonctions.
   */
  initializeTerminal() {
    const terminalElement = document.getElementById("function-results");
    this.terminal = new TerminalInterface(terminalElement);
    this.terminal.initialize();
  }

  /**
   * Enregistre toutes les fonctions disponibles.
   */
  registerAllFunctions() {
    this.registerDictionaryFunction();
    this.registerAlertFunction();
    this.registerThemeFunction();
    this.registerWordCountFunction();
  }

  /**
   * Ajoute un résultat de fonction au terminal.
   * 
   * @param {string} functionName - Nom de la fonction exécutée
   * @param {Object} args - Arguments passés à la fonction
   * @param {Object} result - Résultat de l'exécution de la fonction
   */
  addFunctionResult(functionName, args, result) {
    if (this.terminal) {
      this.terminal.addFunctionResult(functionName, args, result);
    }
  }

  /**
   * Enregistre la fonction de réponse avec le dictionnaire.
   */
  registerDictionaryFunction() {
    this.functionHandler.registerFunction(
      'reponse_dictionnaire', 
      (args) => {
        const result = { 
          success: true, 
          message: `Réponse traitée avec ${args.mots?.length || 0} mots` 
        };
        
        // Afficher le résultat dans le terminal
        this.addFunctionResult('reponse_dictionnaire', args, result);
        
        return result;
      },
      "Répond avec des mots du dictionnaire",
      {
        mots: {
          type: "array",
          description: "Liste de mots du dictionnaire à utiliser dans la réponse",
          required: true
        }
      }
    );
  }

  /**
   * Enregistre la fonction d'alerte.
   */
  registerAlertFunction() {
    this.functionHandler.registerFunction(
      'afficher_alerte',
      (args) => {
        if (args.message) {
          alert(args.message);
          const result = { success: true, message: "Alerte affichée" };
          
          // Afficher le résultat dans le terminal
          this.addFunctionResult('afficher_alerte', args, result);
          
          return result;
        }
        
        const result = { success: false, message: "Message d'alerte manquant" };
        this.addFunctionResult('afficher_alerte', args, result);
        
        return result;
      },
      "Affiche une alerte avec un message",
      {
        message: {
          type: "string",
          description: "Message à afficher dans l'alerte",
          required: true
        }
      }
    );
  }

  /**
   * Enregistre la fonction de changement de thème.
   */
  registerThemeFunction() {
    this.functionHandler.registerFunction(
      'changer_theme',
      (args) => {
        const validThemes = ['clair', 'sombre', 'bleu', 'vert'];
        if (args.theme && validThemes.includes(args.theme)) {
          document.body.className = '';
          document.body.classList.add(`theme-${args.theme}`);
          
          const result = { success: true, message: `Thème changé pour ${args.theme}` };
          this.addFunctionResult('changer_theme', args, result);
          
          return result;
        }
        
        const result = { 
          success: false, 
          message: `Thème invalide. Utilisez un de ces thèmes: ${validThemes.join(', ')}` 
        };
        this.addFunctionResult('changer_theme', args, result);
        
        return result;
      },
      "Change le thème de l'application",
      {
        theme: {
          type: "string",
          description: "Nom du thème à appliquer (clair, sombre, bleu, vert)",
          required: true
        }
      }
    );
  }

  /**
   * Enregistre la fonction de comptage de mots.
   */
  registerWordCountFunction() {
    this.functionHandler.registerFunction(
      'compter_mots',
      (args) => {
        if (args.texte) {
          const mots = args.texte.trim().split(/\s+/);
          const nbMots = mots.length;
          
          // Compter les mots par longueur
          const parLongueur = {};
          mots.forEach(mot => {
            const longueur = mot.length;
            parLongueur[longueur] = (parLongueur[longueur] || 0) + 1;
          });
          
          const result = {
            success: true,
            total: nbMots,
            parLongueur: parLongueur
          };
          
          this.addFunctionResult('compter_mots', args, result);
          
          return result;
        }
        
        const result = { success: false, message: "Texte manquant" };
        this.addFunctionResult('compter_mots', args, result);
        
        return result;
      },
      "Compte le nombre de mots dans un texte",
      {
        texte: {
          type: "string",
          description: "Texte dont il faut compter les mots",
          required: true
        }
      }
    );
  }
}
