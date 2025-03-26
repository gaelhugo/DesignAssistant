/**
 * Classe pour gérer les appels de fonctions basés sur les réponses JSON.
 * Cette classe permet d'enregistrer des fonctions et de les exécuter en fonction
 * des réponses JSON reçues.
 */
export class FunctionCallHandler {
  /**
   * Initialise le gestionnaire d'appels de fonctions.
   * 
   * @param {Object} jsonDictManager - Instance de JsonDictionaryManager (optionnel)
   */
  constructor(jsonDictManager = null) {
    // Registre des fonctions disponibles
    this.functionRegistry = {};
    
    // Référence au gestionnaire de dictionnaire JSON
    this.jsonDictManager = jsonDictManager;
  }

  /**
   * Définit le gestionnaire de dictionnaire JSON.
   * 
   * @param {Object} jsonDictManager - Instance de JsonDictionaryManager
   */
  setJsonDictionaryManager(jsonDictManager) {
    this.jsonDictManager = jsonDictManager;
  }

  /**
   * Enregistre une fonction dans le registre.
   * 
   * @param {string} name - Nom de la fonction
   * @param {Function} fn - Fonction à exécuter
   * @param {string} description - Description de la fonction pour le modèle
   * @param {Object} parameters - Paramètres de la fonction avec leurs types et descriptions
   */
  registerFunction(name, fn, description = "", parameters = {}) {
    // Enregistrer la fonction dans le registre local
    this.functionRegistry[name] = fn;
    
    // Si un gestionnaire de dictionnaire JSON est disponible, y enregistrer également la fonction
    if (this.jsonDictManager) {
      // Ajouter la description et les paramètres pour l'API
      this.jsonDictManager.registerFunction(name, description, parameters);
    }
  }

  /**
   * Vérifie si une fonction est enregistrée.
   * 
   * @param {string} name - Nom de la fonction à vérifier
   * @returns {boolean} - True si la fonction existe, false sinon
   */
  hasFunction(name) {
    // Vérifier si la fonction est présente dans le registre
    return this.functionRegistry.hasOwnProperty(name);
  }

  /**
   * Traite une réponse JSON et exécute la fonction correspondante si elle existe.
   * 
   * @param {string} jsonResponse - Réponse JSON à traiter
   * @returns {Object} - Résultat de l'exécution de la fonction ou null si aucune fonction n'a été exécutée
   */
  processResponse(jsonResponse) {
    try {
      // Essayer de parser la réponse JSON
      const parsedResponse = typeof jsonResponse === 'string' 
        ? JSON.parse(jsonResponse) 
        : jsonResponse;
      
      // Vérifier si la réponse contient un nom de fonction
      if (parsedResponse && parsedResponse.name) {
        const functionName = parsedResponse.name;
        const args = parsedResponse.arguments || {};
        
        // Vérifier si la fonction existe dans le registre
        if (this.hasFunction(functionName)) {
          // Exécuter la fonction avec les arguments fournis
          return this.functionRegistry[functionName](args);
        }
      }
    } catch (error) {
      // Gérer les erreurs de parsing ou d'exécution
      console.error('Erreur lors du traitement de la réponse JSON:', error);
    }
    
    // Pas de fonction exécutée
    return null;
  }
}
