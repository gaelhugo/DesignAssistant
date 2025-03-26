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
  }

  /**
   * Génère le prompt système qui explique les contraintes du dictionnaire
   * et le format JSON attendu.
   * 
   * @returns {string} - Le prompt système
   */
  getSystemPrompt() {
    const wordsStr = this.words.join(", ");
    
    const prompt = `Tu es un assistant utile avec la capacité de répondre avec des appels de fonction.
Tu dois répondre STRICTEMENT en utilisant UNIQUEMENT les mots du dictionnaire suivant:
${wordsStr}

Quand un utilisateur te pose une question, réponds UNIQUEMENT avec un objet JSON au format suivant:

{
  "name": "reponse_dictionnaire",
  "arguments": {
    "mots": ["mot1", "mot2", "mot3"]
  }
}

RÈGLES IMPORTANTES:
1. Tu ne peux utiliser QUE les mots de ce dictionnaire dans le tableau "mots", sans AUCUNE exception.
2. Tu peux utiliser les mots plusieurs fois si nécessaire.
3. Tu dois choisir les mots qui répondent le plus précisément à la question.
4. Réponds avec UNIQUEMENT l'objet JSON, sans aucun autre texte avant ou après.
5. Les mots dans le tableau doivent être dans un ordre logique pour former une réponse cohérente.

Exemple de réponse correcte:
{
  "name": "reponse_dictionnaire",
  "arguments": {
    "mots": ["Arbre", "Forêt", "Vent", "Feuille"]
  }
}`;

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
