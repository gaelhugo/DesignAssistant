/**
 * Gestionnaire d'enregistrement des fonctions.
 */
import { TerminalInterface } from "../ui/TerminalInterface.js";

export class FunctionRegistry {
  /**
   * Initialise le registre de fonctions.
   * 
   * @param {Object} functionHandler - Le gestionnaire de fonctions
   */
  constructor(functionHandler) {
    this.functionHandler = functionHandler;
    this.terminal = null;
    
    // Définition des fonctions disponibles
    this.availableFunctions = {
      'reponse_dictionnaire': {
        handler: (args) => {
          const result = { 
            success: true, 
            message: `Réponse traitée avec ${args.mots?.length || 0} mots` 
          };
          
          this.showInTerminal('reponse_dictionnaire', args, result);
          return result;
        },
        description: "Répond avec des mots du dictionnaire",
        parameters: {
          mots: {
            type: "array",
            description: "Liste de mots du dictionnaire à utiliser dans la réponse",
            required: true
          }
        }
      },
      
      'afficher_alerte': {
        handler: (args) => {
          if (args.message) {
            alert(args.message);
            const result = { success: true, message: "Alerte affichée" };
            this.showInTerminal('afficher_alerte', args, result);
            return result;
          }
          
          const result = { success: false, message: "Message d'alerte manquant" };
          this.showInTerminal('afficher_alerte', args, result);
          return result;
        },
        description: "Affiche une alerte avec un message",
        parameters: {
          message: {
            type: "string",
            description: "Message à afficher dans l'alerte",
            required: true
          }
        }
      },
      
      'changer_theme': {
        handler: (args) => {
          const validThemes = ['clair', 'sombre', 'bleu', 'vert'];
          if (args.theme && validThemes.includes(args.theme)) {
            document.body.className = '';
            document.body.classList.add(`theme-${args.theme}`);
            
            const result = { success: true, message: `Thème changé pour ${args.theme}` };
            this.showInTerminal('changer_theme', args, result);
            return result;
          }
          
          const result = { 
            success: false, 
            message: `Thème invalide. Utilisez un de ces thèmes: ${validThemes.join(', ')}` 
          };
          this.showInTerminal('changer_theme', args, result);
          return result;
        },
        description: "Change le thème de l'application",
        parameters: {
          theme: {
            type: "string",
            description: "Nom du thème à appliquer (clair, sombre, bleu, vert)",
            required: true
          }
        }
      },
      
      'compter_mots': {
        handler: (args) => {
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
            
            this.showInTerminal('compter_mots', args, result);
            return result;
          }
          
          const result = { success: false, message: "Texte manquant" };
          this.showInTerminal('compter_mots', args, result);
          return result;
        },
        description: "Compte le nombre de mots dans un texte",
        parameters: {
          texte: {
            type: "string",
            description: "Texte dont il faut compter les mots",
            required: true
          }
        }
      }
    };
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
    // Parcourir toutes les fonctions disponibles et les enregistrer
    Object.entries(this.availableFunctions).forEach(([name, funcConfig]) => {
      this.functionHandler.registerFunction(
        name,
        funcConfig.handler,
        funcConfig.description,
        funcConfig.parameters
      );
    });
  }

  /**
   * Affiche un résultat de fonction dans le terminal.
   * 
   * @param {string} functionName - Nom de la fonction exécutée
   * @param {Object} args - Arguments passés à la fonction
   * @param {Object} result - Résultat de l'exécution de la fonction
   */
  showInTerminal(functionName, args, result) {
    if (this.terminal) {
      this.terminal.addFunctionResult(functionName, args, result);
    }
  }
}
