import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PRODUCTS } from '../data/products';
import { performVirtualTryOn } from '../services/vertexAI';

const styles = {
  root: { minHeight: '100vh', backgroundColor: '#F8F8F6' },
  header: { 
    height: '80px', backgroundColor: '#FFFFFF', borderBottom: '1px solid #EEE', 
    display: 'flex', alignItems: 'center', justifyContent: 'center' 
  },
  headerContent: { width: '100%', maxWidth: 'var(--max-width)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 var(--padding-x)' },
  backLink: { background: 'none', border: 'none', outline: 'none', cursor: 'pointer', fontSize: '10px', fontWeight: '800', letterSpacing: '2px' },
  headerTitle: { fontSize: '13px', fontWeight: '900', letterSpacing: '6px' },

  studioBody: { width: '100%', display: 'flex', justifyContent: 'center', padding: 'var(--padding-y) 0' },
  studioLayout: { 
    width: '100%', 
    maxWidth: 'var(--max-width)', 
    display: 'flex', 
    gap: 'var(--grid-gap)', 
    padding: '0 var(--padding-x)',
    flexWrap: 'wrap'
  },

  controlSection: { flex: 1, minWidth: '300px' },
  studioCard: { backgroundColor: '#FFFFFF', padding: '25px', border: '1px solid #F0F0F0', marginBottom: '20px' },
  cardHeader: { fontSize: '9px', fontWeight: '800', color: '#AAA', letterSpacing: '2px', marginBottom: '20px' },
  actionPad: { backgroundColor: '#F9F9F9', minHeight: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  uploadRow: { display: 'flex', gap: '20px' },
  iconBtn: { cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' },
  btnLabel: { fontSize: '9px', fontWeight: '800', color: '#000', letterSpacing: '1px' },
  previewWrap: { position: 'relative', width: '100%', height: '300px' },
  previewImg: { width: '100%', height: '100%', objectFit: 'cover' },
  resetBtn: { position: 'absolute', bottom: '20px', left: '50%', transform: 'translateX(-50%)', backgroundColor: 'rgba(0,0,0,0.8)', color: '#FFF', border: 'none', padding: '10px 20px', fontSize: '9px', fontWeight: '800', cursor: 'pointer' },
  studioTip: { fontSize: '10px', color: '#BBB', marginTop: '15px', textAlign: 'center', fontStyle: 'italic' },

  productRow: { display: 'flex', alignItems: 'center', gap: '15px' },
  miniProdImg: { width: '40px', height: '60px', objectFit: 'cover' },
  miniProdName: { fontSize: '14px', fontWeight: '800' },
  miniProdBrand: { fontSize: '9px', color: '#BBB', letterSpacing: '1px' },
  generateBtn: { width: '100%', height: '60px', backgroundColor: '#000', color: '#FFF', border: 'none', marginTop: '20px', fontWeight: '900', letterSpacing: '3px', cursor: 'pointer' },

  visualizerSection: { flex: 1.2, minWidth: '300px' },
  visualizerCard: { backgroundColor: '#FFFFFF', border: '1px solid #F0F0F0', overflow: 'hidden' },
  vHeader: { padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #F0F0F0' },
  vTitle: { fontSize: '11px', fontWeight: '800', letterSpacing: '3px' },
  dot: { width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#52A535' },
  renderWindow: { width: '100%', aspectRatio: '3/4.5', backgroundColor: '#F9F9F9', position: 'relative' },
  finalRender: { width: '100%', height: '100%', objectFit: 'cover' },
  emptyState: { height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' },
  bgGhost: { position: 'absolute', width: '100%', height: '100%', opacity: 0.1, objectFit: 'cover' },
  overlayText: { position: 'relative', zIndex: 1, textAlign: 'center' },
  emptyTitle: { fontSize: '12px', fontWeight: '900', color: '#CCC', letterSpacing: '6px' },
  bagBtn: { width: '100%', height: '70px', backgroundColor: '#000', color: '#FFF', border: 'none', fontWeight: '900', letterSpacing: '3px', cursor: 'pointer' },
  loader: { height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' },
};

export default function VirtualTryOnScreen() {
  const navigate = useNavigate();
  const { id } = useParams();
  const product = PRODUCTS.find(p => p.id === id) || PRODUCTS[0];
  
  const [personImage, setPersonImage] = useState(null);
  const [resultUri, setResultUri] = useState(null);
  const [loading, setLoading] = useState(false);

  // 🛡️ BOLD ACTION: Standard Web File Input logic for Gallery/Camera
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) setPersonImage(URL.createObjectURL(file));
  };

  const handleTryOn = async () => {
    if (!personImage) return alert('Please upload your portrait first.');
    setLoading(true);
    const res = await performVirtualTryOn(personImage, product.image, product.name);
    setLoading(false);
    if (res.success) setResultUri(res.imageUri);
    else alert('AI Error: ' + res.error);
  };

  return (
    <div style={styles.root}>
      {/* 🏙️ STUDIO NAV */}
      <header style={styles.header}>
        <div style={styles.headerContent}>
           <button onClick={() => navigate(-1)} style={styles.backLink}>← BACK</button>
           <h1 style={styles.headerTitle}>AI VIRTUAL FITTING STUDIO</h1>
           <div style={{ width: 80 }} />
        </div>
      </header>

      <main style={styles.studioBody}>
        <div style={styles.studioLayout}>
          {/* 🟦 LEFT: STUDIO CONTROLS */}
          <section style={styles.controlSection}>
             <div style={styles.studioCard}>
                <h3 style={styles.cardHeader}>1. PERSONAL PORTRAIT</h3>
                <div style={styles.actionPad}>
                   {personImage ? (
                      <div style={styles.previewWrap}>
                         <img src={personImage} style={styles.previewImg} alt="Portrait" />
                         <button style={styles.resetBtn} onClick={() => setPersonImage(null)}>✕ CHANGE PHOTO</button>
                      </div>
                   ) : (
                      <div style={styles.uploadRow}>
                         <label style={styles.iconBtn}>
                            <input type="file" style={{ display: 'none' }} accept="image/*" onChange={handleFileUpload} />
                            <span style={{ fontSize: 32 }}>🖼️</span>
                            <span style={styles.btnLabel}>GALLERY / DEVICE</span>
                         </label>
                         <label style={styles.iconBtn}>
                            <input type="file" style={{ display: 'none' }} accept="image/*" capture="user" onChange={handleFileUpload} />
                            <span style={{ fontSize: 32 }}>📸</span>
                            <span style={styles.btnLabel}>CAMERA</span>
                         </label>
                      </div>
                   )}
                </div>
                <p style={styles.studioTip}>Tip: Use a clear, well-lit portrait for best results.</p>
             </div>

             <div style={{...styles.studioCard, marginTop: '30px'}}>
                <h3 style={styles.cardHeader}>2. SELECTED PRODUCT</h3>
                <div style={styles.productRow}>
                   <img src={product.image} style={styles.miniProdImg} alt={product.name} />
                   <div>
                      <h4 style={styles.miniProdName}>{product.name}</h4>
                      <span style={styles.miniProdBrand}>{product.brand.toUpperCase()}</span>
                   </div>
                </div>
             </div>

             <button 
               style={{...styles.generateBtn, opacity: (loading || !personImage) ? 0.5 : 1}} 
               disabled={loading || !personImage}
               onClick={handleTryOn}
             >
                {loading ? 'SYNTHESIZING STYLES...' : 'GENERATE AI FITTING'}
             </button>
          </section>

          {/* 🟩 RIGHT: STUDIO VISUALIZER */}
          <section style={styles.visualizerSection}>
             <div style={styles.visualizerCard}>
                <div style={styles.vHeader}>
                   <h3 style={styles.vTitle}>AI WORKSPACE</h3>
                   <div style={styles.dot} />
                </div>
              <div style={styles.renderWindow}>
                 <style>{`
                   @keyframes v-scan {
                     0% { top: 0%; opacity: 0; }
                     10% { opacity: 1; }
                     90% { opacity: 1; }
                     100% { top: 100%; opacity: 0; }
                   }
                   @keyframes v-pulse-glow {
                     0% { filter: drop-shadow(0 0 10px rgba(255,255,255,0.4)); transform: scale(0.95); }
                     50% { filter: drop-shadow(0 0 30px rgba(255,255,255,1)); transform: scale(1.05); }
                     100% { filter: drop-shadow(0 0 10px rgba(255,255,255,0.4)); transform: scale(0.95); }
                   }
                   @keyframes v-spin { 100% { transform: rotate(360deg); } }
                   @keyframes v-bg-pan {
                     0% { background-position: 0% 50%; }
                     50% { background-position: 100% 50%; }
                     100% { background-position: 0% 50%; }
                   }
                   @keyframes wardrobe-slide {
                     0% { transform: translate(-100%, 20%) scale(0.4) rotate(-15deg); opacity: 0; filter: brightness(0.8); }
                     20% { transform: translate(-40%, 0%) scale(0.7) rotate(5deg); opacity: 1; filter: brightness(1); }
                     50% { transform: translate(0%, 0%) scale(1) rotate(0deg); opacity: 1; filter: drop-shadow(0 0 15px rgba(255,255,255,0.5)); }
                     80% { transform: translate(0%, 5%) scale(1.15); opacity: 0.5; filter: drop-shadow(0 0 30px rgba(235, 77, 123, 0.8)); }
                     100% { transform: translate(0%, 10%) scale(1.3); opacity: 0; filter: drop-shadow(0 0 50px rgba(235, 77, 123, 1)); }
                   }
                 `}</style>
                 {loading ? (
                   <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', borderRadius: 'inherit', backgroundColor: '#111' }}>
                      {/* Base User Photo */}
                      <img src={personImage} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.6 }} alt="You" />
                      
                      {/* Magic Gradient Glass Overlay (lighter so we can see the clothes) */}
                      <div style={{ 
                        position: 'absolute', inset: 0, 
                        background: 'linear-gradient(-45deg, rgba(89, 46, 179, 0.6), rgba(235, 77, 123, 0.6), rgba(42, 13, 93, 0.6))',
                        backgroundSize: '400% 400%',
                        animation: 'v-bg-pan 6s ease infinite',
                        backdropFilter: 'blur(5px)', WebkitBackdropFilter: 'blur(5px)' 
                      }} />
                      
                      {/* Animated Wardrobe Apply Effect - Uses ACTUAL product */}
                      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                         <img 
                           src={product.image} 
                           style={{ 
                             width: '80%', height: '80%', objectFit: 'contain',
                             animation: 'wardrobe-slide 2.8s cubic-bezier(0.25, 1, 0.5, 1) infinite',
                             zIndex: 10
                           }} 
                           alt="Product Flying" 
                         />
                      </div>

                      {/* Glowing Laser Scanner */}
                      <div style={{ 
                        position: 'absolute', left: 0, right: 0, height: '3px', 
                        background: '#FFF', 
                        boxShadow: '0 0 20px 8px rgba(255, 255, 255, 0.6), 0 0 40px 15px rgba(235, 77, 123, 0.4)',
                        animation: 'v-scan 2.5s cubic-bezier(0.4, 0, 0.2, 1) infinite',
                        zIndex: 20
                      }} />
                      
                      {/* Central Animation */}
                      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 30 }}>
                         <div style={{ 
                           width: 90, height: 90, borderRadius: '50%', 
                           border: '2px dashed rgba(255,255,255,0.4)', borderTop: '3px solid #FFF', borderRight: '3px solid #FFF',
                           animation: 'v-spin 2s linear infinite', 
                           display: 'flex', alignItems: 'center', justifyContent: 'center',
                           backgroundColor: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(2px)'
                         }}>
                            <div style={{ animation: 'v-spin 2s linear infinite reverse' }}>
                               <span style={{ fontSize: 36, animation: 'v-pulse-glow 1.5s infinite', display: 'block' }}>✨</span>
                            </div>
                         </div>
                         <h3 style={{ color: '#fff', fontSize: '16px', fontWeight: '900', letterSpacing: '4px', marginTop: '35px', textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>
                           FITTING ROOM
                         </h3>
                         <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '10px', fontWeight: '700', letterSpacing: '2px', marginTop: '12px', textShadow: '0 1px 5px rgba(0,0,0,0.5)' }}>
                           APPLYING GARMENT...
                         </p>
                      </div>
                   </div>
                 ) : resultUri ? (
                   <img src={resultUri} style={styles.finalRender} alt="Result" />
                 ) : (
                   <div style={styles.emptyState}>
                      <img src={product.image} style={styles.bgGhost} alt="Background" />
                      <div style={styles.overlayText}>
                         <span style={{ fontSize: 48 }}>✨</span>
                         <h2 style={styles.emptyTitle}>STUDIO READY</h2>
                      </div>
                   </div>
                 )}
              </div>
                {resultUri && (
                   <button style={styles.bagBtn} onClick={() => navigate('/checkout', { state: { product, qty: 1 } })}>
                      ADD THIS LOOK TO BAG
                   </button>
                )}
             </div>
          </section>
        </div>
      </main>
    </div>
  );
}

