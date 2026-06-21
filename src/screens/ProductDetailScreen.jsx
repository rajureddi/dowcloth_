import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PRODUCTS } from '../data/products';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useToast } from '../context/ToastContext';
import ProductCard from '../components/ProductCard';

function Stars({ rating }) {
  return (
    <span>
      {[1,2,3,4,5].map(i => (
        <span key={i} style={{ color: i <= Math.round(rating) ? '#F59E0B' : '#DDD', fontSize: 16 }}>★</span>
      ))}
    </span>
  );
}

export default function ProductDetailScreen() {
  const navigate = useNavigate();
  const { id } = useParams();
  const product = PRODUCTS.find(p => p.id === id) || PRODUCTS[0];
  const { addItem } = useCart();
  const { toggle, has } = useWishlist();
  const { success } = useToast();

  const [selectedSize, setSelectedSize] = useState(product.sizes?.[1] || product.sizes?.[0] || 'M');
  const [qty, setQty] = useState(1);
  const [activeTab, setActiveTab] = useState('details');
  const [showSizeGuide, setShowSizeGuide] = useState(false);

  const wished = has(product.id);
  const related = PRODUCTS.filter(p => p.category === product.category && p.id !== product.id).slice(0, 4);
  const reviewArr = Array.isArray(product.reviews) ? product.reviews : [];
  const avgRating = reviewArr.length
    ? (reviewArr.reduce((s, r) => s + r.rating, 0) / reviewArr.length).toFixed(1)
    : product.rating;

  const handleAdd = () => {
    addItem(product, selectedSize, qty);
    success(`${product.name} added to cart`);
  };

  const handleBuy = () => {
    addItem(product, selectedSize, qty);
    navigate('/checkout', { state: { product, qty, size: selectedSize } });
  };

  return (
    <div style={{ minHeight: '100vh', background: '#fff' }}>
      {/* Breadcrumb */}
      <div className="dc-container" style={{ padding: '16px var(--side-pad)', borderBottom: '1px solid var(--dc-border-light)' }}>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center', fontSize: 12, color: 'var(--dc-text-muted)', flexWrap: 'wrap' }}>
          <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', fontFamily: 'var(--font-body)', fontSize: 12 }} onClick={() => navigate('/')}>Home</button>
          <span>/</span>
          <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', fontFamily: 'var(--font-body)', fontSize: 12 }} onClick={() => navigate(`/category/${product.category.toLowerCase()}`)}>{product.category}</button>
          <span>/</span>
          <span style={{ color: 'var(--dc-text-primary)', fontWeight: 500 }}>{product.name}</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="dc-container">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-12)', padding: 'var(--space-10) 0', alignItems: 'start' }}>

          {/* Left: Gallery — single product image */}
          <div style={{ position: 'relative', overflow: 'hidden', borderRadius: 12, background: 'var(--dc-surface)', aspectRatio: '3/4' }} className="dc-img-zoom">
            <img
              src={product.image}
              alt={product.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              onError={e => { e.target.src = 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=800&q=80'; }}
            />

              {/* VTO Button */}
              <button
                onClick={() => navigate(`/virtual-vto/${product.id}`)}
                style={{ position: 'absolute', bottom: 16, right: 16, display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px', background: 'rgba(10,10,10,0.85)', color: '#fff', border: 'none', borderRadius: 999, fontSize: 12, fontWeight: 700, cursor: 'pointer', backdropFilter: 'blur(8px)', letterSpacing: '0.3px', fontFamily: 'var(--font-body)' }}
              >
                ✨ Virtual Try-On
              </button>
              {/* Wish button on gallery */}
              <button
                onClick={() => { toggle(product.id); success(wished ? 'Removed from wishlist' : 'Added to wishlist'); }}
                style={{ position: 'absolute', top: 16, right: 16, width: 40, height: 40, borderRadius: '50%', background: '#fff', border: 'none', cursor: 'pointer', fontSize: 20, boxShadow: 'var(--shadow-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'transform 0.2s', transform: wished ? 'scale(1.15)' : 'scale(1)' }}
              >
                {wished ? '❤️' : '🤍'}
              </button>
              {product.discount && (
                <div style={{ position: 'absolute', top: 16, left: 16 }}>
                  <span className="dc-badge dc-badge-sale">{product.discount}% OFF</span>
                </div>
              )}
            </div>

          {/* Right: Info */}
          <div style={{ paddingTop: 8 }}>
            {/* Delivery Badge */}
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 14px', background: '#EFF6FF', borderRadius: 8, marginBottom: 20 }}>
              <span style={{ fontSize: 16 }}>⚡</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#1565C0' }}>Delivery in 60 min · Bengaluru & Hyderabad</span>
            </div>

            <span style={{ fontSize: 11, color: 'var(--dc-text-muted)', fontWeight: 600, letterSpacing: '1.5px', textTransform: 'uppercase' }}>{product.brand}</span>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 600, color: 'var(--dc-text-primary)', margin: '8px 0 12px', lineHeight: 1.2 }}>
              {product.name}
            </h1>

            {/* Rating */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <Stars rating={avgRating} />
              <span style={{ fontSize: 14, fontWeight: 700 }}>{avgRating}</span>
              <span style={{ fontSize: 13, color: 'var(--dc-text-muted)' }}>
                ({reviewArr.length || product.reviews} reviews)
              </span>
              {product.isBestSeller && (
                <span className="dc-badge" style={{ background: '#C9A96E', color: '#fff' }}>Best Seller</span>
              )}
            </div>

            {/* Price */}
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 8 }}>
              <span style={{ fontFamily: 'var(--font-body)', fontSize: 28, fontWeight: 800, color: 'var(--dc-text-primary)' }}>
                ₹{product.price.toLocaleString()}
              </span>
              {product.originalPrice && (
                <>
                  <span style={{ fontSize: 16, color: 'var(--dc-text-muted)', textDecoration: 'line-through' }}>
                    ₹{product.originalPrice.toLocaleString()}
                  </span>
                  <span style={{ fontSize: 14, color: 'var(--dc-red)', fontWeight: 700 }}>
                    {product.discount}% off
                  </span>
                </>
              )}
            </div>
            <div className="dc-divider" />

            {/* Color Selector */}
            {product.colors?.length > 0 && (
              <div style={{ marginBottom: 24 }}>
                <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 12, textTransform: 'uppercase', letterSpacing: '1px' }}>
                  Color: <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>{product.colors[0].name}</span>
                </div>
                <div className="dc-color-swatches">
                  {product.colors.map((c, i) => (
                    <button
                      key={c.name}
                      title={c.name}
                      className={`dc-color-swatch${i === 0 ? ' active' : ''}`}
                      style={{ background: c.hex }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Size Selector */}
            <div style={{ marginBottom: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <span style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>Size</span>
                <button
                  onClick={() => setShowSizeGuide(!showSizeGuide)}
                  style={{ fontSize: 12, color: 'var(--dc-blue)', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', fontFamily: 'var(--font-body)' }}
                >
                  Size Guide
                </button>
              </div>
              <div className="dc-size-grid">
                {product.sizes?.map(s => (
                  <button
                    key={s}
                    className={`dc-size-btn${selectedSize === s ? ' active' : ''}`}
                    onClick={() => setSelectedSize(s)}
                  >
                    {s}
                  </button>
                ))}
              </div>
              {showSizeGuide && (
                <div style={{ marginTop: 16, padding: 16, background: 'var(--dc-surface)', borderRadius: 8, fontSize: 12, lineHeight: 1.8, color: 'var(--dc-text-secondary)' }}>
                  <strong>Size Guide (in cm):</strong><br />
                  XS: Bust 80, Waist 62 &nbsp;|&nbsp; S: Bust 84, Waist 66 &nbsp;|&nbsp;
                  M: Bust 88, Waist 70 &nbsp;|&nbsp; L: Bust 92, Waist 74 &nbsp;|&nbsp;
                  XL: Bust 96, Waist 78
                </div>
              )}
            </div>

            {/* Qty */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 28 }}>
              <div style={{ display: 'flex', alignItems: 'center', border: '1.5px solid var(--dc-border)', borderRadius: 6 }}>
                <button onClick={() => setQty(Math.max(1, qty - 1))} style={{ width: 40, height: 40, border: 'none', background: 'none', fontSize: 18, cursor: 'pointer', color: 'var(--dc-text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>−</button>
                <span style={{ minWidth: 36, textAlign: 'center', fontWeight: 700, fontFamily: 'var(--font-body)', fontSize: 15 }}>{qty}</span>
                <button onClick={() => setQty(qty + 1)} style={{ width: 40, height: 40, border: 'none', background: 'none', fontSize: 18, cursor: 'pointer', color: 'var(--dc-text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
              </div>
              {product.stock <= 10 && (
                <span style={{ fontSize: 12, color: 'var(--dc-red)', fontWeight: 600 }}>
                  ⚠️ Only {product.stock} left in stock
                </span>
              )}
            </div>

            {/* CTAs */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 28 }}>
              <button className="dc-btn dc-btn-secondary dc-btn-lg dc-btn-full" onClick={handleAdd}>
                🛍️ Add to Cart
              </button>
              <button className="dc-btn dc-btn-primary dc-btn-lg dc-btn-full" onClick={handleBuy}>
                Buy Now · ₹{(product.price * qty).toLocaleString()}
              </button>
            </div>

            {/* Promises */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {[
                { icon: '↩️', text: 'Free 7-day returns' },
                { icon: '⚡', text: 'Express delivery' },
              ].map(p => (
                <div key={p.text} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', background: 'var(--dc-surface)', borderRadius: 8, fontSize: 12, color: 'var(--dc-text-secondary)' }}>
                  <span>{p.icon}</span> {p.text}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Product Tabs */}
      <div style={{ borderTop: '1px solid var(--dc-border-light)', borderBottom: '1px solid var(--dc-border-light)' }}>
        <div className="dc-container">
          <div style={{ display: 'flex', gap: 0 }}>
            {['details', 'reviews'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  padding: '16px 28px', border: 'none', background: 'none', cursor: 'pointer',
                  fontSize: 14, fontWeight: 600, fontFamily: 'var(--font-body)',
                  color: activeTab === tab ? 'var(--dc-black)' : 'var(--dc-text-muted)',
                  borderBottom: activeTab === tab ? '2px solid var(--dc-black)' : '2px solid transparent',
                  marginBottom: -1, textTransform: 'capitalize',
                }}
              >
                {tab === 'reviews' ? `Reviews (${reviewArr.length || 0})` : 'Product Details'}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="dc-container" style={{ padding: 'var(--space-8) var(--side-pad) var(--space-12)' }}>
        {activeTab === 'details' && (
          <div style={{ maxWidth: 680 }}>
            <p style={{ fontSize: 15, color: 'var(--dc-text-secondary)', lineHeight: 1.8, marginBottom: 24 }}>
              {product.description}
            </p>
            {product.highlights?.length > 0 && (
              <>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 18, marginBottom: 16 }}>Highlights</h3>
                <ul style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  {product.highlights.map(h => (
                    <li key={h} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: 'var(--dc-text-secondary)' }}>
                      <span style={{ color: 'var(--dc-green)', fontWeight: 700 }}>✓</span> {h}
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        )}

        {activeTab === 'reviews' && (
          <div style={{ maxWidth: 720 }}>
            {reviewArr.length === 0 ? (
              <p style={{ color: 'var(--dc-text-muted)', fontSize: 14 }}>No reviews yet. Be the first to review!</p>
            ) : (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: 32, marginBottom: 32, padding: 24, background: 'var(--dc-surface)', borderRadius: 12 }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: 48, fontWeight: 700, color: 'var(--dc-text-primary)', lineHeight: 1 }}>{avgRating}</div>
                    <Stars rating={avgRating} />
                    <div style={{ fontSize: 12, color: 'var(--dc-text-muted)', marginTop: 4 }}>{reviewArr.length} reviews</div>
                  </div>
                  <div style={{ flex: 1 }}>
                    {[5,4,3,2,1].map(star => {
                      const cnt = reviewArr.filter(r => r.rating === star).length;
                      const pct = reviewArr.length ? (cnt / reviewArr.length) * 100 : 0;
                      return (
                        <div key={star} className="dc-rating-bar" style={{ marginBottom: 6 }}>
                          <span style={{ fontSize: 12, minWidth: 8, color: 'var(--dc-text-muted)' }}>{star}★</span>
                          <div className="dc-rating-bar-track">
                            <div className="dc-rating-bar-fill" style={{ width: `${pct}%` }} />
                          </div>
                          <span style={{ fontSize: 11, minWidth: 20, color: 'var(--dc-text-muted)' }}>{cnt}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
                {reviewArr.map(r => (
                  <div key={r.id} className="dc-review-card">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                      <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--dc-surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>👤</div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 14 }}>{r.author}</div>
                        <div style={{ fontSize: 11, color: 'var(--dc-text-muted)', display: 'flex', gap: 8, alignItems: 'center' }}>
                          <Stars rating={r.rating} />
                          <span>{r.date}</span>
                          {r.verified && <span style={{ color: 'var(--dc-green)', fontWeight: 600 }}>✓ Verified</span>}
                        </div>
                      </div>
                    </div>
                    <p style={{ fontSize: 14, color: 'var(--dc-text-secondary)', lineHeight: 1.7 }}>{r.text}</p>
                  </div>
                ))}
              </>
            )}
          </div>
        )}
      </div>

      {/* Related Products */}
      {related.length > 0 && (
        <div style={{ background: 'var(--dc-surface)', padding: 'var(--space-12) 0' }}>
          <div className="dc-container">
            <h2 className="dc-heading-2" style={{ marginBottom: 'var(--space-8)' }}>You May Also Like</h2>
            <div className="dc-product-grid dc-product-grid-4">
              {related.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
