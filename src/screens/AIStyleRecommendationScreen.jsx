import React, { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { PRODUCTS } from '../data/products';
import ProductCard from '../components/ProductCard';

/* ── Gender keyword filter ── */
const GENDER_KEYS = {
  male:   ['men', 'mens'],
  female: ['women', 'womens', 'girls'],
};

/* ── Body type → preferred subcategories by gender ── */
const BODY_TYPE_SUBCATS_MALE = {
  'Slim':         ['Shirts', 'T-Shirts', 'Blazers', 'Bottomwear'],
  'Athletic':     ['T-Shirts', 'Shirts', 'Hoodies', 'Bottomwear'],
  'Average':      ['Shirts', 'T-Shirts', 'Ethnic', 'Blazers'],
  'Tall-Slim':    ['Blazers', 'Shirts', 'Bottomwear', 'T-Shirts'],
  'Tall-Athletic':['Hoodies', 'Shirts', 'T-Shirts', 'Blazers'],
  'Curvy':        ['Shirts', 'Blazers', 'T-Shirts', 'Hoodies'],
  'Plus-Size':    ['Ethnic', 'Shirts', 'Blazers', 'T-Shirts'],
  'Petite':       ['Shirts', 'T-Shirts', 'Ethnic', 'Bottomwear'],
};

const BODY_TYPE_SUBCATS_FEMALE = {
  'Petite':       ['Dresses', 'Tops', 'Ethnic'],
  'Slim':         ['Dresses', 'Tops', 'Ethnic', 'Blazers'],
  'Athletic':     ['Tops', 'Dresses', 'Hoodies', 'Bottomwear'],
  'Average':      ['Dresses', 'Tops', 'Ethnic', 'Blazers'],
  'Curvy':        ['Dresses', 'Ethnic', 'Blazers', 'Tops'],
  'Plus-Size':    ['Ethnic', 'Dresses', 'Blazers', 'Tops'],
  'Tall-Slim':    ['Blazers', 'Dresses', 'Tops', 'Bottomwear'],
  'Tall-Athletic':['Hoodies', 'Tops', 'Dresses', 'Blazers'],
};

/* ── Match products to analysis, filtered by gender ── */
function matchProducts(analysis, gender) {
  const g = gender || 'female';
  if (!analysis || !analysis.bodyType) return PRODUCTS.slice(0, 8);
  const bodyLabel  = analysis.bodyType?.label || 'Average';
  const styleKeys  = analysis.styleProfile?.style_keywords || [];
  const subcatMap  = g === 'male' ? BODY_TYPE_SUBCATS_MALE : BODY_TYPE_SUBCATS_FEMALE;
  const subcats    = subcatMap[bodyLabel] || (g === 'male' ? ['Shirts', 'T-Shirts'] : ['Tops', 'Dresses']);
  const colorWords = (analysis.styleProfile?.recommended_colors || []).map(c => c.toLowerCase());
  const genderKeys = GENDER_KEYS[g] || [];

  // Filter by gender category — exact match on category field
  const pool = PRODUCTS.filter(p => {
    const cat = (p.category || '').toLowerCase().trim();
    if (g === 'male')   return cat === 'men';
    if (g === 'female') return cat === 'women';
    return true;
  });
  const safePool = pool.length >= 4 ? pool : PRODUCTS;

  const scored = safePool.map(p => {
    let score = 0;
    if (subcats.includes(p.subCategory)) score += 4;
    if (p.isTrending)                    score += 2;
    if (p.isBestSeller)                  score += 1;
    if (p.rating >= 4.5)                 score += 2;
    styleKeys.forEach(k => {
      if ((p.tags || []).some(t => t.toLowerCase().includes(k.toLowerCase()))) score += 3;
      if (p.name.toLowerCase().includes(k.toLowerCase())) score += 1;
    });
    p.colors?.forEach(c => {
      colorWords.forEach(cw => {
        const cName = typeof c === 'string' ? c : (c?.name || '');
        if (cName.toLowerCase().includes(cw.slice(0, 5))) score += 2;
      });
    });
    return { ...p, _score: score };
  });

  return scored.sort((a, b) => b._score - a._score).slice(0, 8);
}

/* ── Step indicator ── */
function Steps({ current }) {
  const steps = ['Upload Photo', 'AI Analysis', 'Your Picks'];
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0, marginBottom: 40 }}>
      {steps.map((s, i) => (
        <React.Fragment key={s}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
            <div style={{
              width: 36, height: 36, borderRadius: '50%', border: '2px solid',
              borderColor: i <= current ? '#C9A96E' : '#DDD',
              background: i < current ? '#C9A96E' : i === current ? '#0A0A0A' : '#fff',
              color: i < current ? '#fff' : i === current ? '#fff' : '#999',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 14, fontWeight: 700, transition: 'all 0.3s',
            }}>
              {i < current ? '✓' : i + 1}
            </div>
            <span style={{ fontSize: 11, fontWeight: 600, color: i === current ? '#0A0A0A' : '#999', letterSpacing: '0.5px' }}>{s}</span>
          </div>
          {i < steps.length - 1 && (
            <div style={{ height: 2, width: 80, background: i < current ? '#C9A96E' : '#EEE', margin: '0 4px', marginBottom: 22, transition: 'background 0.3s' }} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

/* ── Skin tone chip ── */
function SkinToneChip({ hex, label }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 16px', background: '#FAFAFA', borderRadius: 8, border: '1px solid #EEE' }}>
      <div style={{ width: 28, height: 28, borderRadius: '50%', background: hex, border: '2px solid rgba(0,0,0,0.08)', flexShrink: 0 }} />
      <div>
        <div style={{ fontSize: 13, fontWeight: 700 }}>{label}</div>
        <div style={{ fontSize: 10, color: '#999', fontFamily: 'monospace' }}>{hex}</div>
      </div>
    </div>
  );
}

/* ── Color chip ── */
function ColorPill({ color, avoid = false }) {
  const colorMap = {
    'navy': '#1B2A4A', 'navy blue': '#1B2A4A', 'coral': '#FF6B6B', 'coral red': '#FF6B6B',
    'olive': '#808000', 'olive green': '#556B2F', 'burgundy': '#800020', 'cream': '#FFFDD0',
    'white': '#F8F8F8', 'black': '#1A1A1A', 'beige': '#F5F0E8', 'blush': '#FFB6C1',
    'mustard': '#E1A817', 'teal': '#008080', 'terracotta': '#C25B3B', 'sage': '#8FBC8F',
    'lavender': '#E6E6FA', 'peach': '#FFCBA4', 'mint': '#98FF98', 'gold': '#C9A96E',
    'rust': '#B7410E', 'maroon': '#800000', 'forest green': '#228B22', 'sky blue': '#87CEEB',
    'pastel pink': '#FFB6C1', 'emerald': '#50C878', 'ivory': '#FFFFF0', 'charcoal': '#36454F',
  };
  const key = color.toLowerCase();
  const bg = Object.entries(colorMap).find(([k]) => key.includes(k))?.[1] || '#CCC';
  const isDark = parseInt(bg.slice(1, 3), 16) + parseInt(bg.slice(3, 5), 16) + parseInt(bg.slice(5, 7), 16) < 380;

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 6, padding: '5px 12px',
      background: avoid ? '#FFF5F5' : '#F8F8F8',
      border: `1px solid ${avoid ? '#FFCCCC' : '#EEE'}`, borderRadius: 999,
      fontSize: 12, fontWeight: 600, color: avoid ? '#CC0000' : '#333',
    }}>
      {!avoid && <div style={{ width: 12, height: 12, borderRadius: '50%', background: bg, border: '1px solid rgba(0,0,0,0.1)', flexShrink: 0 }} />}
      {avoid && <span>✕</span>}
      {color}
    </div>
  );
}

/* ═══ MAIN SCREEN ═══ */
export default function AIStyleRecommendationScreen() {
  const navigate = useNavigate();
  const fileRef  = useRef(null);
  const [step,        setStep]        = useState(0);       // 0=upload, 1=analyzing, 2=results
  const [bodyPart,    setBodyPart]    = useState('full');
  const [gender,      setGender]      = useState('male');  // 'male' | 'female'
  const [imageFile,   setImageFile]   = useState(null);
  const [imagePreview,setImagePreview]= useState(null);
  const [analysis,    setAnalysis]    = useState(null);
  const [products,    setProducts]    = useState([]);
  const [error,       setError]       = useState(null);
  const [dragging,    setDragging]    = useState(false);
  const [loadingText, setLoadingText] = useState('Uploading photo...');

  /* ── Drag & Drop ── */
  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) processFile(file);
  }, []);

  const processFile = (file) => {
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setImagePreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  /* ── Analyze ── */
  const handleAnalyze = async () => {
    if (!imageFile) return;
    setStep(1);
    setError(null);

    // Animate loading texts
    const msgs = [
      'Uploading your photo securely...',
      'Detecting skin tone...',
      'Analysing body proportions...',
      'Building your style profile...',
      'Matching clothes from catalog...',
    ];
    let i = 0;
    setLoadingText(msgs[0]);
    const txtTimer = setInterval(() => {
      i = Math.min(i + 1, msgs.length - 1);
      setLoadingText(msgs[i]);
    }, 2200);

    try {
      // Convert file to base64 (strip data URL prefix)
      const base64 = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload  = () => resolve(reader.result.split(',')[1]);
        reader.onerror = reject;
        reader.readAsDataURL(imageFile);
      });

      const res = await fetch('/api/analyze-body', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: base64, bodyPart, gender }),
      });

      clearInterval(txtTimer);

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Server error');
      }

      const data = await res.json();
      if (!data.success) throw new Error('Analysis failed');

      const an = data.analysis;
      setAnalysis(an);
      setProducts(matchProducts(an, gender));
      setStep(2);
    } catch (err) {
      clearInterval(txtTimer);
      setError(err.message || 'Something went wrong. Please try again.');
      setStep(0);
    }
  };

  /* ── Reset ── */
  const handleReset = () => {
    setStep(0);
    setImageFile(null);
    setImagePreview(null);
    setAnalysis(null);
    setProducts([]);
    setError(null);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#FAFAFA' }}>
      {/* Header */}
      <div style={{ background: '#0A0A0A', padding: '20px 0', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.6)', fontSize: 13, fontWeight: 600, fontFamily: 'var(--font-body)', display: 'flex', alignItems: 'center', gap: 6 }}>
            ← Back
          </button>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, color: '#fff', letterSpacing: '-0.3px' }}>
              ✨ AI Style Finder
            </div>
            <div style={{ fontSize: 11, color: '#C9A96E', fontWeight: 600, letterSpacing: '1px', marginTop: 2 }}>
              POWERED BY GEMINI VISION
            </div>
          </div>
          <div style={{ width: 60 }} />
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '48px 24px' }}>
        <Steps current={step} />

        {/* ───────── STEP 0: UPLOAD ───────── */}
        {step === 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.1fr', gap: 40, alignItems: 'start' }}>
            {/* Left: Controls */}
            <div>
              <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 700, marginBottom: 12, lineHeight: 1.2 }}>
                Get Your <span style={{ color: '#C9A96E' }}>Personalized</span><br />Style Recommendations
              </h1>
              <p style={{ fontSize: 15, color: '#555', lineHeight: 1.7, marginBottom: 32 }}>
                Upload a photo and our AI stylist will analyse your skin tone, body type, and proportions to recommend clothes that will look amazing on you.
              </p>

              {/* Gender Selector */}
              <div style={{ marginBottom: 24 }}>
                <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 12, color: '#555' }}>
                  I am shopping for...
                </div>
                <div style={{ display: 'flex', gap: 12 }}>
                  {[
                    { id: 'male',   icon: '👨', label: 'Men' },
                    { id: 'female', icon: '👩', label: 'Women' },
                  ].map(g => (
                    <button
                      key={g.id}
                      onClick={() => setGender(g.id)}
                      style={{
                        flex: 1, padding: '16px 8px', borderRadius: 12, cursor: 'pointer',
                        border: `2px solid ${gender === g.id ? '#C9A96E' : '#DDD'}`,
                        background: gender === g.id ? '#0A0A0A' : '#fff',
                        color: gender === g.id ? '#fff' : '#555',
                        fontSize: 14, fontWeight: 700, textAlign: 'center', transition: 'all 0.25s',
                        fontFamily: 'var(--font-body)',
                        boxShadow: gender === g.id ? '0 4px 16px rgba(0,0,0,0.18)' : 'none',
                      }}
                    >
                      <div style={{ fontSize: 30, marginBottom: 6 }}>{g.icon}</div>
                      {g.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Body Part Selector */}
              <div style={{ marginBottom: 28 }}>
                <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 12, color: '#555' }}>
                  What does your photo show?
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  {[
                    { id: 'full',  icon: '🧍', label: 'Full Body' },
                    { id: 'upper', icon: '👤', label: 'Upper Body' },
                    { id: 'lower', icon: '🦵', label: 'Lower Body' },
                  ].map(bp => (
                    <button
                      key={bp.id}
                      onClick={() => setBodyPart(bp.id)}
                      style={{
                        flex: 1, padding: '14px 8px', borderRadius: 10, cursor: 'pointer',
                        border: `2px solid ${bodyPart === bp.id ? '#0A0A0A' : '#DDD'}`,
                        background: bodyPart === bp.id ? '#0A0A0A' : '#fff',
                        color: bodyPart === bp.id ? '#fff' : '#333',
                        fontSize: 13, fontWeight: 600, textAlign: 'center', transition: 'all 0.2s',
                        fontFamily: 'var(--font-body)',
                      }}
                    >
                      <div style={{ fontSize: 24, marginBottom: 4 }}>{bp.icon}</div>
                      {bp.label}
                    </button>
                  ))}
                </div>
              </div>


              {/* Tips */}
              <div style={{ background: '#F0F7FF', borderRadius: 10, padding: '16px 18px', borderLeft: '3px solid #2563EB' }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#1565C0', marginBottom: 8, letterSpacing: '0.5px' }}>📸 FOR BEST RESULTS</div>
                <ul style={{ margin: 0, padding: '0 0 0 16px', fontSize: 13, color: '#333', lineHeight: 1.9 }}>
                  <li>Stand in good natural lighting</li>
                  <li>Wear fitting (not baggy) clothing</li>
                  <li>Face the camera directly</li>
                  <li>Full-body photo gives most accurate results</li>
                </ul>
              </div>

              {error && (
                <div style={{ marginTop: 16, padding: '14px 16px', background: '#FFF5F5', border: '1px solid #FFCCCC', borderRadius: 8, color: '#CC0000', fontSize: 13 }}>
                  ⚠️ {error}
                </div>
              )}
            </div>

            {/* Right: Upload Zone */}
            <div>
              <div
                onDragOver={e => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleDrop}
                onClick={() => !imagePreview && fileRef.current?.click()}
                style={{
                  border: `2px dashed ${dragging ? '#C9A96E' : imagePreview ? '#0A0A0A' : '#DDD'}`,
                  borderRadius: 16, background: dragging ? '#FFF9F0' : imagePreview ? '#FAFAFA' : '#fff',
                  aspectRatio: '3/4', position: 'relative', overflow: 'hidden',
                  cursor: imagePreview ? 'default' : 'pointer', transition: 'all 0.2s',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                {imagePreview ? (
                  <>
                    <img src={imagePreview} alt="Your photo" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 14 }} />
                    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(transparent, rgba(0,0,0,0.7))', padding: '24px 20px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ color: '#fff', fontSize: 13, fontWeight: 600 }}>✓ Photo ready</span>
                      <button onClick={handleReset} style={{ background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.3)', color: '#fff', borderRadius: 6, padding: '6px 12px', cursor: 'pointer', fontSize: 12, fontFamily: 'var(--font-body)', fontWeight: 600 }}>
                        Change
                      </button>
                    </div>
                    {/* Privacy badge */}
                    <div style={{ position: 'absolute', top: 12, left: 12, background: 'rgba(0,0,0,0.75)', borderRadius: 6, padding: '4px 10px', display: 'flex', alignItems: 'center', gap: 5 }}>
                      <span style={{ fontSize: 11 }}>🔒</span>
                      <span style={{ fontSize: 10, color: '#fff', fontWeight: 600 }}>Private & Secure</span>
                    </div>
                  </>
                ) : (
                  <div style={{ textAlign: 'center', padding: 32 }}>
                    <div style={{ fontSize: 56, marginBottom: 16 }}>📸</div>
                    <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>
                      {dragging ? 'Drop your photo here!' : 'Upload Your Photo'}
                    </div>
                    <div style={{ fontSize: 13, color: '#999', marginBottom: 20 }}>
                      Drag & drop or click to browse<br />
                      <span style={{ fontSize: 11 }}>JPG, PNG · Max 10MB</span>
                    </div>
                    <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
                      <label style={{ cursor: 'pointer' }}>
                        <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => { if (e.target.files[0]) processFile(e.target.files[0]); }} />
                        <span style={{ padding: '10px 20px', background: '#0A0A0A', color: '#fff', borderRadius: 8, fontSize: 13, fontWeight: 700 }}>📂 From Gallery</span>
                      </label>
                      <label style={{ cursor: 'pointer' }}>
                        <input type="file" accept="image/*" capture="user" style={{ display: 'none' }} onChange={e => { if (e.target.files[0]) processFile(e.target.files[0]); }} />
                        <span style={{ padding: '10px 20px', background: '#F5F5F5', color: '#333', border: '1px solid #DDD', borderRadius: 8, fontSize: 13, fontWeight: 700 }}>📷 Camera</span>
                      </label>
                    </div>
                  </div>
                )}
              </div>

              {imagePreview && (
                <button
                  onClick={handleAnalyze}
                  style={{
                    width: '100%', marginTop: 16, padding: '18px 0', background: 'linear-gradient(135deg, #0A0A0A, #2d1b69)',
                    color: '#fff', border: 'none', borderRadius: 12, fontSize: 15, fontWeight: 700, cursor: 'pointer',
                    fontFamily: 'var(--font-body)', letterSpacing: '0.5px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                    transition: 'opacity 0.2s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
                  onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                >
                  <span style={{ fontSize: 20 }}>✨</span>
                  Analyse My Style with AI
                </button>
              )}

              <p style={{ textAlign: 'center', fontSize: 11, color: '#AAA', marginTop: 12 }}>
                🔒 Your photo is analysed privately and never stored
              </p>
            </div>
          </div>
        )}

        {/* ───────── STEP 1: LOADING ───────── */}
        {step === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 480, textAlign: 'center' }}>
            <div style={{ position: 'relative', marginBottom: 40 }}>
              {/* Photo thumbnail */}
              {imagePreview && (
                <img src={imagePreview} alt="Analysing" style={{ width: 140, height: 180, objectFit: 'cover', borderRadius: 16, opacity: 0.6 }} />
              )}
              {/* Scanning overlay */}
              <div style={{
                position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, borderRadius: 16,
                background: 'linear-gradient(transparent 0%, rgba(201,169,110,0.15) 40%, rgba(201,169,110,0.4) 50%, rgba(201,169,110,0.15) 60%, transparent 100%)',
                animation: 'scan-line 2s linear infinite',
                backgroundSize: '100% 200%',
              }} />
              {/* Pulse rings */}
              <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 60, height: 60, borderRadius: '50%', border: '3px solid #C9A96E', animation: 'pulse-ring 1.5s ease-out infinite' }} />
            </div>

            {/* AI brain animation */}
            <div style={{ fontSize: 48, marginBottom: 20, animation: 'spin 3s linear infinite' }}>🤖</div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 600, marginBottom: 12 }}>
              Analysing Your Style DNA
            </h2>
            <p style={{ fontSize: 15, color: '#666', marginBottom: 32, maxWidth: 420, lineHeight: 1.7 }}>
              {loadingText}
            </p>

            {/* Progress indicators */}
            <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', justifyContent: 'center' }}>
              {[
                { icon: '🎨', label: 'Skin Tone Detection' },
                { icon: '📐', label: 'Body Analysis' },
                { icon: '💡', label: 'Style Matching' },
                { icon: '👗', label: 'Outfit Curation' },
              ].map((item, i) => (
                <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', background: '#fff', borderRadius: 999, border: '1px solid #EEE', fontSize: 13, color: '#555', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                  <span>{item.icon}</span>
                  <span style={{ fontWeight: 500 }}>{item.label}</span>
                  <span style={{ color: '#C9A96E', fontWeight: 700, animation: `fade-pulse ${1 + i * 0.3}s ease-in-out infinite` }}>...</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ───────── STEP 2: RESULTS ───────── */}
        {step === 2 && analysis && (
          <div>
            {/* Results Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 40, flexWrap: 'wrap', gap: 16 }}>
              <div>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 30, fontWeight: 700, marginBottom: 6 }}>
                  ✨ Your Style Profile
                </h2>
                <p style={{ color: '#666', fontSize: 15 }}>Based on AI analysis of your photo</p>
              </div>
              <button onClick={handleReset} style={{ padding: '10px 20px', background: '#fff', border: '1.5px solid #DDD', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600, fontFamily: 'var(--font-body)', color: '#333' }}>
                ↩ Analyse Again
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: 32, marginBottom: 48 }}>
              {/* Left: Photo + quick cards */}
              <div>
                {imagePreview && (
                  <div style={{ position: 'relative', borderRadius: 16, overflow: 'hidden', marginBottom: 20, aspectRatio: '3/4' }}>
                    <img src={imagePreview} alt="You" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(transparent, rgba(0,0,0,0.75))', padding: '32px 16px 16px' }}>
                      <div style={{ color: '#fff', fontSize: 14, fontWeight: 700 }}>{analysis.bodyType?.label}</div>
                      <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 11, marginTop: 2 }}>{analysis.bodyFit?.label} · {analysis.bodyFit?.weight_category}</div>
                    </div>
                  </div>
                )}
                {/* Personality vibes */}
                <div style={{ background: 'linear-gradient(135deg, #0A0A0A, #1a1a2e)', borderRadius: 12, padding: '20px', marginBottom: 16 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '1.5px', color: '#C9A96E', marginBottom: 12 }}>YOUR FASHION PERSONALITY</div>
                  {(analysis.personalityVibes || []).map(v => (
                    <div key={v} style={{ padding: '8px 12px', background: 'rgba(255,255,255,0.08)', borderRadius: 6, marginBottom: 6, fontSize: 13, color: '#fff', fontWeight: 500 }}>
                      ✦ {v}
                    </div>
                  ))}
                </div>
              </div>

              {/* Right: Analysis cards */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                {/* Stylist Note */}
                {analysis.stylistNote && (
                  <div style={{ background: 'linear-gradient(135deg, #FFF9F0, #FFF5E8)', borderRadius: 12, padding: '20px 24px', border: '1px solid #F0D9A0' }}>
                    <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '1.5px', color: '#C9A96E', marginBottom: 10 }}>🌟 YOUR AI STYLIST SAYS</div>
                    <p style={{ fontSize: 15, color: '#4A3728', lineHeight: 1.7, fontStyle: 'italic' }}>
                      "{analysis.stylistNote}"
                    </p>
                  </div>
                )}

                {/* Skin Tone + Body Type */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div style={{ background: '#fff', borderRadius: 12, padding: '18px', border: '1px solid #EEE' }}>
                    <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '1.5px', color: '#888', marginBottom: 12 }}>SKIN TONE</div>
                    <SkinToneChip hex={analysis.skinTone?.hex || '#D2A679'} label={analysis.skinTone?.label || 'Wheatish'} />
                    <p style={{ fontSize: 12, color: '#666', marginTop: 10, lineHeight: 1.5 }}>{analysis.skinTone?.description}</p>
                  </div>
                  <div style={{ background: '#fff', borderRadius: 12, padding: '18px', border: '1px solid #EEE' }}>
                    <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '1.5px', color: '#888', marginBottom: 12 }}>BODY TYPE</div>
                    <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 6 }}>{analysis.bodyType?.label || '—'}</div>
                    <p style={{ fontSize: 12, color: '#666', lineHeight: 1.5 }}>{analysis.bodyType?.description}</p>
                  </div>
                </div>

                {/* Recommended Colors */}
                <div style={{ background: '#fff', borderRadius: 12, padding: '18px 20px', border: '1px solid #EEE' }}>
                  <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '1.5px', color: '#888', marginBottom: 14 }}>🎨 COLORS THAT SUIT YOU</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
                    {(analysis.styleProfile?.recommended_colors || []).map(c => <ColorPill key={c} color={c} />)}
                  </div>
                  {(analysis.styleProfile?.avoid_colors || []).length > 0 && (
                    <>
                      <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '1px', color: '#CC0000', marginBottom: 8, marginTop: 4 }}>AVOID THESE</div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                        {analysis.styleProfile.avoid_colors.map(c => <ColorPill key={c} color={c} avoid />)}
                      </div>
                    </>
                  )}
                </div>

                {/* Fits */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div style={{ background: '#fff', borderRadius: 12, padding: '18px', border: '1px solid #EEE' }}>
                    <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '1.5px', color: '#888', marginBottom: 12 }}>✓ RECOMMENDED FITS</div>
                    {(analysis.styleProfile?.recommended_fits || []).map(f => (
                      <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 0', fontSize: 13, color: '#333', borderBottom: '1px solid #F5F5F5' }}>
                        <span style={{ color: '#22C55E', fontWeight: 700 }}>✓</span> {f}
                      </div>
                    ))}
                  </div>
                  <div style={{ background: '#fff', borderRadius: 12, padding: '18px', border: '1px solid #EEE' }}>
                    <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '1.5px', color: '#888', marginBottom: 12 }}>✦ STYLE KEYWORDS</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {(analysis.styleProfile?.style_keywords || []).map(k => (
                        <span key={k} style={{ padding: '4px 10px', background: '#0A0A0A', color: '#fff', borderRadius: 999, fontSize: 11, fontWeight: 600 }}>{k}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Recommended Products */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
                <div>
                  <span style={{ fontSize: 11, color: '#C9A96E', fontWeight: 700, letterSpacing: '1.5px', display: 'block', marginBottom: 4 }}>PICKED FOR YOU</span>
                  <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 700 }}>
                    Your AI-Curated Wardrobe
                  </h2>
                </div>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                  <div style={{
                    padding: '6px 14px',
                    background: gender === 'male' ? '#EFF6FF' : '#FFF0F6',
                    border: `1px solid ${gender === 'male' ? '#BFDBFE' : '#FBCFE8'}`,
                    borderRadius: 999, fontSize: 12, fontWeight: 700,
                    color: gender === 'male' ? '#1D4ED8' : '#9D174D',
                  }}>
                    {gender === 'male' ? "👨 Men's Collection" : "👩 Women's Collection"}
                  </div>
                  <div style={{ padding: '6px 14px', background: '#F0FFF4', border: '1px solid #86EFAC', borderRadius: 999, fontSize: 12, color: '#166534', fontWeight: 600 }}>
                    🎯 Matched to your style
                  </div>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 24 }}>
                {products.map(p => <ProductCard key={p.id} product={p} />)}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add scanning animation CSS */}
      <style>{`
        @keyframes scan-line {
          0%   { background-position: 100% 0%; }
          100% { background-position: 100% 100%; }
        }
        @keyframes pulse-ring {
          0%   { transform: translate(-50%,-50%) scale(0.8); opacity: 1; }
          100% { transform: translate(-50%,-50%) scale(2);   opacity: 0; }
        }
        @keyframes fade-pulse {
          0%, 100% { opacity: 0.3; } 50% { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
