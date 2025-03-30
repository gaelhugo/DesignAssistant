/**
 * Gestionnaire de dictionnaire de mots.
 * Cette classe gère la liste des mots autorisés pour l'application
 * et génère le prompt système pour le modèle d'IA.
 */
export class DictionaryManager {
  /**
   * Initialise le gestionnaire de dictionnaire.
   *
   * @param {Array<string>} allowedWords - Liste des mots autorisés
   */
  constructor(allowedWords = []) {
    // Liste des mots autorisés pour l'application
    this.allowedWords = allowedWords;
  }

  /**
   * Génère le prompt système qui explique les contraintes du dictionnaire.
   *
   * @returns {string} - Le prompt système
   */
  getSystemPrompt() {
    // Construire le prompt avec les instructions et la liste des mots
    const wordsStr = this.allowedWords.join(", ");

    const prompt = `Tu dois répondre STRICTEMENT en utilisant UNIQUEMENT les mots du dictionnaire suivant:
${wordsStr}

RÈGLES IMPORTANTES:
1. Tu ne peux utiliser QUE les mots de ce dictionnaire, sans AUCUNE exception.
2. Tu peux utiliser les mots plusieurs fois si nécessaire.
3. Tu dois choisir les mots qui répondent le plus précisément à la question.
4. N'utilise pas de ponctuation entre les mots.
5. N'ajoute pas d'explications ou de commentaires.
6. Réponds de manière concise.

Exemple de réponse correcte: "Arbre Forêt Vent Feuille"`;

    return prompt;
  }

  /**
   * Récupère la liste des mots du dictionnaire.
   *
   * @returns {Array<string>} - Liste des mots du dictionnaire
   */
  getWords() {
    return [...this.allowedWords]; // Retourne une copie de la liste
  }

  /**
   * Formate la liste des mots pour l'affichage.
   * Les mots sont séparés par des virgules.
   *
   * @returns {string} - Chaîne formatée des mots du dictionnaire
   */
  getFormattedWordList() {
    return this.allowedWords.join(", ");
  }

  /**
   * Met à jour la liste des mots du dictionnaire.
   *
   * @param {Array<string>} words - Liste des mots autorisés
   */
  setWords(words) {
    this.allowedWords = words;
  }
}
