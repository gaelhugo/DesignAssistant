/**
 * Gestionnaire d'enregistrement des fonctions.
 * Cette classe définit toutes les fonctions disponibles pour le modèle d'IA
 * et gère leur affichage dans le terminal.
 */
export class FunctionRegistry {
  /**
   * Constructeur du registre de fonctions.
   * Initialise les fonctions disponibles et le gestionnaire de fonctions.
   *
   * @param {Object} functionHandler - Le gestionnaire de fonctions qui traitera les appels
   */
  constructor(functionHandler, minifyManager) {
    this.functions = {};
    this.functionHandler = functionHandler;
    this.terminal = null;
    this.minifyManager = minifyManager;
    // this.canvasFunctions = minifyManager.canvasManager.canvasFunctions;
    this.gameFunctions = minifyManager.game;

    // Définition des fonctions disponibles
    this.availableFunctions = {
      reponse_dictionnaire: {
        handler: (args) => {
          // Extraire les 6 types de mots des paramètres
          const mots = {
            nuage: args.nuage || "Aucun mot pour nuage",
            arrierePlan: args.arrierePlan || "Aucun mot pour arrière plan",
            ennemi: args.ennemi || "Aucun mot pour ennemi",
            bonus: args.bonus || "Aucun mot pour bonus",
            sol: args.sol || "Aucun mot pour sol",
            décor: args.décor || "Aucun mot pour décor",
            couleur: args.couleur || "Aucune couleur spécifiée",
          };

          // Construire le résultat
          const result = {
            success: true,
            message: `Réponse traitée avec les mots suivants :\n- Nuage : ${mots.nuage}\n- Arrière Plan : ${mots.arrierePlan}\n- Ennemi : ${mots.ennemi}\n- Bonus : ${mots.bonus}\n- Sol : ${mots.sol}\n- Décor : ${mots.décor}`,
          };

          // Envoyer les mots au gestionnaire de jeu
          this.gameFunctions.lmstudioMessage(Object.values(mots));

          // Afficher les mots et le résultat dans le terminal
          this.terminal.showInTerminal("reponse_dictionnaire", mots, result);

          return result;
        },
        description:
          "Traite une réponse en utilisant strictement les mots du dictionnaire. Renvoie 6 mots différents qui vont correspondre à six types de réponses, puis 1 couleur. Voici les 6 types de mots : -n1 : un mot qui peut correspondre à un nuage -n2 : un mot qui peut correspodre à un arrière plan, contient la notion de background -n3 : un mot qui peut correspondre à un ennemi ou monstre -n4 : un mot qui correspond à un bonus, contient le mot bonus  -n5 : un mot qui correspond à un sol, souvent contenant le mot ground -n6 : un mot qui correspond à une élément de décors. Et pour la couleure: une couleur en code hexadecimal qui correspond au lexique généré, sans aller dans des couleurs trop flashy.",

        parameters: {
          nuage: {
            type: "string",
            description: "un nuage",
          },
          arrierePlan: {
            type: "string",
            description: "un arrière plan, contient le mot background",
          },
          ennemi: {
            type: "string",
            description: "un ennemi ou monstre",
          },
          bonus: {
            type: "string",
            description: "un bonus à ramasser",
          },
          sol: {
            type: "string",
            description: "un sol",
          },
          décor: {
            type: "string",
            description: "un élément de décor",
          },
          couleur: {
            type: "string",
            description: "une couleur en RVB",
          },
        },
      },
    };
  }

  /**
   * Initialise le terminal pour afficher les résultats des fonctions.
   *
   * @param {Object} terminal - Le terminal à utiliser
   */
  initializeTerminal(terminal) {
    this.terminal = terminal;
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
}
