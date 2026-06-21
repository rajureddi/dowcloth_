import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import confetti from 'canvas-confetti';

const STEPS = ['Cart', 'Address', 'Payment', 'Confirm'];

function StepIndicator({ current }) {
  return (
    <div className="dc-steps">
      {STEPS.map((s, i) => (
        <React.Fragment key={s}>
          <div className={`dc-step${i < current ? ' done' : i === current ? ' active' : ''}`}>
            <div className="dc-step-dot">
              {i < current ? '✓' : i + 1}
            </div>
            <span className="dc-step-label">{s}</span>
          </div>
          {i < STEPS.length - 1 && (
            <div className="dc-step-line" style={{ background: i < current ? 'var(--dc-green)' : 'var(--dc-border-light)' }} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

const paymentMethods = [
  { id: 'UPI', name: 'UPI / Google Pay / PhonePe', icon: '⚡', tag: 'Instant transfer' },
  { id: 'CARD', name: 'Credit / Debit Card', icon: '💳', tag: 'Visa, MC, Rupay supported' },
  { id: 'NET', name: 'Net Banking', icon: '🏦', tag: 'All major banks' },
  { id: 'COD', name: 'Cash on Delivery', icon: '💵', tag: 'Pay when you receive' },
];

export default function CheckoutScreen() {
  const navigate = useNavigate();
  const location = useLocation();
  const { product, qty = 1, cartItems } = location.state || {};
  const { clearCart } = useCart();
  const { success } = useToast();

  const [step, setStep] = useState(1);
  const [method, setMethod] = useState('UPI');
  const [placed, setPlaced] = useState(false);
  const [orderId, setOrderId] = useState(null);
  const [coupon, setCoupon] = useState('');
  const [couponApplied, setCouponApplied] = useState(false);

  const items = cartItems || (product ? [{ product, qty, key: `${product.id}_M`, size: 'M' }] : []);
  const subtotal = items.reduce((sum, i) => sum + i.product.price * i.qty, 0);
  const discount = couponApplied ? Math.round(subtotal * 0.1) : 0;
  const total = subtotal - discount;

  const [address, setAddress] = useState({ name: '', phone: '', pincode: '', address: '', city: 'Bengaluru', state: 'Karnataka' });
  const addrValid = address.name && address.phone && address.address && address.pincode;

  const handleCoupon = () => {
    if (coupon.trim().toUpperCase() === 'FAST60') {
      setCouponApplied(true);
      success('Coupon applied! 10% off');
    }
  };

  const handlePlaceOrder = () => {
    const id = 'DC-' + Math.random().toString(36).toUpperCase().slice(2, 9);
    setOrderId(id);
    setPlaced(true);
    clearCart();
    confetti({ particleCount: 180, spread: 80, origin: { y: 0.6 }, colors: ['#C9A96E', '#FFD700', '#fff', '#0A0A0A'] });
    setTimeout(() => navigate('/order-tracking', { state: { orderId: id } }), 2500);
  };

  if (placed) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--dc-surface)', textAlign: 'center', padding: 32 }}>
        <div style={{ fontSize: 72, marginBottom: 16, animation: 'bounce-in 0.6s ease' }}>🎉</div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 32, marginBottom: 12 }}>Order Confirmed!</h1>
        <p style={{ fontSize: 15, color: 'var(--dc-text-secondary)', marginBottom: 8 }}>Order ID: <strong>{orderId}</strong></p>
        <p style={{ fontSize: 14, color: 'var(--dc-text-muted)' }}>⚡ Expected delivery in 60 minutes · Redirecting to tracker...</p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--dc-surface)' }}>
      {/* Header */}
      <div style={{ background: '#fff', borderBottom: '1px solid var(--dc-border-light)', padding: '16px 0' }}>
        <div className="dc-container dc-flex-between">
          <div className="dc-logo" style={{ fontSize: 20, cursor: 'pointer' }} onClick={() => navigate('/')}>
            Dow<span style={{ color: 'var(--dc-accent)' }}>Cloth</span>
          </div>
          <span style={{ fontSize: 13, fontWeight: 700, letterSpacing: '2px', color: 'var(--dc-text-muted)', textTransform: 'uppercase' }}>
            🔒 Secure Checkout
          </span>
          <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600, color: 'var(--dc-text-secondary)', fontFamily: 'var(--font-body)' }}>
            ← Back
          </button>
        </div>
      </div>

      <div className="dc-container" style={{ padding: 'var(--space-8) var(--side-pad)', maxWidth: 1000 }}>
        <StepIndicator current={step} />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 32, alignItems: 'start' }}>
          {/* Left: Form */}
          <div>
            {step === 1 && (
              <div style={{ background: '#fff', borderRadius: 12, padding: 28 }}>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, marginBottom: 24 }}>Delivery Address</h2>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  {[
                    { key: 'name', label: 'Full Name', placeholder: 'Rahul Sharma', col: '1' },
                    { key: 'phone', label: 'Phone', placeholder: '+91 98765 43210', col: '1' },
                    { key: 'pincode', label: 'Pincode', placeholder: '560001', col: '1' },
                    { key: 'city', label: 'City', placeholder: 'Bengaluru', col: '1' },
                    { key: 'address', label: 'Full Address', placeholder: 'Street, Apartment, Area...', col: '2' },
                  ].map(f => (
                    <div key={f.key} style={{ gridColumn: f.col === '2' ? '1 / -1' : 'auto' }}>
                      <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 6, color: 'var(--dc-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.8px' }}>{f.label}</label>
                      <input
                        className="dc-input"
                        placeholder={f.placeholder}
                        value={address[f.key]}
                        onChange={e => setAddress(prev => ({ ...prev, [f.key]: e.target.value }))}
                      />
                    </div>
                  ))}
                </div>

                {/* Delivery option */}
                <div style={{ marginTop: 24 }}>
                  <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12, textTransform: 'uppercase', letterSpacing: '1px' }}>Delivery Option</h3>
                  {[
                    { id: 'express', label: '⚡ Express (60 Minutes)', sub: 'Available in Bengaluru & Hyderabad', price: 'FREE' },
                    { id: 'standard', label: '📦 Standard (1-2 Days)', sub: 'Anywhere in India', price: 'FREE' },
                  ].map(d => (
                    <div key={d.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', border: d.id === 'express' ? '2px solid var(--dc-black)' : '1.5px solid var(--dc-border)', borderRadius: 8, marginBottom: 10, cursor: 'pointer', background: d.id === 'express' ? '#FAFAFA' : '#fff' }}>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 14 }}>{d.label}</div>
                        <div style={{ fontSize: 12, color: 'var(--dc-text-muted)', marginTop: 2 }}>{d.sub}</div>
                      </div>
                      <span style={{ color: 'var(--dc-green)', fontWeight: 700, fontSize: 14 }}>{d.price}</span>
                    </div>
                  ))}
                </div>

                <button
                  className="dc-btn dc-btn-primary dc-btn-lg dc-btn-full"
                  style={{ marginTop: 24 }}
                  disabled={!addrValid}
                  onClick={() => setStep(2)}
                >
                  Continue to Payment →
                </button>
              </div>
            )}

            {step === 2 && (
              <div style={{ background: '#fff', borderRadius: 12, padding: 28 }}>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, marginBottom: 24 }}>Payment Method</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 28 }}>
                  {paymentMethods.map(m => (
                    <div
                      key={m.id}
                      onClick={() => setMethod(m.id)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 16, padding: '18px 20px',
                        border: method === m.id ? '2px solid var(--dc-black)' : '1.5px solid var(--dc-border)',
                        borderRadius: 10, cursor: 'pointer', transition: 'all 0.2s',
                        background: method === m.id ? '#FAFAFA' : '#fff',
                      }}
                    >
                      <span style={{ fontSize: 26 }}>{m.icon}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: method === m.id ? 700 : 500, fontSize: 14, marginBottom: 2 }}>{m.name}</div>
                        <div style={{ fontSize: 11, color: 'var(--dc-text-muted)' }}>{m.tag}</div>
                      </div>
                      <div style={{ width: 18, height: 18, borderRadius: '50%', border: method === m.id ? '5px solid var(--dc-black)' : '1.5px solid var(--dc-border)' }} />
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: 12 }}>
                  <button className="dc-btn dc-btn-ghost dc-btn-lg" style={{ flex: 1 }} onClick={() => setStep(1)}>← Back</button>
                  <button className="dc-btn dc-btn-primary dc-btn-lg" style={{ flex: 2 }} onClick={handlePlaceOrder}>
                    Place Order · ₹{total.toLocaleString()}
                  </button>
                </div>
                <p style={{ textAlign: 'center', fontSize: 11, color: 'var(--dc-text-muted)', marginTop: 14 }}>
                  🔒 Your payment info is encrypted and never stored
                </p>
              </div>
            )}
          </div>

          {/* Right: Order Summary */}
          <div style={{ background: '#fff', borderRadius: 12, padding: 24, position: 'sticky', top: 90 }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 18, marginBottom: 20 }}>Order Summary</h3>

            {/* Items */}
            {items.map(it => (
              <div key={it.key} style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
                <img src={it.product?.image} alt={it.product?.name} style={{ width: 56, height: 72, objectFit: 'cover', borderRadius: 6, background: 'var(--dc-surface)', flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, lineHeight: 1.3, marginBottom: 4 }}>{it.product?.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--dc-text-muted)', marginBottom: 4 }}>Size: {it.size} · Qty: {it.qty}</div>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>₹{(it.product?.price * it.qty).toLocaleString()}</div>
                </div>
              </div>
            ))}

            <div className="dc-divider" />

            {/* Coupon */}
            {!couponApplied ? (
              <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                <input
                  className="dc-input"
                  style={{ height: 40, fontSize: 13 }}
                  placeholder="Coupon code (try FAST60)"
                  value={coupon}
                  onChange={e => setCoupon(e.target.value)}
                />
                <button className="dc-btn dc-btn-ghost dc-btn-sm" style={{ height: 40, flexShrink: 0 }} onClick={handleCoupon}>Apply</button>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', background: '#F0FFF4', borderRadius: 6, marginBottom: 16, fontSize: 13, color: 'var(--dc-green)', fontWeight: 600 }}>
                ✓ FAST60 applied — 10% off
              </div>
            )}

            {/* Bill */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--dc-text-secondary)' }}>
                <span>Subtotal</span><span>₹{subtotal.toLocaleString()}</span>
              </div>
              {couponApplied && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--dc-green)', fontWeight: 600 }}>
                  <span>Discount (10%)</span><span>−₹{discount.toLocaleString()}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--dc-text-secondary)' }}>
                <span>Delivery</span><span style={{ color: 'var(--dc-green)', fontWeight: 600 }}>FREE</span>
              </div>
              <div className="dc-divider" />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 17, fontWeight: 800 }}>
                <span>Total</span><span>₹{total.toLocaleString()}</span>
              </div>
            </div>

            <div style={{ marginTop: 20, padding: 14, background: '#EFF6FF', borderRadius: 8, fontSize: 12, color: '#1565C0', fontWeight: 600 }}>
              ⚡ Estimated delivery in 60 minutes · Bengaluru & Hyderabad
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
