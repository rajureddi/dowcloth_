import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { PRODUCTS, BANNERS, CATEGORIES } from '../data/products';
import ProductCard from '../components/ProductCard';
import SkeletonCard from '../components/SkeletonCard';

/* ── Helpers ── */
function SectionHeader({ eyebrow, title, link, onLink }) {
  return (
    <div className="dc-section-header">
      <div>
        {eyebrow && <span className="dc-eyebrow">{eyebrow}</span>}
        <h2 className="dc-heading-2">{title}</h2>
      </div>
      {link && (
        <button className="dc-view-all" onClick={onLink}>{link} →</button>
      )}
    </div>
  );
}

function TrustBar() {
  const items = [
    { icon: '⚡', title: '60-Minute Delivery', desc: 'Lightning-fast delivery to Bengaluru & Hyderabad' },
    { icon: '↩️', title: 'Free Returns', desc: 'Hassle-free 7-day return policy' },
    { icon: '🔒', title: 'Secure Payments', desc: 'UPI, Cards, Net Banking — 100% encrypted' },
    { icon: '✅', title: '100% Genuine', desc: 'Only authentic products, guaranteed' },
  ];
  return (
    <div className="dc-trust-grid dc-container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px', padding: '24px 0' }}>
      {items.map(it => (
        <div key={it.title} className="dc-trust-item" style={{ textAlign: 'center' }}>
          <div className="dc-trust-icon" style={{ fontSize: '24px', marginBottom: '8px' }}>{it.icon}</div>
          <div className="dc-trust-title" style={{ fontWeight: '600', marginBottom: '4px' }}>{it.title}</div>
          <div className="dc-trust-desc" style={{ fontSize: '12px', color: 'var(--dc-text-muted)' }}>{it.desc}</div>
        </div>
      ))}
    </div>
  );
}

function HeroCarousel({ banners }) {
  const [active, setActive] = useState(0);
  const timerRef = useRef(null);

  const go = (idx) => {
    setActive((idx + banners.length) % banners.length);
  };

  useEffect(() => {
    timerRef.current = setInterval(() => go(active + 1), 5000);
    return () => clearInterval(timerRef.current);
  }, [active, banners.length]);

  if (!banners || banners.length === 0) return null;
  const b = banners[active];
  const navigate = useNavigate();

  return (
    <div className="dc-hero" style={{ position: 'relative' }}>
      <div className="dc-hero-slide" key={b.id}>
        <img
          className="dc-hero-image"
          src={b.image}
          alt={b.title}
          style={{ animation: 'hero-ken-burns 8s ease forwards', width: '100%', height: '100%', objectFit: 'cover' }}
        />
        <div className="dc-hero-overlay">
          <div className="dc-hero-content animate-slide-up">
            <span className="dc-eyebrow">{b.eyebrow}</span>
            <h1 className="dc-hero-title" style={{ whiteSpace: 'pre-line' }}>{b.title}</h1>
            <p className="dc-hero-subtitle">{b.subtitle}</p>
            <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
              <button
                className="dc-btn dc-btn-accent dc-btn-lg"
                onClick={() => navigate(`/category/${(b.ctaCategory || '').toLowerCase()}`)}
              >
                {b.cta}
              </button>
              <button
                className="dc-btn dc-btn-lg"
                style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', backdropFilter: 'blur(4px)', border: '1px solid rgba(255,255,255,0.3)' }}
                onClick={() => navigate('/fashion-assistant')}
              >
                ✨ AI Stylist
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Dot indicators */}
      <div style={{ position: 'absolute', bottom: 24, right: 32, display: 'flex', gap: 8, zIndex: 10 }}>
        {banners.map((_, i) => (
          <button
            key={i}
            onClick={() => { clearInterval(timerRef.current); setActive(i); }}
            style={{
              width: i === active ? 28 : 8, height: 8,
              borderRadius: 999, border: 'none', cursor: 'pointer',
              background: i === active ? '#fff' : 'rgba(255,255,255,0.4)',
              transition: 'all 0.35s ease',
            }}
          />
        ))}
      </div>

      {/* Arrows */}
      {[{dir:'←',fn:()=>go(active-1),pos:'left:20px'},{dir:'→',fn:()=>go(active+1),pos:'right:20px'}].map(a => (
        <button
          key={a.dir}
          onClick={() => { clearInterval(timerRef.current); a.fn(); }}
          style={{
            position: 'absolute', top: '50%', [a.pos.split(':')[0]]: a.pos.split(':')[1],
            transform: 'translateY(-50%)', width: 46, height: 46, borderRadius: '50%',
            background: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(4px)', border: '1px solid rgba(255,255,255,0.3)',
            color: '#fff', fontSize: 18, cursor: 'pointer', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'background 0.2s',
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.32)'}
          onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.18)'}
        >
          {a.dir}
        </button>
      ))}
    </div>
  );
}

function CategoryStrip({ active, onSelect }) {
  const navigate = useNavigate();
  return (
    <div className="dc-container" style={{ padding: '24px var(--side-pad)' }}>
      <div className="dc-cat-strip">
        {CATEGORIES.map(cat => (
          <button
            key={cat.id}
            className={`dc-cat-pill ${active === cat.name ? 'active' : ''}`}
            onClick={() => {
              onSelect(cat.name);
            }}
          >
            <span className="dc-cat-emoji">{cat.icon}</span>
            {cat.name}
          </button>
        ))}
      </div>
    </div>
  );
}

function EditorialSection() {
  const navigate = useNavigate();
  return (
    <section className="dc-section" style={{ background: 'var(--dc-surface)' }}>
      <div className="dc-container">
        <SectionHeader eyebrow="Collections" title="Explore by World" />
        <div className="dc-editorial-grid">
          {[
            {
              label: "Women's Edit",
              sub: 'Dresses · Tops · Ethnic · Blazers',
              cat: 'women',
              img: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=960',
            },
            {
              label: "Men's Edit",
              sub: 'Shirts · Jeans · Hoodies · Ethnic',
              cat: 'men',
              img: 'https://images.unsplash.com/photo-1617127365659-c47fa864d8bc?auto=format&fit=crop&q=80&w=960',
            },
          ].map(ed => (
            <div key={ed.cat} className="dc-editorial-card" onClick={() => navigate(`/category/${ed.cat}`)}>
              <img src={ed.img} alt={ed.label} />
              <div className="dc-editorial-overlay">
                <span className="dc-eyebrow" style={{ color: 'rgba(255,255,255,0.7)', marginBottom: 6 }}>{ed.sub}</span>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 600, color: '#fff', marginBottom: 14 }}>{ed.label}</h3>
                <button className="dc-btn dc-btn-sm" style={{ background: '#fff', color: '#0A0A0A', width: 'fit-content' }}>
                  Shop Now
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function AIFeatures() {
  const navigate = useNavigate();
  const features = [
    { icon: '🪄', title: 'AI Style Finder', desc: 'Upload your photo and our AI analyses your skin tone, body type, and proportions to recommend clothes that look amazing on you.', cta: 'Find My Style', path: '/ai-style-finder', color: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)', highlight: true },
    { icon: '👗', title: 'Virtual Try-On', desc: 'See how any outfit looks on you before buying — powered by AI body segmentation.', cta: 'Try It Free', path: null, color: 'linear-gradient(135deg, #1a1a2e, #16213e)' },
    { icon: '🤖', title: 'AI Fashion Stylist', desc: 'Chat with our AI to get personalized outfit recommendations for any occasion.', cta: 'Chat Now', path: '/fashion-assistant', color: 'linear-gradient(135deg, #2d1b69, #11998e)' },
    { icon: '🎨', title: 'Skin Tone Analysis', desc: 'Discover which colors and styles complement your unique complexion.', cta: 'Analyze Now', path: '/skin-tone-analysis', color: 'linear-gradient(135deg, #c94b4b, #4b134f)' },
  ];
  return (
    <section className="dc-section" style={{ background: '#0A0A0A' }}>
      <div className="dc-container">
        <div className="dc-section-header" style={{ marginBottom: 48 }}>
          <div style={{ textAlign: 'center', width: '100%' }}>
            <span className="dc-eyebrow" style={{ display: 'block', textAlign: 'center', marginBottom: 8 }}>Powered by AI</span>
            <h2 className="dc-heading-2" style={{ color: '#fff' }}>Fashion Intelligence</h2>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
          {features.map(f => (
            <div
              key={f.title}
              className="dc-hover-lift"
              style={{ background: f.color, borderRadius: 16, padding: '36px 28px', cursor: 'pointer', border: f.highlight ? '1px solid rgba(201,169,110,0.4)' : '1px solid rgba(255,255,255,0.08)', position: 'relative', overflow: 'hidden' }}
              onClick={() => f.path && navigate(f.path)}
            >
              {f.highlight && (
                <div style={{ position: 'absolute', top: 14, right: 14, background: '#C9A96E', color: '#0A0A0A', fontSize: 9, fontWeight: 800, letterSpacing: '1px', padding: '3px 8px', borderRadius: 999 }}>NEW ✦</div>
              )}
              <div style={{ fontSize: 44, marginBottom: 20 }}>{f.icon}</div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 600, color: '#fff', marginBottom: 12 }}>{f.title}</h3>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.65)', lineHeight: 1.7, marginBottom: 24 }}>{f.desc}</p>
              <button
                className="dc-btn dc-btn-sm"
                style={{ background: f.highlight ? '#C9A96E' : 'rgba(255,255,255,0.15)', color: f.highlight ? '#0A0A0A' : '#fff', border: f.highlight ? 'none' : '1px solid rgba(255,255,255,0.25)', backdropFilter: 'blur(4px)', fontWeight: 700 }}
                onClick={e => { e.stopPropagation(); f.path && navigate(f.path); }}
              >
                {f.cta} →
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Testimonials() {
  const reviews = [
    { name: 'Priya Sharma', city: 'Bengaluru', rating: 5, text: 'Ordered a dress at 3pm and it arrived by 4pm. The quality is absolutely stunning — feels like a premium boutique experience at everyday prices!', avatar: '👩' },
    { name: 'Arjun Reddy', city: 'Hyderabad', rating: 5, text: 'The AI stylist recommended an outfit for my job interview. I got the job! The clothes fit perfectly and arrived in under 45 minutes.', avatar: '👨' },
    { name: 'Meera Nair', city: 'Bengaluru', rating: 5, text: 'DowCloth is my go-to for last-minute festival outfits. The ethnic collection is gorgeous and the virtual try-on feature is a game changer!', avatar: '👩‍🦱' },
  ];
  return (
    <section className="dc-section" style={{ background: 'var(--dc-surface)' }}>
      <div className="dc-container">
        <SectionHeader eyebrow="Customer Love" title="What Our Shoppers Say" />
        <div className="dc-testimonial-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
          {reviews.map(r => (
            <div key={r.name} className="dc-testimonial-card dc-hover-lift" style={{ background: '#fff', padding: '24px', borderRadius: '12px' }}>
              <div style={{ display: 'flex', gap: 2, marginBottom: 16 }}>
                {[...Array(r.rating)].map((_, i) => <span key={i} style={{ color: '#F59E0B', fontSize: 16 }}>★</span>)}
              </div>
              <p className="dc-testimonial-text" style={{ fontStyle: 'italic', marginBottom: '16px' }}>"{r.text}"</p>
              <div className="dc-testimonial-author" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div className="dc-author-avatar" style={{ fontSize: '32px' }}>{r.avatar}</div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--dc-text-primary)' }}>{r.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--dc-text-muted)' }}>{r.city} · Verified Buyer</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══ MAIN HOME SCREEN ═══ */
export default function HomeScreen() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('For You');

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 700);
    return () => clearTimeout(t);
  }, []);

  const filteredProducts = activeCategory === 'For You' 
    ? PRODUCTS 
    : PRODUCTS.filter(p => p.category === activeCategory);

  // Prioritize Pinterest images in Trending Now
  const trending = [...filteredProducts].sort((a, b) => {
    const aPin = a.brand === 'DowCloth Pinterest Edit' ? 1 : 0;
    const bPin = b.brand === 'DowCloth Pinterest Edit' ? 1 : 0;
    return bPin - aPin;
  }).slice(0, 8);

  const newArrivals = filteredProducts.slice(4, 14);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--dc-white)' }}>
      {/* Hero Carousel */}
      <HeroCarousel banners={BANNERS} />

      {/* Trust Bar */}
      <div className="dc-section-sm" style={{ borderBottom: '1px solid var(--dc-border-light)' }}>
        <TrustBar />
      </div>

      {/* Category Strip */}
      <CategoryStrip active={activeCategory} onSelect={setActiveCategory} />

      {/* Trending Now */}
      <section className="dc-section">
        <div className="dc-container">
          <SectionHeader
            eyebrow="What's Hot"
            title="Trending Now"
            link="View All"
            onLink={() => navigate('/category/women')}
          />
          {loading ? (
            <div className="dc-product-grid dc-product-grid-4">
              {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : (
            <div className="dc-product-grid dc-product-grid-4">
              {trending.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          )}
        </div>
      </section>

      {/* Editorial Collections */}
      <EditorialSection />

      {/* New Arrivals */}
      <section className="dc-section">
        <div className="dc-container">
          <SectionHeader
            eyebrow="Fresh Drops"
            title="New Arrivals"
            link="See All New"
            onLink={() => navigate('/category/women')}
          />
          <div className="dc-product-grid dc-product-grid-5">
            {newArrivals.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        </div>
      </section>

      {/* AI Features */}
      <AIFeatures />

      {/* Testimonials */}
      <Testimonials />
    </div>
  );
}
