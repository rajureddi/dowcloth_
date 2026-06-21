import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { NAV_CATEGORIES, PRODUCTS } from '../data/products';

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const { totalItems, setIsOpen } = useCart();
  const { count: wishlistCount } = useWishlist();

  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [megaMenu, setMegaMenu] = useState(null);
  const searchRef = useRef(null);
  const megaTimerRef = useRef(null);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 12);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setSearchOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!searchQuery.trim()) { setSearchResults([]); return; }
    const q = searchQuery.toLowerCase();
    const results = PRODUCTS.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.brand.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      p.subCategory.toLowerCase().includes(q) ||
      (p.tags || []).some(t => t.toLowerCase().includes(q))
    ).slice(0, 6);
    setSearchResults(results);
  }, [searchQuery]);

  const openMega = (id) => {
    clearTimeout(megaTimerRef.current);
    setMegaMenu(id);
  };
  const closeMega = () => {
    megaTimerRef.current = setTimeout(() => setMegaMenu(null), 150);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchOpen(false);
    }
  };

  return (
    <>
      {/* Announcement Bar */}
      <div style={{
        background: 'linear-gradient(90deg, #0A0A0A 0%, #1a1a2e 100%)',
        color: '#fff',
        textAlign: 'center',
        padding: '9px 16px',
        fontSize: '12px',
        fontWeight: 500,
        letterSpacing: '0.5px',
      }}>
        ⚡ FREE delivery in <strong>60 minutes</strong> · Bengaluru & Hyderabad &nbsp;|&nbsp; Use code{' '}
        <strong style={{ color: '#C9A96E' }}>FAST60</strong> for extra 10% off
      </div>

      <header className={`dc-header${scrolled ? ' scrolled' : ''}`}>
        <div className="dc-header-inner">
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            {/* Hamburger (mobile) */}
            <button className="dc-hamburger" onClick={() => setMobileOpen(true)} aria-label="Menu">
              <span /><span /><span />
            </button>

            {/* Logo */}
            <div className="dc-logo" onClick={() => navigate('/')} style={{ display: 'flex', alignItems: 'center', margin: 0, marginLeft: '-15px' }}>
              <div style={{ height: '60px', width: '180px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }}>
                <img src="/logo.png?v=3" alt="DowCloth Logo" style={{ height: '160px', width: 'auto', objectFit: 'contain', mixBlendMode: 'multiply', transform: 'translateX(-10px)' }} />
              </div>
            </div>
          </div>

          {/* Desktop Nav */}
          <nav className="dc-nav" style={{ position: 'relative' }}>
            {NAV_CATEGORIES.map(cat => (
              <div
                key={cat.id}
                style={{ position: 'relative' }}
                onMouseEnter={() => openMega(cat.id)}
                onMouseLeave={closeMega}
              >
                <button
                  className={`dc-nav-item${megaMenu === cat.id ? ' active' : ''}`}
                  onClick={() => navigate(`/category/${cat.id}`)}
                >
                  {cat.label}
                  <svg style={{ marginLeft: 4, opacity: 0.5, transition: 'transform 0.2s', transform: megaMenu === cat.id ? 'rotate(180deg)' : 'none' }}
                    width="10" height="6" viewBox="0 0 10 6" fill="currentColor">
                    <path d="M0 0l5 6 5-6z" />
                  </svg>
                </button>

                {megaMenu === cat.id && (
                  <div
                    className="dc-mega-menu"
                    onMouseEnter={() => openMega(cat.id)}
                    onMouseLeave={closeMega}
                    style={{ position: 'absolute', top: 'calc(100% + 10px)', left: '50%', transform: 'translateX(-50%)', minWidth: 200, padding: '12px 0' }}
                  >
                    {cat.items.map(item => (
                      <button
                        key={item.label}
                        style={{
                          display: 'block', width: '100%', textAlign: 'left',
                          padding: '9px 20px', fontSize: 14, color: '#333',
                          background: 'none', border: 'none', cursor: 'pointer',
                          transition: 'background 0.15s',
                          fontFamily: 'var(--font-body)',
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = 'var(--dc-surface)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'none'}
                        onClick={() => { navigate(`/category/${cat.id}?sub=${item.label}`); setMegaMenu(null); }}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
            <button className="dc-nav-item" onClick={() => navigate('/fashion-assistant')}>
              AI Stylist ✨
            </button>
            <button className="dc-nav-item" onClick={() => navigate('/ai-style-finder')} style={{ color: 'var(--dc-accent)' }}>
              Style Finder 🪄
            </button>
          </nav>

          {/* Action Icons */}
          <div className="dc-header-actions">
            <button className="dc-header-btn" onClick={() => navigate('/ai-style-finder')} title="AI Style Finder">
              🪄
            </button>
            <button className="dc-header-btn" onClick={() => navigate('/fashion-assistant')} title="AI Fashion Assistant">
              <img src="/chat.png?v=3" alt="Chatbot" style={{ width: '50px', height: '50px', objectFit: 'contain', position: 'absolute', transform: 'scale(1.2)' }} />
            </button>
            <button className="dc-header-btn" onClick={() => setIsOpen(true)} title="Shopping Cart">
              <img src="/Cart.png" alt="Cart" style={{ width: '24px', height: '24px', objectFit: 'contain' }} />
              {totalItems > 0 && <span className="dc-badge-count" style={{ background: 'var(--dc-red)' }}>{totalItems}</span>}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {mobileOpen && <div className="dc-overlay" onClick={() => setMobileOpen(false)} style={{ zIndex: 699 }} />}

      {/* Mobile Menu Drawer */}
      <div className={`dc-mobile-menu${mobileOpen ? ' open' : ''}`} style={{ zIndex: 700 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '15px 20px', borderBottom: '1px solid var(--dc-border-light)' }}>
          <div className="dc-logo" onClick={() => { navigate('/'); setMobileOpen(false); }} style={{ display: 'flex', alignItems: 'center', margin: 0 }}>
            <div style={{ height: '48px', width: '140px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <img src="/logo.png?v=3" alt="DowCloth Logo" style={{ height: '120px', width: 'auto', objectFit: 'contain', mixBlendMode: 'multiply' }} />
            </div>
          </div>
          <button onClick={() => setMobileOpen(false)} style={{ fontSize: 22, background: 'none', border: 'none', cursor: 'pointer' }}>✕</button>
        </div>
        <div style={{ padding: '16px 0', flex: 1 }}>
          {NAV_CATEGORIES.map(cat => (
            <div key={cat.id}>
              <button
                style={{ display: 'block', width: '100%', textAlign: 'left', padding: '14px 20px', fontSize: 16, fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', borderBottom: '1px solid var(--dc-border-light)', fontFamily: 'var(--font-body)' }}
                onClick={() => { navigate(`/category/${cat.id}`); setMobileOpen(false); }}
              >
                {cat.label}
              </button>
            </div>
          ))}
          <button
            style={{ display: 'block', width: '100%', textAlign: 'left', padding: '14px 20px', fontSize: 16, fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', borderBottom: '1px solid var(--dc-border-light)', fontFamily: 'var(--font-body)', color: 'var(--dc-accent)' }}
            onClick={() => { navigate('/fashion-assistant'); setMobileOpen(false); }}
          >
            ✨ AI Stylist
          </button>
          <button
            style={{ display: 'block', width: '100%', textAlign: 'left', padding: '14px 20px', fontSize: 16, fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', borderBottom: '1px solid var(--dc-border-light)', fontFamily: 'var(--font-body)', color: 'var(--dc-accent)' }}
            onClick={() => { navigate('/ai-style-finder'); setMobileOpen(false); }}
          >
            🪄 Style Finder
          </button>
        </div>
        <div style={{ padding: '20px' }}>
          <button className="dc-btn dc-btn-primary dc-btn-full" onClick={() => navigate('/order-tracking')}>
            📍 Track Order
          </button>
        </div>
      </div>
    </>
  );
}
