import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import imageEnhancementService from '../services/imageEnhancement';

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
    padding: '0 var(--padding-x)'
  },

  title: { fontSize: 'var(--font-hero)', fontWeight: '900', marginBottom: '10px' },
  subtitle: { fontSize: 'var(--font-body)', color: '#666', marginBottom: '40px' },

  uploadSection: { 
    border: '2px dashed #DDD', borderRadius: '8px', 
    padding: '60px 20px', textAlign: 'center', 
    marginBottom: '30px', cursor: 'pointer',
    transition: 'all 0.3s'
  },
  uploadSectionHover: { borderColor: '#000', backgroundColor: '#F9F9F9' },
  uploadIcon: { fontSize: '48px', marginBottom: '20px' },
  uploadText: { fontSize: '14px', fontWeight: '600', color: '#666' },

  previewSection: { display: 'flex', gap: '30px', flexWrap: 'wrap', marginBottom: '30px' },
  imageBox: { flex: 1, minWidth: '300px' },
  imageLabel: { fontSize: '12px', fontWeight: '700', marginBottom: '10px', letterSpacing: '1px' },
  imagePreview: { 
    width: '100%', aspectRatio: '3/4', 
    backgroundColor: '#F9F9F9', borderRadius: '8px',
    overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center'
  },
  previewImg: { width: '100%', height: '100%', objectFit: 'cover' },

  controlsSection: { marginBottom: '30px' },
  controlGroup: { marginBottom: '25px' },
  controlLabel: { fontSize: '12px', fontWeight: '700', marginBottom: '10px', letterSpacing: '1px' },
  sliderRow: { display: 'flex', alignItems: 'center', gap: '15px' },
  slider: { flex: 1, height: '6px', cursor: 'pointer' },
  sliderValue: { fontSize: '12px', fontWeight: '600', minWidth: '40px', textAlign: 'right' },

  presetButtons: { display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '30px' },
  presetBtn: { 
    padding: '12px 24px', border: '1px solid #DDD', borderRadius: '30px',
    background: '#FFF', cursor: 'pointer', fontSize: '11px', fontWeight: '700',
    letterSpacing: '1px', transition: 'all 0.3s'
  },
  presetBtnActive: { background: '#000', color: '#FFF', borderColor: '#000' },

  actionButtons: { display: 'flex', gap: '15px', flexWrap: 'wrap' },
  actionBtn: { 
    padding: '15px 30px', borderRadius: '8px', cursor: 'pointer',
    fontSize: '12px', fontWeight: '800', letterSpacing: '2px',
    transition: 'all 0.3s', border: 'none'
  },
  primaryBtn: { background: '#000', color: '#FFF' },
  secondaryBtn: { background: '#FFF', border: '2px solid #000', color: '#000' },

  processingOverlay: {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex',
    alignItems: 'center', justifyContent: 'center', zIndex: 1000
  },
  processingContent: { textAlign: 'center', color: '#FFF' },
  spinner: { 
    width: '50px', height: '50px', border: '4px solid #FFF',
    borderTop: '4px solid transparent', borderRadius: '50%',
    animation: 'spin 1s linear infinite', margin: '0 auto 20px'
  }
};

export default function ImageEnhancementScreen() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  
  const [originalImage, setOriginalImage] = useState(null);
  const [enhancedImage, setEnhancedImage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  
  const [settings, setSettings] = useState({
    saturation: 1.2,
    contrast: 1.1,
    brightness: 1.05,
    temperature: 0,
    tint: 0
  });
  
  const [activePreset, setActivePreset] = useState('cinematic');

  const presets = [
    { id: 'cinematic', name: 'Cinematic', saturation: 1.3, contrast: 1.15, brightness: 1.0 },
    { id: 'vintage', name: 'Vintage', saturation: 0.8, contrast: 1.2, brightness: 1.1 },
    { id: 'dramatic', name: 'Dramatic', saturation: 1.4, contrast: 1.3, brightness: 0.9 },
    { id: 'clean', name: 'Clean', saturation: 1.1, contrast: 1.05, brightness: 1.15 },
    { id: 'auto', name: 'Auto Optimize', saturation: 1.0, contrast: 1.0, brightness: 1.0 }
  ];

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setOriginalImage(event.target.result);
        setEnhancedImage(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setOriginalImage(event.target.result);
        setEnhancedImage(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const applyEnhancement = async () => {
    if (!originalImage) return;
    
    setIsProcessing(true);
    try {
      let result;
      if (activePreset === 'auto') {
        result = await imageEnhancementService.autoOptimize(originalImage);
      } else {
        result = await imageEnhancementService.cinematicRender(originalImage, activePreset);
      }
      setEnhancedImage(result);
    } catch (error) {
      console.error('Enhancement failed:', error);
      alert('Failed to enhance image. Please try again.');
    }
    setIsProcessing(false);
  };

  const applySkinToneBalance = async () => {
    if (!originalImage) return;
    
    setIsProcessing(true);
    try {
      const result = await imageEnhancementService.balanceSkinTones(originalImage);
      setEnhancedImage(result);
    } catch (error) {
      console.error('Skin tone balancing failed:', error);
    }
    setIsProcessing(false);
  };

  const handlePresetClick = (preset) => {
    setActivePreset(preset.id);
    setSettings({
      saturation: preset.saturation,
      contrast: preset.contrast,
      brightness: preset.brightness,
      temperature: 0,
      tint: 0
    });
  };

  const downloadImage = () => {
    if (!enhancedImage) return;
    
    const link = document.createElement('a');
    link.href = enhancedImage;
    link.download = 'enhanced-image.jpg';
    link.click();
  };

  return (
    <div style={styles.root}>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
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
          <h1 style={styles.title}>AI IMAGE ENHANCEMENT</h1>
          <p style={styles.subtitle}>Transform your product images with AI-powered color grading, skin tone balancing, and cinematic rendering</p>

          {/* UPLOAD SECTION */}
          <div 
            style={{...styles.uploadSection, ...(isHovering ? styles.uploadSectionHover : {})}}
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setIsHovering(true); }}
            onDragLeave={() => setIsHovering(false)}
            onDrop={handleDrop}
          >
            <div style={styles.uploadIcon}>📷</div>
            <p style={styles.uploadText}>Drop image here or click to upload</p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              style={{ display: 'none' }}
            />
          </div>

          {/* PREVIEW SECTION */}
          {originalImage && (
            <div style={styles.previewSection}>
              <div style={styles.imageBox}>
                <div style={styles.imageLabel}>ORIGINAL</div>
                <div style={styles.imagePreview}>
                  <img src={originalImage} style={styles.previewImg} alt="Original" />
                </div>
              </div>
              
              {enhancedImage && (
                <div style={styles.imageBox}>
                  <div style={styles.imageLabel}>ENHANCED</div>
                  <div style={styles.imagePreview}>
                    <img src={enhancedImage} style={styles.previewImg} alt="Enhanced" />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* PRESET BUTTONS */}
          {originalImage && (
            <div style={styles.presetButtons}>
              {presets.map(preset => (
                <button
                  key={preset.id}
                  style={{...styles.presetBtn, ...(activePreset === preset.id ? styles.presetBtnActive : {})}}
                  onClick={() => handlePresetClick(preset)}
                >
                  {preset.name}
                </button>
              ))}
            </div>
          )}

          {/* ACTION BUTTONS */}
          {originalImage && (
            <div style={styles.actionButtons}>
              <button 
                style={styles.primaryBtn}
                onClick={applyEnhancement}
                disabled={isProcessing}
              >
                {isProcessing ? 'PROCESSING...' : 'APPLY ENHANCEMENT'}
              </button>
              
              <button 
                style={styles.secondaryBtn}
                onClick={applySkinToneBalance}
                disabled={isProcessing}
              >
                BALANCE SKIN TONES
              </button>
              
              {enhancedImage && (
                <button 
                  style={styles.secondaryBtn}
                  onClick={downloadImage}
                >
                  DOWNLOAD
                </button>
              )}
            </div>
          )}
        </div>
      </main>

      {/* PROCESSING OVERLAY */}
      {isProcessing && (
        <div style={styles.processingOverlay}>
          <div style={styles.processingContent}>
            <div style={styles.spinner} />
            <p>Processing image with AI...</p>
          </div>
        </div>
      )}
    </div>
  );
}
