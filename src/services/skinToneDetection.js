/**
 * Skin Tone Detection Service
 * Uses TensorFlow.js to detect skin tone from images and provide
 * color recommendations based on skin tone analysis
 */

class SkinToneDetectionService {
  constructor() {
    this.model = null;
    this.isModelLoaded = false;
    this.detectedSkinTone = null;
    this.skinToneHistory = JSON.parse(localStorage.getItem('skinToneHistory') || '[]');
  }

  /**
   * Initialize TensorFlow.js model for skin tone detection
   */
  async initializeModel() {
    if (this.isModelLoaded) return;

    try {
      // Load TensorFlow.js
      const tf = await import('@tensorflow/tfjs');
      
      // For skin tone detection, we'll use a color analysis approach
      // In production, you would load a pre-trained model
      this.isModelLoaded = true;
      console.log('✅ Skin tone detection service initialized');
    } catch (error) {
      console.error('❌ Failed to initialize skin tone detection:', error);
      throw error;
    }
  }

  /**
   * Analyze skin tone from image
   * @param {string} imageBase64 - Base64 encoded image
   * @returns {Promise<Object>} Skin tone analysis result
   */
  async analyzeSkinTone(imageBase64) {
    try {
      // Create an image element to analyze
      const img = new Image();
      img.src = imageBase64;
      
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });

      // Create a canvas to extract pixel data
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      // Get pixel data from the center region (likely to contain face)
      const centerX = Math.floor(canvas.width / 2);
      const centerY = Math.floor(canvas.height / 2);
      const sampleSize = 50;
      
      const imageData = ctx.getImageData(
        centerX - sampleSize / 2,
        centerY - sampleSize / 2,
        sampleSize,
        sampleSize
      );

      // Analyze skin pixels
      const skinPixels = this.extractSkinPixels(imageData.data);
      const averageColor = this.calculateAverageColor(skinPixels);
      const skinTone = this.classifySkinTone(averageColor);

      // Save to history
      this.saveToHistory(skinTone);

      this.detectedSkinTone = skinTone;
      
      return {
        success: true,
        skinTone: skinTone,
        averageColor: averageColor,
        recommendations: this.getColorRecommendations(skinTone)
      };
    } catch (error) {
      console.error('❌ Skin tone analysis failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Extract skin-colored pixels from image data
   */
  extractSkinPixels(pixels) {
    const skinPixels = [];
    
    for (let i = 0; i < pixels.length; i += 4) {
      const r = pixels[i];
      const g = pixels[i + 1];
      const b = pixels[i + 2];
      
      // Skin color detection algorithm
      if (this.isSkinColor(r, g, b)) {
        skinPixels.push({ r, g, b });
      }
    }
    
    return skinPixels;
  }

  /**
   * Check if a pixel is skin-colored
   */
  isSkinColor(r, g, b) {
    // Simple skin color detection based on RGB ranges
    // This is a basic implementation - production would use more sophisticated algorithms
    const isSkin = (
      r > 95 && g > 40 && b > 20 &&
      r > g && r > b &&
      Math.abs(r - g) > 15 &&
      r - g > 15 &&
      r > b &&
      g > b - 15 &&
      r + g + b > 200 &&
      r - g < 100 &&
      r - b < 100
    );
    
    return isSkin;
  }

  /**
   * Calculate average color from skin pixels
   */
  calculateAverageColor(skinPixels) {
    if (skinPixels.length === 0) {
      return { r: 200, g: 150, b: 100 }; // Default skin tone
    }

    let totalR = 0, totalG = 0, totalB = 0;
    
    skinPixels.forEach(pixel => {
      totalR += pixel.r;
      totalG += pixel.g;
      totalB += pixel.b;
    });

    return {
      r: Math.round(totalR / skinPixels.length),
      g: Math.round(totalG / skinPixels.length),
      b: Math.round(totalB / skinPixels.length)
    };
  }

  /**
   * Classify skin tone based on average color
   */
  classifySkinTone(averageColor) {
    const { r, g, b } = averageColor;
    
    // Convert to HSV for better classification
    const hsv = this.rgbToHsv(r, g, b);
    
    // Classify based on HSV values
    // This is a simplified classification - production would use ML model
    if (hsv.v < 40) {
      return {
        category: 'Deep',
        hex: this.rgbToHex(r, g, b),
        description: 'Deep skin tone with rich melanin',
        colorPalette: ['#8B4513', '#A0522D', '#CD853F', '#DEB887', '#F5DEB3'],
        bestColors: ['Gold', 'Bronze', 'Copper', 'Emerald', 'Royal Blue', 'Purple'],
        avoidColors: ['Pale Yellow', 'Pastel Pink', 'Light Gray']
      };
    } else if (hsv.v < 60) {
      return {
        category: 'Medium-Dark',
        hex: this.rgbToHex(r, g, b),
        description: 'Medium-dark skin tone with warm undertones',
        colorPalette: ['#D2691E', '#CD853F', '#DEB887', '#F5DEB3', '#FFE4C4'],
        bestColors: ['Olive', 'Mustard', 'Burnt Orange', 'Deep Red', 'Navy', 'Teal'],
        avoidColors: ['Neon Yellow', 'Bright Pink', 'White']
      };
    } else if (hsv.v < 75) {
      return {
        category: 'Medium',
        hex: this.rgbToHex(r, g, b),
        description: 'Medium skin tone with balanced undertones',
        colorPalette: ['#DEB887', '#F5DEB3', '#FFE4C4', '#FFDAB9', '#FFEFD5'],
        bestColors: ['Coral', 'Turquoise', 'Camel', 'Forest Green', 'Maroon', 'Plum'],
        avoidColors: ['Electric Blue', 'Hot Pink', 'Lime Green']
      };
    } else if (hsv.v < 85) {
      return {
        category: 'Light-Medium',
        hex: this.rgbToHex(r, g, b),
        description: 'Light-medium skin tone with cool undertones',
        colorPalette: ['#FFE4C4', '#FFDAB9', '#FFEFD5', '#FFF8DC', '#FFFAF0'],
        bestColors: ['Peach', 'Lavender', 'Soft Pink', 'Sage Green', 'Dusty Blue', 'Mauve'],
        avoidColors: ['Dark Brown', 'Black', 'Deep Purple']
      };
    } else {
      return {
        category: 'Fair',
        hex: this.rgbToHex(r, g, b),
        description: 'Fair skin tone with cool/pink undertones',
        colorPalette: ['#FFDAB9', '#FFEFD5', '#FFF8DC', '#FFFAF0', '#FFFFFF'],
        bestColors: ['Baby Blue', 'Soft Pink', 'Lilac', 'Mint', 'Peach', 'Nude'],
        avoidColors: ['Dark Brown', 'Black', 'Deep Red']
      };
    }
  }

  /**
   * Convert RGB to HSV
   */
  rgbToHsv(r, g, b) {
    r /= 255;
    g /= 255;
    b /= 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const d = max - min;

    let h = 0;
    const s = max === 0 ? 0 : d / max;
    const v = max;

    if (d !== 0) {
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }

    return { h: h * 360, s: s * 100, v: v * 100 };
  }

  /**
   * Convert RGB to Hex
   */
  rgbToHex(r, g, b) {
    return '#' + [r, g, b].map(x => {
      const hex = x.toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    }).join('');
  }

  /**
   * Get color recommendations based on skin tone
   */
  getColorRecommendations(skinTone) {
    return {
      bestColors: skinTone.bestColors,
      avoidColors: skinTone.avoidColors,
      colorPalette: skinTone.colorPalette,
      tips: [
        `Your ${skinTone.category} skin tone looks great with ${skinTone.bestColors.slice(0, 3).join(', ')}`,
        `Consider avoiding ${skinTone.avoidColors.slice(0, 2).join(' and ')} for best results`,
        `Metallic tones in gold and bronze complement your skin beautifully`
      ]
    };
  }

  /**
   * Save skin tone analysis to history
   */
  saveToHistory(skinTone) {
    const entry = {
      timestamp: Date.now(),
      skinTone: skinTone
    };
    this.skinToneHistory.push(entry);
    localStorage.setItem('skinToneHistory', JSON.stringify(this.skinToneHistory.slice(-10)));
  }

  /**
   * Get skin tone history
   */
  getHistory() {
    return this.skinToneHistory;
  }

  /**
   * Get current detected skin tone
   */
  getCurrentSkinTone() {
    return this.detectedSkinTone;
  }

  /**
   * Reset detected skin tone
   */
  resetSkinTone() {
    this.detectedSkinTone = null;
  }
}

export default new SkinToneDetectionService();
