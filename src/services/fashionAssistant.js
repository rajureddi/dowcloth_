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
   * Get smart response based on user query using Gemini AI
   */
  async getSmartResponse(query, context = {}) {
    const q = query.toLowerCase();
    const { product } = context;

    let enhancedQuery = query;
    if (product) {
      enhancedQuery += `\n(System Note: The user is currently viewing the product: ${product.name}, Category: ${product.category}, Price: ₹${product.price})`;
    }
    const skinTone = skinToneDetectionService.getCurrentSkinTone();
    if (skinTone) {
      enhancedQuery += `\n(System Note: The user's skin tone is detected as '${skinTone.category}'. If recommending colors, suggest things like ${skinTone.bestColors.join(', ')}.)`;
    }

    // Prepare messages array for Gemini
    // User history is stored as an array of { action, context: { question } }. 
    // We only want the recent chat history.
    const chatHistory = this.userHistory
      .filter(entry => entry.action === 'chat_question' || entry.action === 'chat_response')
      .slice(-6); // last 6 turns

    const messages = chatHistory.map(m => ({
      role: m.action === 'chat_question' ? 'user' : 'model',
      content: m.context.question || m.context.response || ''
    }));

    messages.push({ role: 'user', content: enhancedQuery });

    let aiMessage = "I'm having trouble connecting right now.";
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          messages: messages, 
          context: { language: this.currentLanguage } 
        })
      });
      
      if (res.ok) {
        const data = await res.json();
        aiMessage = data.message;
        
        // Save the bot's response to history so context is retained
        this.saveToHistory('chat_response', null, { response: aiMessage });
      }
    } catch(err) {
      console.error("AI Chat Error:", err);
      aiMessage = this.translate('I am experiencing network issues connecting to my AI brain. Please try again later.', this.currentLanguage);
    }

    // Optionally append products if they asked for suggestions
    let products = [];
    if (q.includes('outfit') || q.includes('suggest') || q.includes('recommend') || q.includes('color') || q.includes('wear') || q.includes('dress') || q.includes('shirt') || q.includes('wedding')) {
       // If user asked about colors specifically against a product, try matching colors
       if (q.includes('color') && product) {
          products = this.recommendMatchingColors(product);
       } else {
          // SMART KEYWORD MATCHER:
          // Combine user query and AI response for keywords (lowercased)
          const textToMatch = (q + " " + aiMessage.toLowerCase()).replace(/[^\w\s-]/g, ' ');
          const keywords = textToMatch.split(/\s+/).filter(w => w.length > 3); // words longer than 3 chars
          
          // Calculate a relevance score for each product in our local catalog
          const scoredProducts = PRODUCTS.map(p => {
             let score = 0;
             const pText = `${p.name} ${p.category} ${p.subCategory} ${p.description} ${(p.tags||[]).join(' ')}`.toLowerCase();
             
             // Strong gender enforcement
             if (q.includes('men') && !q.includes('women') && p.category.toLowerCase() !== 'men') score -= 100;
             if ((q.includes('women') || q.includes('girl')) && p.category.toLowerCase() !== 'women') score -= 100;

             // Match keywords
             keywords.forEach(kw => {
                // exact match gets higher score
                if (pText.includes(` ${kw} `)) score += 3;
                else if (pText.includes(kw)) score += 1;
             });
             
             return { product: p, score };
          });

          // Sort by score and take top matches
          scoredProducts.sort((a, b) => b.score - a.score);
          // Only take products with a positive score
          products = scoredProducts.filter(sp => sp.score > 0).slice(0, 4).map(sp => sp.product);

          // Fallback if no smart matches were found
          if (products.length === 0) {
             products = this.suggestOutfits({
                category: q.includes('men') && !q.includes('women') ? 'men' : q.includes('women') ? 'women' : 'all',
                style: q.includes('casual') ? 'casual' : q.includes('formal') ? 'formal' : q.includes('ethnic') || q.includes('wedding') ? 'ethnic' : 'casual'
             });
          }
       }
    }

    return {
      type: products.length ? 'outfit_suggestions' : 'ai_response',
      message: aiMessage,
      products: products
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
