/**
 * Classe pour gérer le dictionnaire de mots autorisés avec réponses au format JSON.
 */
export class JsonDictionaryManager {
  /**
   * Initialise le gestionnaire de dictionnaire JSON.
   *
   * @param {string[]} words - Liste des mots autorisés
   */
  constructor(words) {
    this.words = words;
    this.registeredFunctions = [];
  }

  /**
   * Enregistre une nouvelle fonction disponible pour le modèle.
   *
   * @param {string} name - Nom de la fonction
   * @param {string} description - Description de la fonction
   * @param {Object} parameters - Paramètres de la fonction avec leurs types et descriptions
   */
  registerFunction(name, description, parameters) {
    // Vérifier si la fonction existe déjà
    const existingIndex = this.registeredFunctions.findIndex(
      (f) => f.name === name
    );

    if (existingIndex !== -1) {
      // Mettre à jour la fonction existante
      this.registeredFunctions[existingIndex] = {
        name,
        description,
        parameters,
      };
    } else {
      // Ajouter la nouvelle fonction
      this.registeredFunctions.push({ name, description, parameters });
    }
  }

  /**
   * Génère la documentation des fonctions disponibles pour le modèle.
   *
   * @returns {string} - Documentation des fonctions au format texte
   */
  generateFunctionDocs() {
    let docs = "Fonctions disponibles:\n\n";

    this.registeredFunctions.forEach((func, index) => {
      docs += `${index + 1}. ${func.name}\n`;
      docs += `   Description: ${func.description}\n`;
      docs += `   Paramètres:\n`;

      for (const [paramName, paramInfo] of Object.entries(func.parameters)) {
        const required = paramInfo.required ? " (obligatoire)" : " (optionnel)";
        docs += `   - ${paramName} (${paramInfo.type})${required}: ${paramInfo.description}\n`;
      }

      docs += "\n";
    });

    return docs;
  }

  /**
   * Génère des exemples de réponses pour les fonctions disponibles.
   *
   * @returns {string} - Exemples de réponses au format texte
   */
  generateExamples() {
    let examples = "Exemples de réponses correctes:\n\n";

    this.registeredFunctions.forEach((func) => {
      const example = this.generateExampleForFunction(func);
      examples += `Pour ${func.name}:\n${example}\n\n`;
    });

    return examples;
  }

  /**
   * Génère un exemple de réponse pour une fonction spécifique.
   *
   * @param {Object} func - Définition de la fonction
   * @returns {string} - Exemple de réponse JSON
   */
  generateExampleForFunction(func) {
    const args = {};

    for (const [paramName, paramInfo] of Object.entries(func.parameters)) {
      if (paramInfo.type === "array") {
        if (paramName === "mots") {
          // Exemple spécifique pour le paramètre "mots"
          args[paramName] = ["Arbre", "Forêt", "Vent", "Feuille"];
        } else {
          args[paramName] = ["exemple1", "exemple2"];
        }
      } else if (paramInfo.type === "string") {
        args[paramName] = "exemple de texte";
      } else if (paramInfo.type === "number") {
        args[paramName] = 42;
      } else if (paramInfo.type === "boolean") {
        args[paramName] = true;
      } else if (paramInfo.type === "object") {
        args[paramName] = { cle: "valeur" };
      }
    }

    const example = {
      name: func.name,
      arguments: args,
    };

    return JSON.stringify(example);
  }

  /**
   * Génère le prompt système qui explique les contraintes du dictionnaire
   * et le format JSON attendu.
   *
   * @returns {string} - Le prompt système
   */
  getSystemPrompt() {
    const wordsStr = this.words.join(", ");
    const functionDocs = this.generateFunctionDocs();
    const examples = this.generateExamples();

    const prompt = `Tu es un assistant utile avec la capacité de répondre avec des appels de fonction.
Tu dois répondre STRICTEMENT en utilisant UNIQUEMENT les mots du dictionnaire suivant:
${wordsStr}

Quand un utilisateur te pose une question, réponds avec un objet JSON qui appelle l'une des fonctions disponibles.

${functionDocs}
RÈGLES IMPORTANTES:
1. Tu ne peux utiliser QUE les mots de ce dictionnaire dans tes réponses, sans AUCUNE exception.
2. Tu peux utiliser les mots plusieurs fois si nécessaire.
3. Tu dois choisir les mots qui répondent le plus précisément à la question.
4. Réponds avec UNIQUEMENT l'objet JSON brut, sans aucun autre texte avant ou après.
5. Les mots dans le tableau doivent être dans un ordre logique pour former une réponse cohérente.
6. NE PAS mettre le JSON dans des blocs de code avec des backticks (\`\`\`).
7. NE PAS ajouter de formatage markdown.
8. Renvoie UNIQUEMENT le JSON pur.
9. Choisis la fonction la plus appropriée pour répondre à la demande de l'utilisateur.
10. Si une image est fournie, analyse-la et choisis la fonction la plus appropriée pour répondre à la demande de l'utilisateur.

${examples}`;

    return prompt;
  }

  /**
   * Récupère la liste des mots du dictionnaire.
   *
   * @returns {string[]} - Liste des mots du dictionnaire
   */
  getWords() {
    return this.words;
  }

  /**
   * Formate la liste des mots pour l'affichage.
   *
   * @returns {string} - Chaîne formatée des mots du dictionnaire
   */
  getFormattedWordList() {
    return this.words.join(", ");
  }

  /**
   * Met à jour la liste des mots du dictionnaire.
   *
   * @param {Array<string>} words - Liste des mots autorisés
   */
  setWords(words) {
    this.words = words;
  }
}
