import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import fashionAssistantService from '../services/fashionAssistant';
import { PRODUCTS } from '../data/products';

const styles = {
  root: { minHeight: '100vh', backgroundColor: '#FFFFFF', fontFamily: 'Poppins, sans-serif' },
  header: { 
    height: '80px', backgroundColor: '#FFFFFF', borderBottom: '1px solid #F2F2F2', 
    display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'sticky', top: 0, zIndex: 100 
  },
  headerContent: { width: '100%', maxWidth: 'var(--max-width)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 var(--padding-x)' },
  backBtn: { background: 'none', border: 'none', cursor: 'pointer', fontSize: '10px', fontWeight: '800', letterSpacing: '2px' },
  headerLogo: { fontSize: '18px', fontWeight: '900', letterSpacing: '8px' },

  mainContent: { width: '100%', display: 'flex', justifyContent: 'center', padding: 'var(--padding-y) 0' },
  contentLayout: { 
    width: '100%', 
    maxWidth: 'var(--max-width)', 
    padding: '0 var(--padding-x)',
    display: 'flex', gap: '30px', flexWrap: 'wrap'
  },

  chatSection: { flex: 1, minWidth: '350px' },
  title: { fontSize: 'var(--font-hero)', fontWeight: '900', marginBottom: '10px' },
  subtitle: { fontSize: 'var(--font-body)', color: '#666', marginBottom: '30px' },

  languageSelector: { display: 'flex', gap: '10px', marginBottom: '30px', flexWrap: 'wrap' },
  langBtn: { 
    padding: '8px 16px', border: '1px solid #DDD', borderRadius: '20px',
    background: '#FFF', cursor: 'pointer', fontSize: '11px', fontWeight: '700',
    transition: 'all 0.3s'
  },
  langBtnActive: { background: '#000', color: '#FFF', borderColor: '#000' },

  chatContainer: { 
    height: '500px', border: '1px solid #EEE', borderRadius: '12px',
    overflow: 'hidden', display: 'flex', flexDirection: 'column',
    backgroundColor: '#FAFAFA'
  },
  chatMessages: { 
    flex: 1, overflowY: 'auto', padding: '20px',
    display: 'flex', flexDirection: 'column', gap: '15px'
  },
  message: { 
    maxWidth: '80%', padding: '12px 16px', borderRadius: '12px',
    fontSize: '14px', lineHeight: '1.5'
  },
  userMessage: { 
    alignSelf: 'flex-end', backgroundColor: '#000', color: '#FFF',
    borderBottomRightRadius: '4px'
  },
  botMessage: { 
    alignSelf: 'flex-start', backgroundColor: '#FFF', color: '#000',
    borderBottomLeftRadius: '4px', border: '1px solid #EEE'
  },
  productSuggestion: { 
    backgroundColor: '#F0F7FF', padding: '15px', borderRadius: '8px',
    marginTop: '10px', border: '1px solid #D0E7FF'
  },
  suggestionTitle: { fontSize: '12px', fontWeight: '700', marginBottom: '10px', color: '#1E40AF' },
  suggestionGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '10px' },
  suggestionItem: { cursor: 'pointer' },
  suggestionImg: { 
    width: '100%', aspectRatio: '3/4', objectFit: 'cover',
    borderRadius: '4px', marginBottom: '5px'
  },
  suggestionName: { fontSize: '10px', fontWeight: '600', height: '30px', overflow: 'hidden' },

  inputSection: { padding: '15px', borderTop: '1px solid #EEE', backgroundColor: '#FFF' },
  inputRow: { display: 'flex', gap: '10px' },
  chatInput: { 
    flex: 1, padding: '12px 16px', border: '1px solid #EEE',
    borderRadius: '25px', fontSize: '14px', outline: 'none',
    transition: 'border-color 0.3s'
  },
  chatInputFocus: { borderColor: '#000' },
  sendBtn: { 
    width: '45px', height: '45px', borderRadius: '50%',
    background: '#000', color: '#FFF', border: 'none',
    cursor: 'pointer', fontSize: '18px', display: 'flex',
    alignItems: 'center', justifyContent: 'center'
  },
  voiceBtn: { 
    width: '45px', height: '45px', borderRadius: '50%',
    background: '#FFF', color: '#000', border: '1px solid #EEE',
    cursor: 'pointer', fontSize: '18px', display: 'flex',
    alignItems: 'center', justifyContent: 'center'
  },
  voiceBtnActive: { background: '#FF0000', color: '#FFF', borderColor: '#FF0000' },

  quickActions: { display: 'flex', gap: '8px', marginTop: '10px', flexWrap: 'wrap' },
  quickActionBtn: { 
    padding: '6px 12px', background: '#F5F5F5', border: 'none',
    borderRadius: '15px', fontSize: '10px', fontWeight: '600',
    cursor: 'pointer', transition: 'background 0.3s'
  },
  quickActionBtnHover: { background: '#E0E0E0' },

  recommendationsSection: { flex: 1, minWidth: '300px' },
  sectionTitle: { fontSize: '16px', fontWeight: '800', marginBottom: '20px', letterSpacing: '1px' },
  productGrid: { 
    display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
    gap: '15px'
  },
  productCard: { cursor: 'pointer' },
  productImage: { 
    aspectRatio: '3/4', backgroundColor: '#F9F9F9', borderRadius: '8px',
    overflow: 'hidden', marginBottom: '10px'
  },
  productImg: { width: '100%', height: '100%', objectFit: 'cover' },
  productName: { fontSize: '12px', fontWeight: '700', marginBottom: '5px', height: '35px', overflow: 'hidden' },
  productPrice: { fontSize: '14px', fontWeight: '900' },

  typingIndicator: { display: 'flex', gap: '4px', padding: '10px' },
  typingDot: { 
    width: '8px', height: '8px', borderRadius: '50%',
    background: '#999', animation: 'typing 1.4s infinite'
  },
  typingDotDelay1: { animationDelay: '0.2s' },
  typingDotDelay2: { animationDelay: '0.4s' }
};

export default function FashionAssistantScreen() {
  const navigate = useNavigate();
  const location = useLocation();
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  
  const [messages, setMessages] = useState([
    { 
      type: 'bot', 
      text: 'Hello! 👋 I\'m your AI Fashion Assistant. I can help you with outfit suggestions, color recommendations, product questions, and personalized picks. How can I assist you today?' 
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [suggestedProducts, setSuggestedProducts] = useState([]);
  const [contextProduct, setContextProduct] = useState(location.state?.product || null);

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'hi', name: 'हिंदी' },
    { code: 'es', name: 'Español' },
    { code: 'fr', name: 'Français' }
  ];

  const quickActions = [
    'Suggest casual outfit',
    'Suggest formal outfit',
    'Color matching',
    'Personalized picks',
    'Delivery info',
    'Size guide'
  ];

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (contextProduct) {
      fashionAssistantService.saveToHistory('view', contextProduct);
    }
  }, [contextProduct]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (text = inputText) => {
    if (!text.trim()) return;

    const userMessage = { type: 'user', text };
    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    // Save to history
    fashionAssistantService.saveToHistory('chat_question', null, { question: text });

    try {
      const response = await fashionAssistantService.getSmartResponse(text, { product: contextProduct });
      
      setTimeout(() => {
        setIsTyping(false);
        
        if (response.type === 'outfit_suggestions' || response.type === 'color_matches' || response.type === 'personalized') {
          setSuggestedProducts(response.products || []);
          setMessages(prev => [...prev, { 
            type: 'bot', 
            text: response.message,
            products: response.products 
          }]);
        } else {
          setMessages(prev => [...prev, { type: 'bot', text: response.message }]);
        }
      }, 1000);
    } catch (error) {
      setIsTyping(false);
      setMessages(prev => [...prev, { 
        type: 'bot', 
        text: 'Sorry, I encountered an error. Please try again.' 
      }]);
    }
  };

  const handleVoiceInput = async () => {
    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      setIsListening(true);
      const transcript = await fashionAssistantService.processVoiceInput();
      setInputText(transcript);
      setIsListening(false);
      handleSendMessage(transcript);
    } catch (error) {
      setIsListening(false);
      console.error('Voice input failed:', error);
      alert('Voice input not supported or failed. Please type your message.');
    }
  };

  const handleLanguageChange = (langCode) => {
    setCurrentLanguage(langCode);
    fashionAssistantService.setLanguage(langCode);
  };

  const handleQuickAction = (action) => {
    setInputText(action);
    handleSendMessage(action);
  };

  const handleProductClick = (product) => {
    setContextProduct(product);
    fashionAssistantService.saveToHistory('click', product);
    navigate(`/product/${product.id}`);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div style={styles.root}>
      <style>{`
        @keyframes typing {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-10px); }
        }
      `}</style>

      {/* HEADER */}
      <header style={styles.header}>
        <div style={styles.headerContent}>
          <button onClick={() => navigate(-1)} style={styles.backBtn}>← BACK</button>
          <h1 style={styles.headerLogo}>DOWCLOTH</h1>
          <div style={{ width: '60px' }} />
        </div>
      </header>

      <main style={styles.mainContent}>
        <div style={styles.contentLayout}>
          {/* CHAT SECTION */}
          <div style={styles.chatSection}>
            <h1 style={styles.title}>AI FASHION ASSISTANT</h1>
            <p style={styles.subtitle}>Your personal fashion advisor with voice support and multilingual assistance</p>

            {/* LANGUAGE SELECTOR */}
            <div style={styles.languageSelector}>
              {languages.map(lang => (
                <button
                  key={lang.code}
                  style={{...styles.langBtn, ...(currentLanguage === lang.code ? styles.langBtnActive : {})}}
                  onClick={() => handleLanguageChange(lang.code)}
                >
                  {lang.name}
                </button>
              ))}
            </div>

            {/* CHAT CONTAINER */}
            <div style={styles.chatContainer}>
              <div style={styles.chatMessages}>
                {messages.map((msg, index) => (
                  <div key={index}>
                    <div style={{...styles.message, ...(msg.type === 'user' ? styles.userMessage : styles.botMessage)}}>
                      {msg.text}
                    </div>
                    
                    {msg.products && msg.products.length > 0 && (
                      <div style={styles.productSuggestion}>
                        <div style={styles.suggestionTitle}>SUGGESTED PRODUCTS</div>
                        <div style={styles.suggestionGrid}>
                          {msg.products.slice(0, 4).map(product => (
                            <div 
                              key={product.id} 
                              style={styles.suggestionItem}
                              onClick={() => handleProductClick(product)}
                            >
                              <img src={product.image} style={styles.suggestionImg} alt={product.name} />
                              <div style={styles.suggestionName}>{product.name}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                
                {isTyping && (
                  <div style={styles.typingIndicator}>
                    <div style={{...styles.typingDot, ...styles.typingDotDelay1}} />
                    <div style={{...styles.typingDot, ...styles.typingDotDelay2}} />
                    <div style={styles.typingDot} />
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>

              {/* INPUT SECTION */}
              <div style={styles.inputSection}>
                <div style={styles.inputRow}>
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask about outfits, colors, products..."
                    style={styles.chatInput}
                  />
                  <button
                    style={styles.voiceBtn}
                    onClick={handleVoiceInput}
                    title="Voice Input"
                  >
                    {isListening ? '🔴' : '🎤'}
                  </button>
                  <button
                    style={styles.sendBtn}
                    onClick={() => handleSendMessage()}
                    title="Send"
                  >
                    ➤
                  </button>
                </div>
                
                {/* QUICK ACTIONS */}
                <div style={styles.quickActions}>
                  {quickActions.map(action => (
                    <button
                      key={action}
                      style={styles.quickActionBtn}
                      onClick={() => handleQuickAction(action)}
                    >
                      {action}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* RECOMMENDATIONS SECTION */}
          <div style={styles.recommendationsSection}>
            <h2 style={styles.sectionTitle}>PERSONALIZED FOR YOU</h2>
            <div style={styles.productGrid}>
              {fashionAssistantService.getPersonalizedRecommendations().slice(0, 6).map(product => (
                <div key={product.id} style={styles.productCard} onClick={() => handleProductClick(product)}>
                  <div style={styles.productImage}>
                    <img src={product.image} style={styles.productImg} alt={product.name} />
                  </div>
                  <div style={styles.productName}>{product.name}</div>
                  <div style={styles.productPrice}>₹{product.price.toLocaleString()}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
