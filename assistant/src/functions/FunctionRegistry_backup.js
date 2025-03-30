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
    this.canvasFunctions = minifyManager.canvasManager.canvasFunctions;

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
          this.terminal.showInTerminal("reponse_dictionnaire", args, result);
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
          this.terminal.showInTerminal("compter_mots", args, result);
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
          this.terminal.showInTerminal("alerte", args, result);
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
          const theme = args.theme || "theme-light";
          const themes = [
            "theme-light",
            "dark-theme",
            "blue-theme",
            "green-theme",
          ];

          // Map des anciens noms de thèmes vers les nouveaux
          const themeMap = {
            light: "theme-light",
            dark: "dark-theme",
            blue: "blue-theme",
            green: "green-theme",
          };

          // Convertir l'ancien nom de thème si nécessaire
          const normalizedTheme = themeMap[theme] || theme;

          // Vérifier si le thème est valide
          if (!themes.includes(normalizedTheme)) {
            return {
              success: false,
              message: `Thème non valide. Les thèmes disponibles sont: ${themes.join(
                ", "
              )}`,
            };
          }

          // Utiliser la fonction globale de changement de thème
          if (typeof window.changeTheme === "function") {
            window.changeTheme(normalizedTheme);
          }

          return {
            success: true,
            message: `Thème changé pour: ${normalizedTheme}`,
          };
        },
        description: "Change le thème de l'application",
        parameters: {
          theme: {
            type: "string",
            description:
              "Le thème à appliquer. Valeurs possibles: theme-light, dark-theme, blue-theme, green-theme",
          },
        },
      },

      ouvrir_itunes: {
        handler: (args) => {
          // Cette fonction appelle le serveur Flask pour ouvrir iTunes
          const result = {
            pending: true,
            message: "Ouverture d'iTunes en cours...",
          };
          this.terminal.showInTerminal("ouvrir_itunes", args, result);

          // Appel au serveur Flask
          fetch("http://localhost:5000/api/open-itunes")
            .then((response) => response.json())
            .then((data) => {
              const finalResult = {
                success: data.success,
                message: data.message,
              };
              this.terminal.showInTerminal("ouvrir_itunes", args, finalResult);
              return finalResult;
            })
            .catch((error) => {
              const errorResult = {
                success: false,
                message: `Erreur lors de l'ouverture d'iTunes: ${error.message}`,
              };
              this.terminal.showInTerminal("ouvrir_itunes", args, errorResult);
              return errorResult;
            });

          return result;
        },
        description: "Ouvre l'application iTunes sur votre Mac",
        parameters: {},
      },

      jouer_morceau: {
        handler: (args) => {
          // Cette fonction appelle le serveur Flask pour jouer un morceau dans iTunes
          const result = {
            pending: true,
            message: "Chargement du morceau en cours...",
          };
          this.terminal.showInTerminal("jouer_morceau", args, result);

          // Appel au serveur Flask
          fetch(
            "http://localhost:5000/api/play-track?track=" +
              encodeURIComponent(args.track)
          )
            .then((response) => response.json())
            .then((data) => {
              const finalResult = {
                success: data.success,
                message: data.message,
              };
              this.terminal.showInTerminal("jouer_morceau", args, finalResult);
              return finalResult;
            })
            .catch((error) => {
              const errorResult = {
                success: false,
                message: `Erreur lors du chargement du morceau: ${error.message}`,
              };
              this.terminal.showInTerminal("jouer_morceau", args, errorResult);
              return errorResult;
            });

          return result;
        },
        description:
          "Joue un morceau dans l'application iTunes sur votre Mac. Actuellement uniquement disponible ces morceaux : 'Winter Sleep (Original Mix)' ou 'Party People' ou le nom de la track demandée expressément par l'utilisateur. Ne jamais retourner un json sans nom de morceau.",
        parameters: {
          track: {
            type: "string",
            description: "Le nom du morceau à jouer. ",
          },
        },
      },

      dessiner_images: {
        handler: (args) => {
          this.terminal.showInTerminal(
            "dessiner_images",
            args,
            "dessiner dans le canvas"
          );
          console.log("args.mots", args.mots);
          this.minifyManager.minimize();
          this.canvasFunctions.clear();
          args.mots.forEach((mot) => {
            this.canvasFunctions.addImage(mot + ".png");
          });
          return "Dessiné dans le canvas";
        },
        description:
          "Traite une réponse en utilisant strictement les mots du dictionnaire.",
        parameters: {
          mots: {
            type: "array",
            description:
              "Liste des mots du dictionnaire à utiliser dans la réponse.",
            items: {
              type: "string",
            },
          },
        },
      },

      ouvrir_youtube: {
        description:
          "Ouvre YouTube dans le navigateur Brave et recherche une vidéo spécifique.",
        parameters: {
          query: {
            type: "string",
            description:
              "Le terme de recherche pour trouver une vidéo sur YouTube.",
          },
        },
        handler: (args) => {
          // Récupérer le terme de recherche
          const query = args.query;

          // Appeler l'API Flask pour ouvrir YouTube dans Brave
          fetch(
            `http://localhost:5000/api/open-youtube?query=${encodeURIComponent(
              query
            )}`
          )
            .then((response) => response.json())
            .then((data) => {
              if (data.success) {
                this.terminal.showInTerminal(
                  "YouTube ouvert dans Brave avec la recherche",
                  args,
                  query
                );
              } else {
                this.terminal.showInTerminal(
                  "Erreur lors de l'ouverture de YouTube",
                  args,
                  data.message
                );
              }
            })
            .catch((error) => {
              this.terminal.showInTerminal(
                "Erreur de connexion au serveur ",
                args,
                error.message
              );
            });
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
