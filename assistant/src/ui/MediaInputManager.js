/**
 * Manages media input (image upload, screen sharing, webcam) for the chat interface
 */
export class MediaInputManager {
  constructor(chatInterface) {
    this.chatInterface = chatInterface;
    this.currentMediaData = null;
    this.mediaType = null;
    this.createMediaButton();
  }

  createMediaButton() {
    const mediaButton = document.createElement('button');
    mediaButton.className = 'media-input-button';
    mediaButton.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24">
        <path d="M440-440ZM120-120q-33 0-56.5-23.5T40-200v-480q0-33 23.5-56.5T120-760h480q33 0 56.5 23.5T680-680v180l160-160v440L680-380v180q0 33-23.5 56.5T600-120H120Zm0-80h480v-480H120v480Zm0 0v-480 480Z"/>
      </svg>
      <div class="media-options">
        <button class="media-option" data-type="upload">
          <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24">
            <path d="M440-320v-326L336-542l-56-58 200-200 200 200-56 58-104-104v326h-80ZM240-160q-33 0-56.5-23.5T160-240v-120h80v120h480v-120h80v120q0 33-23.5 56.5T720-160H240Z"/>
          </svg>
          Upload Image
        </button>
        <button class="media-option" data-type="screen">
          <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24">
            <path d="M160-160q-33 0-56.5-23.5T80-240v-480q0-33 23.5-56.5T160-800h640q33 0 56.5 23.5T880-720v480q0 33-23.5 56.5T800-160H160Zm0-80h640v-480H160v480Zm0 0v-480 480Z"/>
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

    this.setupEventListeners(mediaButton);
    this.mediaButton = mediaButton;
  }

  setupEventListeners(mediaButton) {
    // Handle media option selection
    mediaButton.querySelectorAll('.media-option').forEach(option => {
      option.addEventListener('click', async (e) => {
        const type = e.currentTarget.dataset.type;
        await this.handleMediaSelection(type);
      });
    });

    // Show/hide options on button click
    mediaButton.addEventListener('click', () => {
      const options = mediaButton.querySelector('.media-options');
      options.classList.toggle('show');
    });

    // Hide options when clicking outside
    document.addEventListener('click', (e) => {
      if (!mediaButton.contains(e.target)) {
        mediaButton.querySelector('.media-options').classList.remove('show');
      }
    });
  }

  async handleMediaSelection(type) {
    this.mediaType = type;
    this.currentMediaData = null;

    switch (type) {
      case 'upload':
        await this.handleImageUpload();
        break;
      case 'screen':
        await this.handleScreenShare();
        break;
      case 'webcam':
        await this.handleWebcam();
        break;
    }
  }

  async resizeImage(dataUrl) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Calculate new height maintaining aspect ratio
        const ratio = img.height / img.width;
        const targetWidth = 512;
        const targetHeight = targetWidth * ratio;
        
        canvas.width = targetWidth;
        canvas.height = targetHeight;
        
        ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
        resolve(canvas.toDataURL('image/jpeg', 0.9));
      };
      img.src = dataUrl;
    });
  }

  async handleImageUpload() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    
    input.onchange = async () => {
      const file = input.files[0];
      if (file) {
        const originalData = await this.fileToBase64(file);
        this.currentMediaData = await this.resizeImage(originalData);
        this.notifyMediaReady();
      }
    };
    
    input.click();
  }

  async handleScreenShare() {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
      const track = stream.getVideoTracks()[0];
      
      const imageCapture = new ImageCapture(track);
      const bitmap = await imageCapture.grabFrame();
      
      const canvas = document.createElement('canvas');
      canvas.width = bitmap.width;
      canvas.height = bitmap.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(bitmap, 0, 0);
      
      const originalData = canvas.toDataURL('image/jpeg', 1.0);
      this.currentMediaData = await this.resizeImage(originalData);
      this.notifyMediaReady();
      
      track.stop();
    } catch (error) {
      console.error('Error capturing screen:', error);
    }
  }

  async handleWebcam() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      });
      
      // Create video element to properly initialize the stream
      const video = document.createElement('video');
      video.srcObject = stream;
      video.play();

      // Wait for video to be ready
      await new Promise(resolve => {
        video.addEventListener('loadeddata', resolve);
      });

      // Give a small additional delay to ensure frame is ready
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const track = stream.getVideoTracks()[0];
      const imageCapture = new ImageCapture(track);
      const bitmap = await imageCapture.grabFrame();
      
      const canvas = document.createElement('canvas');
      canvas.width = bitmap.width;
      canvas.height = bitmap.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(bitmap, 0, 0);
      
      const originalData = canvas.toDataURL('image/jpeg', 1.0);
      this.currentMediaData = await this.resizeImage(originalData);
      this.notifyMediaReady();
      
      // Clean up
      video.pause();
      video.srcObject = null;
      track.stop();
    } catch (error) {
      console.error('Error accessing webcam:', error);
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

  notifyMediaReady() {
    if (this.currentMediaData) {
      this.chatInterface.onMediaCaptured(this.currentMediaData);
    }
  }

  getMediaButton() {
    return this.mediaButton;
  }

  getCurrentMediaData() {
    return this.currentMediaData;
  }

  clearCurrentMedia() {
    this.currentMediaData = null;
    this.mediaType = null;
  }
}
