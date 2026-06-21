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
          {/* Hamburger (mobile) */}
          <button className="dc-hamburger" onClick={() => setMobileOpen(true)} aria-label="Menu">
            <span /><span /><span />
          </button>

          {/* Logo */}
          <div className="dc-logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
            Dow<span>Cloth</span>
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

          {/* Search Bar (desktop) */}
          <form className="dc-search-bar" onSubmit={handleSearchSubmit} style={{ position: 'relative' }}>
            <span className="dc-search-icon">🔍</span>
            <input
              ref={searchRef}
              className="dc-search-input"
              placeholder="Search clothes, brands..."
              value={searchQuery}
              onChange={e => { setSearchQuery(e.target.value); setSearchOpen(true); }}
              onFocus={() => setSearchOpen(true)}
              onBlur={() => setTimeout(() => setSearchOpen(false), 200)}
            />
            {searchOpen && searchResults.length > 0 && (
              <div style={{
                position: 'absolute', top: '100%', left: 0, right: 0,
                background: '#fff', borderRadius: 12, boxShadow: 'var(--shadow-xl)',
                border: '1px solid var(--dc-border-light)', zIndex: 700, overflow: 'hidden',
                marginTop: 6,
              }}>
                {searchResults.map(p => (
                  <div
                    key={p.id}
                    style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 16px', cursor: 'pointer', transition: 'background 0.15s' }}
                    onMouseDown={() => navigate(`/product/${p.id}`)}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--dc-surface)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'none'}
                  >
                    <img src={p.image} alt={p.name} style={{ width: 36, height: 48, objectFit: 'cover', borderRadius: 4, flexShrink: 0 }} />
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#1A1A1A' }}>{p.name}</div>
                      <div style={{ fontSize: 11, color: 'var(--dc-text-muted)' }}>{p.brand} · ₹{p.price.toLocaleString()}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </form>

          {/* Action Icons */}
          <div className="dc-header-actions">
            <button className="dc-header-btn" onClick={() => navigate('/fashion-assistant')} title="AI Fashion Assistant">
              🤖
            </button>
            <button className="dc-header-btn" onClick={() => navigate('/wishlist')} title="Wishlist">
              🤍
              {wishlistCount > 0 && <span className="dc-badge-count">{wishlistCount}</span>}
            </button>
            <button className="dc-header-btn" onClick={() => setIsOpen(true)} title="Shopping Cart">
              🛍️
              {totalItems > 0 && <span className="dc-badge-count" style={{ background: 'var(--dc-red)' }}>{totalItems}</span>}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {mobileOpen && <div className="dc-overlay" onClick={() => setMobileOpen(false)} style={{ zIndex: 699 }} />}

      {/* Mobile Menu Drawer */}
      <div className={`dc-mobile-menu${mobileOpen ? ' open' : ''}`} style={{ zIndex: 700 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 20px', borderBottom: '1px solid var(--dc-border-light)' }}>
          <div className="dc-logo" style={{ fontSize: 20 }}>Dow<span>Cloth</span></div>
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
