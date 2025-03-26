/**
 * Classe pour gérer le dictionnaire de mots autorisés.
 */
export class DictionaryManager {
  /**
   * Initialise le gestionnaire de dictionnaire.
   * 
   * @param {string[]} words - Liste des mots autorisés
   */
  constructor(words) {
    this.words = words;
  }

  /**
   * Génère le prompt système qui explique les contraintes du dictionnaire.
   * 
   * @returns {string} - Le prompt système
   */
  getSystemPrompt() {
    const wordsStr = this.words.join(", ");
    
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
}
