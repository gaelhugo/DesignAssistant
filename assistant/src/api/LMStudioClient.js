/**
 * Client pour communiquer avec l'API LMStudio.
 * Cette classe gère les appels à l'API LMStudio pour envoyer des messages
 * et récupérer les réponses du modèle d'IA.
 */
export class LMStudioClient {
  /**
   * Initialise le client LMStudio.
   * 
   * @param {string} url - L'URL de l'API LMStudio (par défaut: http://localhost:1234/v1/chat/completions)
   * @param {string} model - Le nom du modèle à utiliser (par défaut: gemma-3-27b-it)
   * @param {Object} functionHandler - Le gestionnaire de fonctions (optionnel)
   */
  constructor(
    url = "http://localhost:1234/v1/chat/completions",
    model = "gemma-3-27b-it",
    functionHandler = null
  ) {
    // Stockage des paramètres
    this.url = url;               // URL de l'API
    this.model = model;           // Nom du modèle
    this.functionHandler = functionHandler; // Gestionnaire de fonctions
    this.temperature = 0.7;
    this.maxTokens = -1;
    this.stream = false;
  }

  /**
   * Envoie un message à l'API LMStudio et récupère la réponse.
   * 
   * @param {string} systemPrompt - Le prompt système qui définit le comportement du modèle
   * @param {string} userMessage - Le message de l'utilisateur
   * @returns {Promise<string>} - La réponse du modèle
   * @throws {Error} - Si la requête échoue
   */
  async sendMessage(systemPrompt, userMessage) {
    try {
      // Préparation des messages pour l'API
      const messages = [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: userMessage,
        },
      ];

      // Configuration des fonctions si un gestionnaire est disponible
      let functions = undefined;
      if (this.functionHandler) {
        functions = this.functionHandler.getFunctions();
      }

      // Préparation du corps de la requête
      const payload = {
        model: this.model,
        messages: messages,
        temperature: this.temperature,
        max_tokens: this.maxTokens,
        stream: this.stream,
      };

      // Ajout des fonctions au payload si disponibles
      if (functions) {
        payload.functions = functions;
        payload.function_call = "auto";
      }

      // Envoi de la requête à l'API
      const response = await fetch(this.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      // Vérification de la réponse HTTP
      if (!response.ok) {
        throw new Error(`Erreur API: ${response.status} ${response.statusText}`);
      }

      // Traitement de la réponse JSON
      const data = await response.json();
      
      // Extraction du contenu du message de la réponse
      if (data.choices && data.choices.length > 0) {
        const choice = data.choices[0];
        
        // Si la réponse contient un appel de fonction
        if (choice.message && choice.message.function_call) {
          // Retourner l'appel de fonction formaté en JSON
          return JSON.stringify(choice.message.function_call);
        } 
        // Sinon, retourner le contenu textuel du message
        else if (choice.message && choice.message.content) {
          return choice.message.content;
        }
      }
      
      // Si on ne trouve pas de contenu valide dans la réponse
      throw new Error("Format de réponse invalide");
      
    } catch (error) {
      // Capture et relance l'erreur avec un message plus clair
      console.error("Erreur lors de l'envoi du message:", error);
      throw new Error(`Erreur de communication avec LMStudio: ${error.message}`);
    }
  }
}
