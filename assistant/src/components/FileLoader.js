/**
 * Classe FileLoader responsable du chargement et de l'analyse du fichier lexical.txt
 */
export default class FileLoader {
  /**
   * Charge le contenu du fichier lexical.txt
   * @returns {Promise<string[]>} Tableau des noms de fichiers provenant de lexical.txt
   */
  static async loadLexicalFile() {
    try {
      const response = await fetch('/lexical.txt');
      const text = await response.text();
      // Divise le texte par lignes et filtre les lignes vides
      return text.split('\n').filter(line => line.trim() !== '');
    } catch (error) {
      console.error('Erreur lors du chargement du fichier lexical:', error);
      return [];
    }
  }
}
