/**
 * Manages drag and drop functionality for text files in the dictionary display area
 */
export class DragAndDropManager {
  constructor(targetElement, dictManager) {
    this.targetElement = targetElement;
    this.dictManager = dictManager;
    this.setupDragAndDrop();
    this.addDragAndDropStyling();
  }

  setupDragAndDrop() {
    ["dragenter", "dragover", "dragleave", "drop"].forEach((eventName) => {
      this.targetElement.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
      });
    });

    this.targetElement.addEventListener("dragenter", () => this.highlight());
    this.targetElement.addEventListener("dragover", () => this.highlight());
    this.targetElement.addEventListener("dragleave", () => this.unhighlight());
    this.targetElement.addEventListener("drop", (e) => this.handleDrop(e));
  }

  addDragAndDropStyling() {
    // Add drag and drop indicator text
    const dropText = document.createElement("div");
    dropText.className = "drop-text";
    dropText.textContent = "Glissez et déposez vos fichiers texte ici";
    dropText.style.display = "none";
    this.targetElement.appendChild(dropText);
    this.dropText = dropText;
    // Add styles to the existing CSS
    const style = document.createElement("style");
    style.textContent = `
      .dictionary-display.drag-active {
        border: 2px dashed #666;
        background-color: rgba(0, 0, 0, 0.1);
      }
      .dictionary-display .drop-text {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        font-size: 14px;
        color: #666;
        pointer-events: none;
      }
    `;
    document.head.appendChild(style);
  }

  highlight() {
    this.targetElement.classList.add("drag-active");
    this.dropText.style.display = "block";
  }

  unhighlight() {
    this.targetElement.classList.remove("drag-active");
    this.dropText.style.display = "none";
  }

  async handleDrop(e) {
    this.unhighlight();
    const files = Array.from(e.dataTransfer.files);

    for (const file of files) {
      // Check if file is a text file
      if (this.isTextFile(file)) {
        try {
          const text = await this.readFile(file);
          this.displayText(text);
          this.dictManager.setWords(
            text.split("\n").map((word) => word.trim())
          );
        } catch (error) {
          console.error("Error reading file:", error);
        }
      }
    }
  }

  isTextFile(file) {
    const textTypes = [
      "text/plain",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/markdown",
      "text/html",
      "text/csv",
    ];
    return textTypes.includes(file.type) || file.name.endsWith(".txt");
  }

  readFile(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = (e) => reject(e);
      reader.readAsText(file);
    });
  }

  displayText(text) {
    // Preserve existing content
    const existingContent = this.targetElement.innerHTML;

    // Create a new div for the file content
    const contentDiv = document.createElement("div");
    contentDiv.className = "dictionary-content";
    // add , instead of \n
    contentDiv.textContent = text.replace(/\n/g, ", ");

    // Clear the target element while preserving the drop text
    this.targetElement.innerHTML = "";
    this.targetElement.appendChild(this.dropText);
    this.targetElement.appendChild(contentDiv);
  }
}
