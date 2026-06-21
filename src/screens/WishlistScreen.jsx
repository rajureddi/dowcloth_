import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PRODUCTS } from '../data/products';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import ProductCard from '../components/ProductCard';

export default function WishlistScreen() {
  const navigate = useNavigate();
  const { ids, toggle } = useWishlist();
  const { addItem } = useCart();
  const { success } = useToast();
  const wishlistProducts = PRODUCTS.filter(p => ids.includes(p.id));

  return (
    <div style={{ minHeight: '100vh', background: '#fff' }}>
      <div style={{ background: 'var(--dc-surface)', borderBottom: '1px solid var(--dc-border-light)', padding: 'var(--space-10) 0' }}>
        <div className="dc-container">
          <h1 className="dc-heading-1">My Wishlist</h1>
          <p style={{ color: 'var(--dc-text-muted)', fontSize: 14, marginTop: 6 }}>
            {wishlistProducts.length} {wishlistProducts.length === 1 ? 'item' : 'items'} saved
          </p>
        </div>
      </div>

      <div className="dc-container" style={{ padding: 'var(--space-10) var(--side-pad) var(--space-16)' }}>
        {wishlistProducts.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 400, textAlign: 'center', gap: 16 }}>
            <div style={{ fontSize: 72 }}>🤍</div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 26 }}>Your wishlist is empty</h2>
            <p style={{ color: 'var(--dc-text-muted)', maxWidth: 320 }}>
              Save items you love by tapping the heart icon on any product.
            </p>
            <button className="dc-btn dc-btn-primary dc-btn-lg" onClick={() => navigate('/')}>
              Explore Collections
            </button>
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 24 }}>
              <button
                className="dc-btn dc-btn-primary"
                onClick={() => {
                  wishlistProducts.forEach(p => addItem(p, p.sizes?.[0] || 'M', 1));
                  success(`${wishlistProducts.length} items added to cart`);
                }}
              >
                Move All to Cart →
              </button>
            </div>
            <div className="dc-product-grid dc-product-grid-4">
              {wishlistProducts.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
