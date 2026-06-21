import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';

export default function CartDrawer() {
  const navigate = useNavigate();
  const { items, removeItem, updateQty, totalPrice, totalItems, isOpen, setIsOpen } = useCart();

  if (!isOpen) return null;

  return (
    <>
      <div className="dc-overlay" onClick={() => setIsOpen(false)} />
      <div className={`dc-cart-drawer open`}>
        {/* Header */}
        <div className="dc-cart-header">
          <div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 600 }}>
              Shopping Cart
            </h2>
            {totalItems > 0 && (
              <p style={{ fontSize: 12, color: 'var(--dc-text-muted)', marginTop: 2 }}>
                {totalItems} {totalItems === 1 ? 'item' : 'items'}
              </p>
            )}
          </div>
          <button
            onClick={() => setIsOpen(false)}
            style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--dc-surface)', border: 'none', fontSize: 18, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="dc-cart-body">
          {items.length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60%', gap: 16 }}>
              <div style={{ fontSize: 64 }}>🛍️</div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 500 }}>Your cart is empty</h3>
              <p style={{ color: 'var(--dc-text-muted)', fontSize: 13, textAlign: 'center' }}>
                Explore our collections and find something you love.
              </p>
              <button className="dc-btn dc-btn-primary" onClick={() => setIsOpen(false)}>
                Continue Shopping
              </button>
            </div>
          ) : (
            items.map(item => (
              <div key={item.key} style={{ display: 'flex', gap: 14, paddingBottom: 20, marginBottom: 20, borderBottom: '1px solid var(--dc-border-light)' }}>
                {/* Image */}
                <div
                  style={{ width: 76, height: 96, flexShrink: 0, borderRadius: 6, overflow: 'hidden', background: 'var(--dc-surface)', cursor: 'pointer' }}
                  onClick={() => { setIsOpen(false); navigate(`/product/${item.product.id}`); }}
                >
                  <img src={item.product.image} alt={item.product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>

                {/* Details */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 10, color: 'var(--dc-text-muted)', fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 3 }}>
                    {item.product.brand}
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', fontFamily: 'var(--font-body)' }}>
                    {item.product.name}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--dc-text-muted)', marginBottom: 10 }}>
                    Size: {item.size}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    {/* Qty Control */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 0, border: '1px solid var(--dc-border)', borderRadius: 6, overflow: 'hidden' }}>
                      <button
                        onClick={() => item.qty > 1 ? updateQty(item.key, item.qty - 1) : removeItem(item.key)}
                        style={{ width: 32, height: 32, border: 'none', background: '#fff', cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--dc-text-secondary)' }}
                      >
                        {item.qty === 1 ? '🗑' : '−'}
                      </button>
                      <span style={{ width: 32, textAlign: 'center', fontSize: 14, fontWeight: 600, fontFamily: 'var(--font-body)' }}>
                        {item.qty}
                      </span>
                      <button
                        onClick={() => updateQty(item.key, item.qty + 1)}
                        style={{ width: 32, height: 32, border: 'none', background: '#fff', cursor: 'pointer', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--dc-text-secondary)' }}
                      >
                        +
                      </button>
                    </div>
                    <span style={{ fontSize: 15, fontWeight: 800, fontFamily: 'var(--font-body)' }}>
                      ₹{(item.product.price * item.qty).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="dc-cart-footer">
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <span style={{ fontSize: 13, color: 'var(--dc-text-secondary)' }}>Subtotal</span>
                <span style={{ fontSize: 13, color: 'var(--dc-text-secondary)' }}>₹{totalPrice.toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <span style={{ fontSize: 13, color: 'var(--dc-text-secondary)' }}>Delivery</span>
                <span style={{ fontSize: 13, color: 'var(--dc-green)', fontWeight: 600 }}>FREE ⚡ 60 mins</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, borderTop: '1px solid var(--dc-border-light)' }}>
                <span style={{ fontSize: 16, fontWeight: 700 }}>Total</span>
                <span style={{ fontSize: 20, fontWeight: 800, fontFamily: 'var(--font-body)' }}>₹{totalPrice.toLocaleString()}</span>
              </div>
            </div>
            <button
              className="dc-btn dc-btn-primary dc-btn-lg dc-btn-full"
              onClick={() => {
                setIsOpen(false);
                navigate('/checkout', { state: { product: items[0].product, qty: items[0].qty, cartItems: items } });
              }}
            >
              Proceed to Checkout →
            </button>
            <p style={{ textAlign: 'center', fontSize: 11, color: 'var(--dc-text-muted)', marginTop: 10 }}>
              ↩️ Free returns
            </p>
          </div>
        )}
      </div>
    </>
  );
}
