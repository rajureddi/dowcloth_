import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useToast } from '../context/ToastContext';

function StarRating({ rating, size = 12 }) {
  return (
    <span className="dc-stars" style={{ fontSize: size }}>
      {[1, 2, 3, 4, 5].map(i => (
        <span key={i} style={{ color: i <= Math.round(rating) ? '#F59E0B' : '#DDD' }}>★</span>
      ))}
    </span>
  );
}

export default function ProductCard({ product, layout = 'grid' }) {
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { toggle, has } = useWishlist();
  const { success } = useToast();
  const [hovered, setHovered] = useState(false);
  const wished = has(product.id);

  const handleWishlist = (e) => {
    e.stopPropagation();
    toggle(product.id);
    success(wished ? 'Removed from wishlist' : `${product.name} added to wishlist`);
  };

  const handleQuickAdd = (e) => {
    e.stopPropagation();
    const defaultSize = product.sizes?.[product.sizes.length > 1 ? 1 : 0] || 'M';
    addItem(product, defaultSize, 1);
    success(`${product.name} added to cart`);
  };



  return (
    <div
      className="dc-hover-lift"
      style={{ cursor: 'pointer', position: 'relative', background: '#fff' }}
      onClick={() => navigate(`/product/${product.id}`)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Image Box */}
      <div className="dc-img-zoom" style={{ position: 'relative', aspectRatio: '3/4', background: 'var(--dc-surface)', borderRadius: 4, overflow: 'hidden' }}>
        <img
          src={product.image}
          alt={product.name}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          loading="lazy"
          onError={e => { e.target.src = 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=400&q=60'; }}
        />

        {/* Badges top-left */}
        <div style={{ position: 'absolute', top: 10, left: 10, display: 'flex', flexDirection: 'column', gap: 5 }}>
          {product.discount >= 40 && (
            <span className="dc-badge dc-badge-sale">{product.discount}% OFF</span>
          )}
          {product.isNew && <span className="dc-badge dc-badge-new">New</span>}
          {product.isBestSeller && !product.isNew && (
            <span className="dc-badge" style={{ background: '#C9A96E', color: '#fff' }}>Best Seller</span>
          )}
        </div>

        {/* Wishlist button */}
        <button
          onClick={handleWishlist}
          style={{
            position: 'absolute', top: 10, right: 10,
            width: 34, height: 34, borderRadius: '50%',
            background: wished ? '#fff' : 'rgba(255,255,255,0.85)',
            border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
            transition: 'all 0.2s',
            transform: wished ? 'scale(1.1)' : 'scale(1)',
          }}
          title={wished ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          {wished ? '❤️' : '🤍'}
        </button>

        {/* Delivery tag */}
        <div style={{ position: 'absolute', bottom: 10, left: 10 }}>
          <span className="dc-badge dc-badge-delivery">
            ⚡ {product.deliveryTime || '45 mins'}
          </span>
        </div>

        {/* Quick Add (visible on hover) */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          background: 'rgba(10,10,10,0.85)', padding: '10px 14px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transform: hovered ? 'translateY(0)' : 'translateY(100%)',
          transition: 'transform 0.25s ease',
          gap: 8,
        }}>
          <button
            onClick={handleQuickAdd}
            style={{ flex: 1, padding: '8px 0', background: '#fff', border: 'none', borderRadius: 2, fontSize: 11, fontWeight: 700, cursor: 'pointer', letterSpacing: '0.5px', fontFamily: 'var(--font-body)', color: '#0A0A0A' }}
          >
            + ADD TO CART
          </button>
          <button
            onClick={e => { e.stopPropagation(); navigate(`/product/${product.id}`); }}
            style={{ padding: '8px 12px', background: 'transparent', border: '1px solid rgba(255,255,255,0.3)', borderRadius: 2, fontSize: 11, fontWeight: 600, cursor: 'pointer', color: '#fff', fontFamily: 'var(--font-body)' }}
          >
            VIEW
          </button>
        </div>

        {/* Out of stock overlay */}
        {product.stock <= 3 && product.stock > 0 && (
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', background: 'rgba(255,255,255,0.92)', padding: '5px 12px', borderRadius: 30, fontSize: 11, fontWeight: 700, color: '#D93025', whiteSpace: 'nowrap' }}>
            Only {product.stock} left!
          </div>
        )}
      </div>

      {/* Product Info */}
      <div style={{ padding: '12px 2px 4px' }}>
        <div style={{ fontSize: 10, color: 'var(--dc-text-muted)', fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 4 }}>
          {product.brand}
        </div>
        <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--dc-text-primary)', marginBottom: 6, lineHeight: 1.35, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', fontFamily: 'var(--font-body)' }}>
          {product.name}
        </h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
          <StarRating rating={product.rating} />
          <span style={{ fontSize: 11, color: 'var(--dc-text-muted)' }}>
            ({Array.isArray(product.reviews) ? product.reviews.length : product.reviews})
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 15, fontWeight: 800, color: 'var(--dc-text-primary)', fontFamily: 'var(--font-body)' }}>
            ₹{product.price.toLocaleString()}
          </span>
          {product.originalPrice && (
            <span style={{ fontSize: 12, color: 'var(--dc-text-muted)', textDecoration: 'line-through' }}>
              ₹{product.originalPrice.toLocaleString()}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
