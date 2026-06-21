import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import skinToneDetectionService from '../services/skinToneDetection';
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

  uploadSection: { flex: 1, minWidth: '350px' },
  title: { fontSize: 'var(--font-hero)', fontWeight: '900', marginBottom: '10px' },
  subtitle: { fontSize: 'var(--font-body)', color: '#666', marginBottom: '30px' },

  uploadArea: { 
    border: '2px dashed #DDD', borderRadius: '12px', padding: '40px',
    textAlign: 'center', cursor: 'pointer', transition: 'all 0.3s',
    backgroundColor: '#FAFAFA'
  },
  uploadAreaHover: { borderColor: '#000', backgroundColor: '#F0F0F0' },
  uploadIcon: { fontSize: '48px', marginBottom: '15px' },
  uploadText: { fontSize: '14px', fontWeight: '600', color: '#666', marginBottom: '10px' },
  uploadSubtext: { fontSize: '12px', color: '#999' },

  previewContainer: { position: 'relative', marginBottom: '20px' },
  previewImage: { 
    width: '100%', borderRadius: '12px', maxHeight: '400px',
    objectFit: 'contain', backgroundColor: '#F9F9F9'
  },
  removeBtn: { 
    position: 'absolute', top: '10px', right: '10px',
    background: 'rgba(255, 0, 0, 0.8)', color: '#FFF',
    border: 'none', borderRadius: '50%', width: '35px', height: '35px',
    cursor: 'pointer', fontSize: '18px', fontWeight: 'bold'
  },

  analyzeBtn: { 
    width: '100%', padding: '15px', background: '#000', color: '#FFF',
    border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '800',
    cursor: 'pointer', transition: 'all 0.3s'
  },
  analyzeBtnHover: { background: '#333' },
  analyzeBtnDisabled: { background: '#CCC', cursor: 'not-allowed' },

  resultsSection: { flex: 1, minWidth: '350px' },
  sectionTitle: { fontSize: '16px', fontWeight: '800', marginBottom: '20px', letterSpacing: '1px' },

  resultCard: { 
    backgroundColor: '#F9F9F9', borderRadius: '12px', padding: '25px',
    marginBottom: '25px', border: '1px solid #EEE'
  },
  skinToneCategory: { 
    fontSize: '24px', fontWeight: '900', marginBottom: '10px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent'
  },
  skinToneDescription: { fontSize: '14px', color: '#666', marginBottom: '20px' },
  skinToneSwatch: { 
    width: '60px', height: '60px', borderRadius: '50%',
    marginBottom: '15px', border: '3px solid #FFF',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
  },

  colorPalette: { display: 'flex', gap: '10px', marginBottom: '20px' },
  colorSwatch: { 
    width: '40px', height: '40px', borderRadius: '8px',
    border: '2px solid #FFF', boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
  },

  recommendationList: { listStyle: 'none', padding: 0, margin: 0 },
  recommendationItem: { 
    padding: '10px 0', borderBottom: '1px solid #EEE',
    fontSize: '13px', color: '#333'
  },
  recommendationItemLast: { borderBottom: 'none' },

  productsSection: { width: '100%', marginTop: '30px' },
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
  matchBadge: { 
    display: 'inline-block', padding: '4px 8px', borderRadius: '4px',
    fontSize: '10px', fontWeight: '700', backgroundColor: '#E8F5E9',
    color: '#2E7D32', marginBottom: '5px'
  },

  loadingOverlay: { 
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.9)', display: 'flex',
    alignItems: 'center', justifyContent: 'center', zIndex: 1000
  },
  loadingSpinner: { 
    width: '50px', height: '50px', border: '4px solid #DDD',
    borderTopColor: '#000', borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  },
  loadingText: { marginTop: '20px', fontSize: '16px', fontWeight: '600' }
};

export default function SkinToneAnalysisScreen() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  
  const [uploadedImage, setUploadedImage] = useState(null);
  const [imageBase64, setImageBase64] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [recommendedProducts, setRecommendedProducts] = useState([]);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    // Initialize the service
    skinToneDetectionService.initializeModel();
  }, []);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      setUploadedImage(e.target.result);
      setImageBase64(e.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setUploadedImage(null);
    setImageBase64(null);
    setAnalysisResult(null);
    setRecommendedProducts([]);
  };

  const handleAnalyze = async () => {
    if (!imageBase64) return;

    setIsAnalyzing(true);
    
    try {
      const result = await skinToneDetectionService.analyzeSkinTone(imageBase64);
      
      if (result.success) {
        setAnalysisResult(result);
        
        // Get product recommendations based on skin tone
        const recommendations = getSkinToneProductRecommendations(result.skinTone);
        setRecommendedProducts(recommendations);
      } else {
        alert('Analysis failed: ' + result.error);
      }
    } catch (error) {
      console.error('Analysis error:', error);
      alert('An error occurred during analysis. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getSkinToneProductRecommendations = (skinTone) => {
    // Filter products based on skin tone recommendations
    const bestColors = skinTone.bestColors || [];
    
    return PRODUCTS.filter(product => {
      // Check if product colors match recommended colors
      const hasMatchingColor = product.colors.some(color => 
        bestColors.some(best => color.toLowerCase().includes(best.toLowerCase()))
      );
      return hasMatchingColor;
    }).slice(0, 8);
  };

  const handleProductClick = (product) => {
    navigate(`/product/${product.id}`);
  };

  return (
    <div style={styles.root}>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>

      {/* LOADING OVERLAY */}
      {isAnalyzing && (
        <div style={styles.loadingOverlay}>
          <div>
            <div style={styles.loadingSpinner} />
            <div style={styles.loadingText}>Analyzing Skin Tone...</div>
          </div>
        </div>
      )}

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
          {/* UPLOAD SECTION */}
          <div style={styles.uploadSection}>
            <h1 style={styles.title}>SKIN TONE ANALYSIS</h1>
            <p style={styles.subtitle}>Upload a photo to get personalized color recommendations</p>

            {!uploadedImage ? (
              <div 
                style={{...styles.uploadArea, ...(isHovered ? styles.uploadAreaHover : {})}}
                onDragOver={(e) => { e.preventDefault(); setIsHovered(true); }}
                onDragLeave={() => setIsHovered(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsHovered(false);
                  const file = e.dataTransfer.files[0];
                  if (file) processFile(file);
                }}
                onClick={() => fileInputRef.current?.click()}
              >
                <div style={styles.uploadIcon}>📷</div>
                <div style={styles.uploadText}>Click to upload or drag & drop</div>
                <div style={styles.uploadSubtext}>JPG, PNG (Max 5MB)</div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={handleFileSelect}
                />
              </div>
            ) : (
              <div style={styles.previewContainer}>
                <img src={uploadedImage} style={styles.previewImage} alt="Preview" />
                <button style={styles.removeBtn} onClick={handleRemoveImage}>×</button>
              </div>
            )}

            <button
              style={{
                ...styles.analyzeBtn,
                ...(imageBase64 ? {} : styles.analyzeBtnDisabled)
              }}
              onClick={handleAnalyze}
              disabled={!imageBase64 || isAnalyzing}
            >
              {isAnalyzing ? 'ANALYZING...' : 'ANALYZE SKIN TONE'}
            </button>
          </div>

          {/* RESULTS SECTION */}
          <div style={styles.resultsSection}>
            <h2 style={styles.sectionTitle}>ANALYSIS RESULTS</h2>

            {analysisResult ? (
              <>
                <div style={styles.resultCard}>
                  <div 
                    style={{...styles.skinToneSwatch, backgroundColor: analysisResult.skinTone.hex}}
                  />
                  <div style={styles.skinToneCategory}>
                    {analysisResult.skinTone.category.toUpperCase()}
                  </div>
                  <div style={styles.skinToneDescription}>
                    {analysisResult.skinTone.description}
                  </div>

                  <div style={{ fontSize: '14px', fontWeight: '700', marginBottom: '10px' }}>
                    RECOMMENDED COLOR PALETTE
                  </div>
                  <div style={styles.colorPalette}>
                    {analysisResult.skinTone.colorPalette.map((color, index) => (
                      <div
                        key={index}
                        style={{...styles.colorSwatch, backgroundColor: color}}
                        title={color}
                      />
                    ))}
                  </div>

                  <div style={{ fontSize: '14px', fontWeight: '700', marginBottom: '10px' }}>
                    BEST COLORS FOR YOU
                  </div>
                  <ul style={styles.recommendationList}>
                    {analysisResult.recommendations.bestColors.map((color, index) => (
                      <li key={index} style={styles.recommendationItem}>
                        ✓ {color}
                      </li>
                    ))}
                  </ul>

                  <div style={{ fontSize: '14px', fontWeight: '700', marginBottom: '10px', marginTop: '20px' }}>
                    COLORS TO AVOID
                  </div>
                  <ul style={styles.recommendationList}>
                    {analysisResult.recommendations.avoidColors.map((color, index) => (
                      <li key={index} style={{...styles.recommendationItem, color: '#999'}}>
                    ✗ {color}
                  </li>
                    ))}
                  </ul>

                  <div style={{ fontSize: '14px', fontWeight: '700', marginBottom: '10px', marginTop: '20px' }}>
                    STYLING TIPS
                  </div>
                  <ul style={styles.recommendationList}>
                    {analysisResult.recommendations.tips.map((tip, index) => (
                      <li 
                        key={index} 
                        style={{...styles.recommendationItem, ...(index === analysisResult.recommendations.tips.length - 1 ? styles.recommendationItemLast : {})}}
                      >
                        💡 {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              </>
            ) : (
              <div style={styles.resultCard}>
                <div style={{ fontSize: '14px', color: '#999', textAlign: 'center', padding: '40px' }}>
                  Upload an image to see your skin tone analysis results
                </div>
              </div>
            )}
          </div>

          {/* PRODUCT RECOMMENDATIONS */}
          {recommendedProducts.length > 0 && (
            <div style={styles.productsSection}>
              <h2 style={styles.sectionTitle}>RECOMMENDED PRODUCTS FOR YOUR SKIN TONE</h2>
              <div style={styles.productGrid}>
                {recommendedProducts.map(product => (
                  <div key={product.id} style={styles.productCard} onClick={() => handleProductClick(product)}>
                    <div style={styles.productImage}>
                      <img src={product.image} style={styles.productImg} alt={product.name} />
                    </div>
                    <div style={styles.matchBadge}>PERFECT MATCH</div>
                    <div style={styles.productName}>{product.name}</div>
                    <div style={styles.productPrice}>₹{product.price.toLocaleString()}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
