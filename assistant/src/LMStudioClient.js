/**
 * Classe pour gérer les communications avec l'API LMStudio.
 */
export class LMStudioClient {
  /**
   * Initialise le client LMStudio.
   * 
   * @param {string} url - L'URL de l'API LMStudio
   * @param {string} model - Le nom du modèle à utiliser
   */
  constructor(url, model) {
    this.url = url;
    this.model = model;
    this.temperature = 0.7;
    this.maxTokens = -1;
    this.stream = false;
  }

  /**
   * Envoie un message à LMStudio et retourne la réponse.
   * 
   * @param {string} systemPrompt - Le prompt système pour définir le comportement du modèle
   * @param {string} userMessage - Le message de l'utilisateur
   * @returns {Promise<string>} - La réponse du modèle
   */
  async sendMessage(systemPrompt, userMessage) {
    try {
      const payload = {
        model: this.model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage }
        ],
        temperature: this.temperature,
        max_tokens: this.maxTokens,
        stream: this.stream
      };

      const response = await fetch(this.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const result = await response.json();
      return result.choices[0].message.content;
    } catch (error) {
      console.error('Erreur lors de la communication avec LMStudio:', error);
      return `Erreur: ${error.message}`;
    }
  }
}
