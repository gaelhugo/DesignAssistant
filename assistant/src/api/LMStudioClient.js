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
   */
  constructor(
    url = "http://localhost:1234/v1/chat/completions",
    model = "gemma-3-27b-it"
  ) {
    // Stockage des paramètres
    this.url = url; // URL de l'API
    this.model = model; // Nom du modèle
    this.temperature = 0.7;
    this.maxTokens = -1;
    this.stream = false;
  }

  /**
   * Envoie un message avec une image à l'API LMStudio et récupère la réponse.
   *
   * @param {string} systemPrompt - Le prompt système qui définit le comportement du modèle
   * @param {string} userMessage - Le message de l'utilisateur
   * @param {string} base64Image - L'image en base64
   * @returns {Promise<string>} - La réponse du modèle
   * @throws {Error} - Si la requête échoue
   */
  async sendMessageWithImage(systemPrompt, userMessage, base64Image) {
    try {
      // Format the image data
      const formattedImageData = base64Image.startsWith("data:image/")
        ? base64Image
        : `data:image/jpeg;base64,${base64Image.replace(
            /^data:image\/jpeg;base64,/,
            ""
          )}`;

      // Prepare the API payload
      // content: `Quelle serait la meilleure réponse possible pour définir cette image en n'utilisant uniquement une combinaison de mots du dictionnaire suivant : ${systemPrompt} ? Pas d'introduction. Pas conclusion. Just la liste de mots au format json.`,
      const payload = {
        model: this.model,
        messages: [
          {
            role: "system",
            content: systemPrompt,
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: userMessage,
              },
              {
                type: "image_url",
                image_url: { url: formattedImageData },
              },
            ],
          },
        ],
        temperature: this.temperature,
        max_tokens: this.maxTokens,
        stream: this.stream,
      };

      console.log(payload);

      // Send request to the API
      const response = await fetch(this.url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      // Check HTTP response
      if (!response.ok) {
        throw new Error(
          `Erreur API: ${response.status} ${response.statusText}`
        );
      }

      // Process JSON response
      const data = await response.json();

      // Extract message content from response
      if (data.choices && data.choices.length > 0) {
        const choice = data.choices[0];
        if (choice.message && choice.message.content) {
          return choice.message.content;
        }
      }

      throw new Error("Format de réponse invalide");
    } catch (error) {
      console.error("Erreur lors de l'envoi du message avec image:", error);
      throw new Error(
        `Erreur de communication avec LMStudio: ${error.message}`
      );
    }
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

      // Préparation du corps de la requête
      const payload = {
        model: this.model,
        messages: messages,
        temperature: this.temperature,
        max_tokens: this.maxTokens,
        stream: this.stream,
      };

      // Envoi de la requête à l'API
      const response = await fetch(this.url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      // Vérification de la réponse HTTP
      if (!response.ok) {
        throw new Error(
          `Erreur API: ${response.status} ${response.statusText}`
        );
      }

      // Check HTTP response
      if (!response.ok) {
        throw new Error(
          `Erreur API: ${response.status} ${response.statusText}`
        );
      }

      // Process JSON response
      const data = await response.json();

      // Extract message content from response
      if (data.choices && data.choices.length > 0) {
        const choice = data.choices[0];
        if (choice.message && choice.message.content) {
          return choice.message.content;
        }
      }

      throw new Error("Format de réponse invalide");
    } catch (error) {
      // Capture et relance l'erreur avec un message plus clair
      console.error("Erreur lors de l'envoi du message:", error);
      throw new Error(
        `Erreur de communication avec LMStudio: ${error.message}`
      );
    }
  }
}
