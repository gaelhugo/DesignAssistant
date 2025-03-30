/**
 * Version of MediaInputManager that crops images to a square (1:1 ratio)
 * and resizes them to 256x256 pixels.
 */
export class SquareMediaInputManager {
  constructor(chatInterface) {
    this.chatInterface = chatInterface;
    this.currentMediaData = null;
    this.mediaType = null;
    this.mediaButton = this.createMediaButton();
    this.mediaPreviewContainer = null;
  }

  createMediaButton() {
    const mediaButton = document.createElement("button");
    mediaButton.className = "media-input-button";
    mediaButton.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24">
        <path d="M440-440ZM120-120q-33 0-56.5-23.5T40-200v-480q0-33 23.5-56.5T120-760h480q33 0 56.5 23.5T680-680v180l160-160v440L680-380v180q0 33-23.5 56.5T600-120H120Zm0-80h480v-480H120v480Zm0 0v-480 480Z"/>
      </svg>
      <div class="media-options">
        <button class="media-option" data-type="upload">
          <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24">
            <path d="M440-440ZM200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h560q33 0 56.5 23.5T840-760v560q0 33-23.5 56.5T760-120H200Zm0-80h560v-560H200v560Zm40-80h480L560-480 440-320l-80-120-120 160Zm-40 80v-560 560Z"/>
          </svg>
          Upload Image
        </button>
        <button class="media-option" data-type="screen">
          <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24">
            <path d="M440-440ZM120-120q-33 0-56.5-23.5T40-200v-480q0-33 23.5-56.5T120-760h720q33 0 56.5 23.5T920-680v480q0 33-23.5 56.5T840-120H120Zm0-80h720v-480H120v480Zm0 0v-480 480Z"/>
          </svg>
          Share Screen
        </button>
        <button class="media-option" data-type="webcam">
          <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24">
            <path d="M440-440ZM120-120q-33 0-56.5-23.5T40-200v-480q0-33 23.5-56.5T120-760h480q33 0 56.5 23.5T680-680v180l160-160v440L680-380v180q0 33-23.5 56.5T600-120H120Zm0-80h480v-480H120v480Zm0 0v-480 480Z"/>
          </svg>
          Use Webcam
        </button>
      </div>
    `;

    if (this.chatInterface.USE_MEDIA === false) {
      mediaButton.style.opacity = "0.3";
      mediaButton.style.cursor = "not-allowed";
      mediaButton.style.pointerEvents = "none";
    } else {
      this.setupEventListeners(mediaButton);
    }
    return mediaButton;
  }

  setupEventListeners(mediaButton) {
    // Handle media option selection
    mediaButton.querySelectorAll(".media-option").forEach((option) => {
      option.addEventListener("click", async (e) => {
        const type = e.currentTarget.dataset.type;
        await this.handleMediaSelection(type);
      });
    });

    // Show/hide options on button click
    mediaButton.addEventListener("click", () => {
      const options = mediaButton.querySelector(".media-options");
      options.classList.toggle("show");
    });

    // Hide options when clicking outside
    document.addEventListener("click", (e) => {
      if (!mediaButton.contains(e.target)) {
        mediaButton.querySelector(".media-options").classList.remove("show");
      }
    });
  }

  async handleMediaSelection(type) {
    this.currentMediaData = null;

    switch (type) {
      case "upload":
        await this.handleImageUpload();
        break;
      case "screen":
        await this.handleScreenShare();
        break;
      case "webcam":
        await this.handleWebcam();
        break;
    }
  }

  async resizeAndCropImage(dataUrl) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        // Set target dimensions
        const targetSize = 256;
        canvas.width = targetSize;
        canvas.height = targetSize;

        // Calculate crop dimensions
        let sourceX = 0;
        let sourceY = 0;
        let sourceWidth = img.width;
        let sourceHeight = img.height;

        if (sourceWidth > sourceHeight) {
          // Landscape image
          sourceX = (sourceWidth - sourceHeight) / 2;
          sourceWidth = sourceHeight;
        } else if (sourceHeight > sourceWidth) {
          // Portrait image
          sourceY = (sourceHeight - sourceWidth) / 2;
          sourceHeight = sourceWidth;
        }

        // Draw cropped and resized image
        ctx.drawImage(
          img,
          sourceX,
          sourceY,
          sourceWidth,
          sourceHeight,
          0,
          0,
          targetSize,
          targetSize
        );

        resolve(canvas.toDataURL("image/jpeg", 0.9));
      };
      img.src = dataUrl;
    });
  }

  async handleImageUpload() {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";

    input.onchange = async () => {
      const file = input.files[0];
      if (file) {
        const originalData = await this.fileToBase64(file);
        this.currentMediaData = await this.resizeAndCropImage(originalData);
        this.notifyMediaReady();
      }
    };

    input.click();
  }

  async handleScreenShare() {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
      });
      const track = stream.getVideoTracks()[0];

      const imageCapture = new ImageCapture(track);
      const bitmap = await imageCapture.grabFrame();

      const canvas = document.createElement("canvas");
      canvas.width = bitmap.width;
      canvas.height = bitmap.height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(bitmap, 0, 0);

      const originalData = canvas.toDataURL("image/jpeg", 1.0);
      this.currentMediaData = await this.resizeAndCropImage(originalData);
      this.notifyMediaReady();

      track.stop();
    } catch (error) {
      console.error("Error capturing screen:", error);
    }
  }

  async handleWebcam() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });

      // Create video element to properly initialize the stream
      const video = document.createElement("video");
      video.srcObject = stream;
      video.play();

      // Wait for video to be ready
      await new Promise((resolve) => {
        video.addEventListener("loadeddata", resolve);
      });

      // Give a small additional delay to ensure frame is ready
      await new Promise((resolve) => setTimeout(resolve, 100));

      const track = stream.getVideoTracks()[0];
      const imageCapture = new ImageCapture(track);
      const bitmap = await imageCapture.grabFrame();

      const canvas = document.createElement("canvas");
      canvas.width = bitmap.width;
      canvas.height = bitmap.height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(bitmap, 0, 0);

      const originalData = canvas.toDataURL("image/jpeg", 1.0);
      this.currentMediaData = await this.resizeAndCropImage(originalData);
      this.notifyMediaReady();

      // Clean up
      video.pause();
      video.srcObject = null;
      track.stop();
    } catch (error) {
      console.error("Error accessing webcam:", error);
    }
  }

  async fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  createPreviewElement() {
    // Create container
    this.mediaPreviewContainer = document.createElement("div");
    this.mediaPreviewContainer.className = "media-preview-container";

    // Create preview image
    const preview = document.createElement("img");
    preview.className = "media-preview";
    preview.src = this.currentMediaData;

    // Create remove button
    const removeButton = document.createElement("button");
    removeButton.className = "media-preview-remove";
    removeButton.innerHTML = "×";
    removeButton.onclick = (e) => {
      e.stopPropagation();
      this.clearCurrentMedia();
    };

    this.mediaPreviewContainer.appendChild(preview);
    this.mediaPreviewContainer.appendChild(removeButton);

    // Insert after media button
    this.mediaButton.parentNode.insertBefore(
      this.mediaPreviewContainer,
      this.mediaButton.nextSibling
    );
  }

  notifyMediaReady() {
    if (this.currentMediaData) {
      this.mediaButton.classList.add("has-media");
      this.createPreviewElement();
      this.chatInterface.onMediaCaptured(this.currentMediaData);
    }
  }

  clearCurrentMedia() {
    this.currentMediaData = null;
    this.mediaType = null;
    this.mediaButton.classList.remove("has-media");
    if (this.mediaPreviewContainer) {
      this.mediaPreviewContainer.remove();
      this.mediaPreviewContainer = null;
    }
  }

  getMediaButton() {
    return this.mediaButton;
  }

  getCurrentMediaData() {
    return this.currentMediaData;
  }
}
