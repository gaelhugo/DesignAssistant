/**
 * Gestionnaire de sélection de thème.
 * Permet de changer entre les thèmes clair, sombre, bleu et vert.
 */
export class ThemeSelector {
  /**
   * Initialise le sélecteur de thème.
   */
  constructor() {
    this.themeButtons = document.querySelectorAll(".theme-button");
    this.availableThemes = ["theme-light", "dark-theme", "blue-theme", "green-theme"];
    
    // Initialiser le sélecteur de thème
    this.initialize();
  }

  /**
   * Initialise le sélecteur de thème avec les écouteurs d'événements.
   */
  initialize() {
    // Exposer la fonction de changement de thème globalement pour que FunctionRegistry puisse l'utiliser
    window.changeTheme = this.changeTheme.bind(this);
    
    // Ajouter les écouteurs d'événements pour chaque bouton
    this.themeButtons.forEach(button => {
      button.addEventListener("click", () => {
        const themeName = button.getAttribute("data-theme");
        this.changeTheme(themeName);
      });
    });
    
    // Charger le thème sauvegardé ou utiliser le thème par défaut
    const savedTheme = localStorage.getItem("theme") || "theme-light";
    this.changeTheme(savedTheme);
  }

  /**
   * Change le thème de l'application.
   * @param {string} themeName - Le thème à appliquer.
   */
  changeTheme(themeName) {
    // Supprimer toutes les classes de thème existantes
    document.body.classList.remove(...this.availableThemes);
    
    // Ajouter la nouvelle classe de thème
    document.body.classList.add(themeName);
    
    // Sauvegarder le thème dans le localStorage
    localStorage.setItem("theme", themeName);
    
    // Mettre à jour l'apparence des boutons
    this.themeButtons.forEach(button => {
      button.classList.toggle("active", button.getAttribute("data-theme") === themeName);
    });
  }
}
