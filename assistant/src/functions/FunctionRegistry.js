/**
 * Gestionnaire d'enregistrement des fonctions.
 * Cette classe définit toutes les fonctions disponibles pour le modèle d'IA
 * et gère leur affichage dans le terminal.
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
      reponse_dictionnaire: {
        handler: (args) => {
          // Cette fonction permet de traiter une réponse en utilisant
          // strictement les mots du dictionnaire
          const result = {
            success: true,
            message: `Réponse traitée avec ${
              args.mots?.length || 0
            } mots du dictionnaire`,
          };

          // Afficher le résultat dans le terminal
          this.showInTerminal("reponse_dictionnaire", args, result);
          return result;
        },
        description:
          "Traite une réponse en utilisant strictement les mots du dictionnaire",
        parameters: {
          mots: {
            type: "array",
            description:
              "Liste des mots du dictionnaire à utiliser dans la réponse",
            items: {
              type: "string",
            },
          },
        },
      },

      compter_mots: {
        handler: (args) => {
          // Cette fonction compte le nombre de mots dans un texte donné
          // et affiche le résultat dans le terminal.
          const texte = args.texte || "";
          const mots = texte.split(/\s+/).filter((mot) => mot.length > 0);

          // Compter les mots par longueur
          const parLongueur = {};
          mots.forEach((mot) => {
            const longueur = mot.length;
            parLongueur[longueur] = (parLongueur[longueur] || 0) + 1;
          });

          const result = {
            success: true,
            total: mots.length,
            parLongueur: parLongueur,
          };

          // Afficher le résultat dans le terminal
          this.showInTerminal("compter_mots", args, result);
          return result;
        },
        description: "Compte le nombre de mots dans un texte",
        parameters: {
          texte: {
            type: "string",
            description: "Le texte dont on veut compter les mots",
          },
        },
      },

      alerte: {
        handler: (args) => {
          // Cette fonction affiche une alerte à l'utilisateur
          // avec un message personnalisé.
          const message = args.message || "Alerte!";

          // Afficher l'alerte dans une boîte de dialogue
          alert(message);

          const result = {
            success: true,
            message: `Alerte affichée: ${message}`,
          };

          // Afficher le résultat dans le terminal
          this.showInTerminal("alerte", args, result);
          return result;
        },
        description: "Affiche une alerte à l'utilisateur",
        parameters: {
          message: {
            type: "string",
            description: "Le message à afficher dans l'alerte",
          },
        },
      },

      changer_theme: {
        handler: (args) => {
          // Cette fonction change le thème de l'application
          // en fonction du paramètre theme.
          const theme = args.theme || "clair";
          const themes = ["clair", "sombre", "bleu", "vert"];

          // Vérifier si le thème est valide
          if (!themes.includes(theme)) {
            const result = {
              success: false,
              message: `Thème invalide: ${theme}. Thèmes disponibles: ${themes.join(
                ", "
              )}`,
            };
            this.showInTerminal("changer_theme", args, result);
            return result;
          }

          // Supprimer les classes de thème existantes
          document.body.classList.remove(...themes.map((t) => `theme-${t}`));

          // Ajouter la nouvelle classe de thème
          document.body.classList.add(`theme-${theme}`);

          const result = {
            success: true,
            message: `Thème changé pour: ${theme}`,
          };

          // Afficher le résultat dans le terminal
          this.showInTerminal("changer_theme", args, result);
          return result;
        },
        description: "Change le thème de l'application",
        parameters: {
          theme: {
            type: "string",
            description: "Le thème à appliquer (clair, sombre, bleu, vert)",
          },
        },
      },
    };
  }

  /**
   * Initialise le terminal pour afficher les résultats des fonctions.
   *
   * @param {HTMLElement} terminalElement - L'élément DOM du terminal
   */
  initializeTerminal(terminalElement) {
    // Cette méthode initialise le terminal pour afficher les résultats des fonctions.
    this.terminal = new TerminalInterface(terminalElement);
    this.terminal.initialize();
  }

  /**
   * Enregistre toutes les fonctions définies dans availableFunctions.
   * Cette méthode est appelée au démarrage de l'application.
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
   * Affiche le résultat d'une fonction dans le terminal.
   *
   * @param {string} functionName - Nom de la fonction exécutée
   * @param {Object} args - Arguments passés à la fonction
   * @param {Object} result - Résultat de l'exécution de la fonction
   */
  showInTerminal(functionName, args, result) {
    // Cette méthode affiche le résultat d'une fonction dans le terminal.
    if (this.terminal) {
      this.terminal.addFunctionResult(functionName, args, result);
    }
  }
}
