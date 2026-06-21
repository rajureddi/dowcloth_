import React from 'react';
import { useNavigate } from 'react-router-dom';

const links = {
  shop: ['Women', 'Men', 'Kids', 'Footwear', 'Accessories'],
  help: ['Track Order', 'Returns & Exchanges', 'Size Guide', 'Contact Us', 'FAQ'],
  about: ['Our Story', 'Careers', 'Press', 'Sustainability'],
};

export default function Footer() {
  const navigate = useNavigate();
  const year = new Date().getFullYear();

  return (
    <footer className="dc-footer">
      <div className="dc-container">
        <div className="dc-footer-grid">
          {/* Brand Column */}
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 700, color: '#fff', marginBottom: 16, letterSpacing: '-0.3px' }}>
              Dow<span style={{ color: '#C9A96E' }}>Cloth</span>
            </div>
            <p style={{ fontSize: 13, lineHeight: 1.8, color: 'rgba(255,255,255,0.55)', maxWidth: 280, marginBottom: 20 }}>
              Premium fashion, delivered to your door in 60 minutes. Because style shouldn't wait.
            </p>
            <div style={{ display: 'flex', gap: 10, marginBottom: 24 }}>
              {['📍 Bengaluru', '📍 Hyderabad'].map(c => (
                <span key={c} style={{ fontSize: 11, padding: '4px 10px', background: 'rgba(255,255,255,0.08)', borderRadius: 20, color: 'rgba(255,255,255,0.55)', border: '1px solid rgba(255,255,255,0.1)' }}>
                  {c}
                </span>
              ))}
            </div>
            {/* Social Links */}
            <div style={{ display: 'flex', gap: 10 }}>
              {['𝕏', 'IG', 'FB', 'YT'].map(s => (
                <button key={s} style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.1)', fontSize: 12, fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s', fontFamily: 'var(--font-body)' }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(201,169,110,0.2)'; e.currentTarget.style.borderColor = '#C9A96E'; e.currentTarget.style.color = '#C9A96E'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = 'rgba(255,255,255,0.6)'; }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Shop */}
          <div>
            <h4 className="dc-footer-heading">Shop</h4>
            {links.shop.map(l => (
              <button key={l} className="dc-footer-link"
                style={{ display: 'block', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', fontFamily: 'var(--font-body)', padding: 0, marginBottom: 10, fontSize: 13, color: 'rgba(255,255,255,0.5)', transition: 'color 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.color = '#fff'}
                onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.5)'}
                onClick={() => navigate(`/category/${l.toLowerCase()}`)}
              >
                {l}
              </button>
            ))}
          </div>

          {/* Help */}
          <div>
            <h4 className="dc-footer-heading">Help</h4>
            {links.help.map(l => (
              <button key={l} className="dc-footer-link"
                style={{ display: 'block', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', fontFamily: 'var(--font-body)', padding: 0, marginBottom: 10, fontSize: 13, color: 'rgba(255,255,255,0.5)', transition: 'color 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.color = '#fff'}
                onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.5)'}
                onClick={() => l === 'Track Order' ? navigate('/order-tracking') : null}
              >
                {l}
              </button>
            ))}
          </div>

          {/* About */}
          <div>
            <h4 className="dc-footer-heading">About</h4>
            {links.about.map(l => (
              <button key={l}
                style={{ display: 'block', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', fontFamily: 'var(--font-body)', padding: 0, marginBottom: 10, fontSize: 13, color: 'rgba(255,255,255,0.5)', transition: 'color 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.color = '#fff'}
                onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.5)'}
              >
                {l}
              </button>
            ))}
            <div style={{ marginTop: 20 }}>
              <h4 className="dc-footer-heading" style={{ marginBottom: 10 }}>Download App</h4>
              {['App Store', 'Google Play'].map(s => (
                <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', background: 'rgba(255,255,255,0.06)', borderRadius: 8, marginBottom: 8, border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>
                  {s === 'App Store' ? '🍎' : '▶'} {s}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="dc-footer-bottom">
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>
            © {year} DowCloth Quick Delivery. All rights reserved. · Made with ❤️ in India
          </p>
          <div className="dc-payment-badges">
            {['Visa', 'Mastercard', 'UPI', 'PhonePe', 'GPay', 'COD'].map(p => (
              <span key={p} className="dc-payment-badge">{p}</span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
