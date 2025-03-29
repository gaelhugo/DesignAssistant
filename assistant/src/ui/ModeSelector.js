/**
 * Gestionnaire de sélection de mode (JSON vs Standard).
 * Permet de basculer entre le mode JSON et le mode standard.
 */
export class ModeSelector {
  /**
   * Initialise le sélecteur de mode.
   * 
   * @param {boolean} initialValue - La valeur initiale du mode
   * @param {Object} dictManager - Le gestionnaire de dictionnaire
   * @param {Object} functionHandler - Le gestionnaire de fonctions
   */
  constructor(initialValue, dictManager, functionHandler) {
    this.initialValue = initialValue;
    this.dictManager = dictManager;
    this.functionHandler = functionHandler;
    this.modeSelectorContainer = document.querySelector('.mode-selector');
    
    // Initialiser le sélecteur de mode
    this.initialize();
  }

  /**
   * Initialise le sélecteur de mode avec les éléments d'interface.
   */
  initialize() {
    if (!this.modeSelectorContainer) return;
    
    // Créer les éléments du sélecteur
    const label = document.createElement('label');
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = this.initialValue;
    
    const span = document.createElement('span');
    span.textContent = this.initialValue ? 'Mode JSON' : 'Mode Standard';
    
    // Assembler les éléments
    label.appendChild(checkbox);
    label.appendChild(span);
    this.modeSelectorContainer.appendChild(label);
    
    // Ajouter l'écouteur d'événement pour le changement de mode
    checkbox.addEventListener('change', (event) => {
      const useJsonMode = event.target.checked;
      span.textContent = useJsonMode ? 'Mode JSON' : 'Mode Standard';
      
      // Sauvegarder la préférence
      localStorage.setItem('useJsonMode', useJsonMode);
      
      // Recharger la page pour appliquer le changement
      window.location.reload();
    });
  }
}
