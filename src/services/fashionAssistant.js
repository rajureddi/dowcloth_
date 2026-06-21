/**
 * AI Fashion Assistant Service
 * Provides outfit suggestions, color recommendations, product Q&A,
 * voice input support, multilingual support, and personalized recommendations
 */

import { PRODUCTS } from '../data/products';
import skinToneDetectionService from './skinToneDetection';

class FashionAssistantService {
  constructor() {
    this.userHistory = JSON.parse(localStorage.getItem('userHistory') || '[]');
    this.userPreferences = JSON.parse(localStorage.getItem('userPreferences') || '{}');
    this.currentLanguage = localStorage.getItem('language') || 'en';
  }

  /**
   * Save user interaction to history
   */
  saveToHistory(action, product, context = {}) {
    const entry = {
      timestamp: Date.now(),
      action,
      product: product ? { id: product.id, name: product.name, category: product.category } : null,
      context
    };
    this.userHistory.push(entry);
    localStorage.setItem('userHistory', JSON.stringify(this.userHistory.slice(-100))); // Keep last 100
  }

  /**
   * Get personalized recommendations based on user history
   */
  getPersonalizedRecommendations() {
    const categoryCounts = {};
    const colorCounts = {};

    this.userHistory.forEach(entry => {
      if (entry.product) {
        categoryCounts[entry.product.category] = (categoryCounts[entry.product.category] || 0) + 1;
      }
    });

    const preferredCategories = Object.entries(categoryCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([cat]) => cat);

    return PRODUCTS.filter(p => preferredCategories.includes(p.category))
      .sort(() => Math.random() - 0.5)
      .slice(0, 8);
  }

  /**
   * Suggest outfits based on user preference
   */
  suggestOutfits(preference) {
    const { category, style, occasion, color } = preference;

    let filtered = PRODUCTS;

    if (category && category !== 'all') {
      filtered = filtered.filter(p => p.category.toLowerCase() === category.toLowerCase());
    }

    if (color && color !== 'any') {
      filtered = filtered.filter(p => 
        p.colors.some(c => c.toLowerCase().includes(color.toLowerCase()))
      );
    }

    if (style) {
      const styleMap = {
        casual: ['casual', 'comfort', 'trending'],
        formal: ['formal', 'office', 'classic'],
        ethnic: ['ethnic', 'festive', 'traditional'],
        street: ['urban', 'streetstyle', 'trending']
      };
      const tags = styleMap[style.toLowerCase()] || [];
      filtered = filtered.filter(p => p.tags && p.tags.some(tag => tags.includes(tag)));
    }

    return filtered.slice(0, 12);
  }

  /**
   * Recommend matching colors for a product
   */
  recommendMatchingColors(product) {
    const colorHarmony = {
      'Red': ['Black', 'White', 'Gray', 'Navy'],
      'Blue': ['White', 'Gray', 'Beige', 'Navy'],
      'Green': ['White', 'Beige', 'Brown', 'Black'],
      'Yellow': ['Black', 'Gray', 'Navy', 'White'],
      'Black': ['White', 'Gray', 'Red', 'Blue'],
      'White': ['Black', 'Navy', 'Gray', 'Red'],
      'Pink': ['Black', 'White', 'Gray', 'Navy'],
      'Purple': ['Black', 'White', 'Gray', 'Pink']
    };

    const productColor = product.colors[0] || 'Black';
    const matchingColors = colorHarmony[productColor] || ['Black', 'White', 'Gray'];

    return PRODUCTS.filter(p => 
      p.colors.some(c => matchingColors.includes(c)) && p.id !== product.id
    ).slice(0, 6);
  }

  /**
   * Answer product questions using NLP-like pattern matching
   */
  answerProductQuestion(question, product) {
    const q = question.toLowerCase();
    const responses = {
      size: `This ${product.name} is available in sizes: ${product.sizes.join(', ')}.`,
      price: `The ${product.name} is priced at ₹${product.price.toLocaleString()}. It was originally ₹${product.originalPrice.toLocaleString()} (${product.discount}% off!).`,
      delivery: `⚡ ${product.name} delivers in just ${product.deliveryTime}!`,
      material: `${product.name} is crafted with premium materials for ultimate comfort and style.`,
      return: 'We offer FREE RETURNS within 7 days of delivery.',
      wash: 'We recommend gentle machine wash or dry clean for best results.',
      stock: 'This item is currently in stock and ready for instant delivery!',
      brand: `${product.name} is from ${product.brand}, known for quality and style.`,
      rating: `${product.name} has a ${product.rating}⭐ rating from ${product.reviews} happy customers.`,
      default: `I'd be happy to help with ${product.name}! You can ask about size, price, delivery, material, returns, wash care, stock, brand, or rating.`
    };

    if (q.includes('size') || q.includes('fit')) return responses.size;
    if (q.includes('price') || q.includes('cost') || q.includes('expensive')) return responses.price;
    if (q.includes('delivery') || q.includes('deliver') || q.includes('ship')) return responses.delivery;
    if (q.includes('material') || q.includes('fabric') || q.includes('made of')) return responses.material;
    if (q.includes('return') || q.includes('exchange')) return responses.return;
    if (q.includes('wash') || q.includes('care')) return responses.wash;
    if (q.includes('stock') || q.includes('available')) return responses.stock;
    if (q.includes('brand') || q.includes('company')) return responses.brand;
    if (q.includes('rating') || q.includes('review') || q.includes('stars')) return responses.rating;

    return responses.default;
  }

  /**
   * Multilingual support - translate responses
   */
  translate(text, targetLanguage) {
    const translations = {
      en: text,
      hi: this.translateToHindi(text),
      es: this.translateToSpanish(text),
      fr: this.translateToFrench(text)
    };
    return translations[targetLanguage] || text;
  }

  translateToHindi(text) {
    // Simplified Hindi translation (in production, use proper translation API)
    const dictionary = {
      'Hello': 'नमस्ते',
      'Welcome': 'स्वागत है',
      'How can I help you?': 'मैं आपकी कैसे मदद कर सकता हूं?',
      'This product is available in sizes:': 'यह उत्पाद इन साइज़ में उपलब्ध है:',
      'The price is': 'कीमत है',
      'Free delivery in': 'मुफ्त डिलीवरी में',
      'out of 5 stars': '5 में से स्टार्स'
    };
    
    let translated = text;
    Object.entries(dictionary).forEach(([en, hi]) => {
      translated = translated.replace(new RegExp(en, 'g'), hi);
    });
    return translated;
  }

  translateToSpanish(text) {
    const dictionary = {
      'Hello': 'Hola',
      'Welcome': 'Bienvenido',
      'How can I help you?': '¿Cómo puedo ayudarte?',
      'This product is available in sizes:': 'Este producto está disponible en tallas:',
      'The price is': 'El precio es',
      'Free delivery in': 'Entrega gratis en',
      'out of 5 stars': 'de 5 estrellas'
    };
    
    let translated = text;
    Object.entries(dictionary).forEach(([en, es]) => {
      translated = translated.replace(new RegExp(en, 'g'), es);
    });
    return translated;
  }

  translateToFrench(text) {
    const dictionary = {
      'Hello': 'Bonjour',
      'Welcome': 'Bienvenue',
      'How can I help you?': 'Comment puis-je vous aider?',
      'This product is available in sizes:': 'Ce produit est disponible en tailles:',
      'The price is': 'Le prix est',
      'Free delivery in': 'Livraison gratuite en',
      'out of 5 stars': 'sur 5 étoiles'
    };
    
    let translated = text;
    Object.entries(dictionary).forEach(([en, fr]) => {
      translated = translated.replace(new RegExp(en, 'g'), fr);
    });
    return translated;
  }

  /**
   * Process voice input (simulated - would use Web Speech API in production)
   */
  async processVoiceInput() {
    return new Promise((resolve, reject) => {
      if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        reject(new Error('Speech recognition not supported'));
        return;
      }

      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.lang = this.currentLanguage === 'hi' ? 'hi-IN' : 
                        this.currentLanguage === 'es' ? 'es-ES' : 
                        this.currentLanguage === 'fr' ? 'fr-FR' : 'en-US';
      
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        resolve(transcript);
      };

      recognition.onerror = (event) => {
        reject(event.error);
      };

      recognition.start();
    });
  }

  /**
   * Get smart response based on user query
   */
  async getSmartResponse(query, context = {}) {
    const q = query.toLowerCase();
    const { product } = context;

    // Greetings
    if (q.match(/^(hello|hi|hey|namaste)/)) {
      return this.translate('Hello! 👋 I\'m your AI Fashion Assistant. How can I help you today?', this.currentLanguage);
    }

    // Skin tone recommendations
    if (q.includes('skin tone') || q.includes('skin') || q.includes('complexion') || q.includes('my color')) {
      const skinTone = skinToneDetectionService.getCurrentSkinTone();
      if (skinTone) {
        const recommendations = this.getSkinToneBasedRecommendations(skinTone);
        return {
          type: 'skin_tone_recommendations',
          message: this.translate(`Based on your ${skinTone.category} skin tone, here are perfect color matches for you! 🎨`, this.currentLanguage),
          products: recommendations,
          skinTone: skinTone
        };
      } else {
        return {
          type: 'skin_tone_prompt',
          message: this.translate('I can provide personalized color recommendations based on your skin tone! Please upload a photo in the Skin Tone Analysis section first, or try general outfit suggestions. 📸', this.currentLanguage)
        };
      }
    }

    // Outfit suggestions
    if (q.includes('outfit') || q.includes('suggest') || q.includes('recommend')) {
      // Check if user has skin tone data for better recommendations
      const skinTone = skinToneDetectionService.getCurrentSkinTone();
      if (skinTone && !q.includes('men') && !q.includes('women')) {
        const skinToneRecommendations = this.getSkinToneBasedRecommendations(skinTone);
        return {
          type: 'skin_tone_outfit_suggestions',
          message: this.translate(`Based on your ${skinTone.category} skin tone, here are outfit suggestions that will look great on you! ✨`, this.currentLanguage),
          products: skinToneRecommendations,
          skinTone: skinTone
        };
      }

      const suggestions = this.suggestOutfits({
        category: q.includes('men') ? 'men' : q.includes('women') ? 'women' : 'all',
        style: q.includes('casual') ? 'casual' : q.includes('formal') ? 'formal' : q.includes('ethnic') ? 'ethnic' : 'casual'
      });
      return {
        type: 'outfit_suggestions',
        message: this.translate('Here are some outfit suggestions for you! ✨', this.currentLanguage),
        products: suggestions
      };
    }

    // Color matching
    if (q.includes('color') || q.includes('match') || q.includes('combine')) {
      if (product) {
        const matches = this.recommendMatchingColors(product);
        return {
          type: 'color_matches',
          message: this.translate(`These colors would look great with ${product.name}! 🎨`, this.currentLanguage),
          products: matches
        };
      }
    }

    // Product-specific questions
    if (product) {
      const answer = this.answerProductQuestion(query, product);
      return {
        type: 'product_answer',
        message: this.translate(answer, this.currentLanguage)
      };
    }

    // Personalized recommendations
    if (q.includes('recommend') || q.includes('personalized') || q.includes('for me')) {
      // First try skin tone recommendations
      const skinTone = skinToneDetectionService.getCurrentSkinTone();
      if (skinTone) {
        const skinToneRecommendations = this.getSkinToneBasedRecommendations(skinTone);
        return {
          type: 'skin_tone_personalized',
          message: this.translate(`Based on your ${skinTone.category} skin tone and preferences, here are personalized picks for you! 💫`, this.currentLanguage),
          products: skinToneRecommendations,
          skinTone: skinTone
        };
      }

      const recommendations = this.getPersonalizedRecommendations();
      return {
        type: 'personalized',
        message: this.translate('Based on your browsing history, here are some picks for you! 💫', this.currentLanguage),
        products: recommendations
      };
    }

    // Default response
    return {
      type: 'general',
      message: this.translate('I can help you with outfit suggestions, color recommendations, product questions, and personalized picks. What would you like to know? 🤔', this.currentLanguage)
    };
  }

  /**
   * Get product recommendations based on skin tone
   */
  getSkinToneBasedRecommendations(skinTone) {
    const bestColors = skinTone.bestColors || [];
    
    // Filter products that match the recommended colors
    const matchingProducts = PRODUCTS.filter(product => {
      const hasMatchingColor = product.colors.some(color => 
        bestColors.some(best => color.toLowerCase().includes(best.toLowerCase()))
      );
      return hasMatchingColor;
    });

    // If not enough matches, add products with neutral colors
    if (matchingProducts.length < 6) {
      const neutralProducts = PRODUCTS.filter(product => 
        product.colors.some(color => 
          ['black', 'white', 'gray', 'beige', 'cream', 'navy'].includes(color.toLowerCase())
        )
      );
      return [...matchingProducts, ...neutralProducts].slice(0, 12);
    }

    return matchingProducts.slice(0, 12);
  }

  /**
   * Set language
   */
  setLanguage(lang) {
    this.currentLanguage = lang;
    localStorage.setItem('language', lang);
  }
}

export default new FashionAssistantService();
