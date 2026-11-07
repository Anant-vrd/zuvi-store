'use client';

import React, { useState } from 'react';

export default function SingleProductStore() {
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isUpiModalOpen, setIsUpiModalOpen] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);

  // Customer Form State
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');

  const product = {
    title: 'Imperial Gold Anti-Tarnish Ring',
    price: 1499,
    category: 'Featured Piece',
    image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=800&q=80',
  };

  const handleCheckoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone || !address) return;
    setIsCheckoutOpen(false);
    setIsUpiModalOpen(true);
  };

  const confirmUpiPayment = () => {
    setOrderPlaced(true);
    setIsUpiModalOpen(false);
  };

  return (
    <div style={{ backgroundColor: '#040C08', color: '#E2E8F0', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      {/* Announcement Bar */}
      <div style={{ background: 'linear-gradient(to right, #0A1F14, #AA8822, #0A1F14)', color: '#FFF6D6', fontSize: '12px', padding: '8px 0', textAlign: 'center', letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: 600, borderBottom: '1px solid rgba(212,175,55,0.2)' }}>
        ✨ Live ZUVI &nbsp;•&nbsp; Made To Be Seen ✨
      </div>

      {/* Header */}
      <header style={{ position: 'sticky', top: 0, zIndex: 40, backgroundColor: 'rgba(4, 12, 8, 0.95)', backdropFilter: 'blur(10px)', borderBottom: '1px solid rgba(212, 175, 55, 0.2)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px', height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <a href="#" style={{ textDecoration: 'none' }}>
            <span style={{ fontSize: '28px', fontWeight: 'bold', letterSpacing: '0.15em', background: 'linear-gradient(135deg, #FFF6D6 0%, #D4AF37 50%, #AA8822 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              ZUVI
            </span>
            <span style={{ display: 'block', fontSize: '8px', letterSpacing: '0.3em', color: '#E6BE53', textTransform: 'uppercase' }}>Made To Be Seen</span>
          </a>
          <nav style={{ display: 'flex', gap: '30px', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#CBD5E1' }}>
            <a href="#product" style={{ color: '#E6BE53', textDecoration: 'none' }}>The Piece</a>
            <a href="#idea" style={{ textDecoration: 'none' }}>The Idea</a>
            <a href="#founder" style={{ textDecoration: 'none' }}>Founder</a>
          </nav>
          <button
            onClick={() => setIsCheckoutOpen(true)}
            style={{ padding: '10px 24px', background: 'linear-gradient(135deg, #D4AF37, #AA8822)', color: '#040C08', fontWeight: 'bold', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.1em', borderRadius: '4px', cursor: 'pointer', border: 'none', boxShadow: '0 0 20px rgba(212,175,55,0.3)' }}
          >
            Buy Now
          </button>
        </div>
      </header>

      {/* Hero / Single Product Showcase Section */}
      <section id="product" style={{ padding: '80px 20px', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '50px', alignItems: 'center' }}>
          {/* Product Image Display */}
          <div style={{ aspectRatio: '1/1', backgroundColor: 'rgba(10, 31, 20, 0.8)', border: '1px solid rgba(212,175,55,0.3)', borderRadius: '16px', overflow: 'hidden', position: 'relative', boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }}>
            <img 
              src={product.image} 
              alt={product.title} 
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
            <span style={{ position: 'absolute', top: '16px', left: '16px', backgroundColor: 'rgba(4, 12, 8, 0.9)', border: '1px solid rgba(212,175,55,0.4)', color: '#F5D77F', fontSize: '11px', textTransform: 'uppercase', fontWeight: 'bold', padding: '6px 12px', borderRadius: '4px' }}>
              {product.category}
            </span>
          </div>

          {/* Product Details & Purchase CTA */}
          <div>
            <p style={{ fontStyle: 'italic', color: '#F5D77F', fontSize: '20px', marginBottom: '8px', fontFamily: 'serif' }}>Exclusive Launch Drop</p>
            <h1 style={{ fontSize: '42px', fontWeight: 'bold', color: '#FFFFFF', letterSpacing: '0.02em', marginBottom: '16px', fontFamily: 'serif' }}>
              {product.title}
            </h1>
            <p style={{ fontStyle: 'italic', color: '#E6BE53', fontSize: '18px', marginBottom: '24px', fontFamily: 'serif' }}>Anti-tarnish finish • Crafted for everyday luxury</p>
            <div style={{ height: '1px', width: '100%', maxWidth: '250px', background: 'linear-gradient(90deg, #D4AF37, transparent)', marginBottom: '24px' }}></div>
            
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#D4AF37', marginBottom: '24px', fontFamily: 'serif' }}>
              ₹{product.price} <span style={{ display: 'block', fontSize: '11px', color: '#94A3B8', fontWeight: 'normal', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '4px', fontFamily: 'sans-serif' }}>Inclusive of all taxes & free shipping</span>
            </div>

            <p style={{ color: '#CBD5E1', fontWeight: 300, lineHeight: 1.7, marginBottom: '32px', fontSize: '16px' }}>
              Designed to withstand your daily routine without losing its brilliant gold shine. Water-resistant, sweat-friendly, and delivered in our signature ZUVI packaging.
            </p>

            {orderPlaced ? (
              <div style={{ padding: '20px', backgroundColor: 'rgba(15, 45, 30, 0.8)', border: '1px solid rgba(212,175,55,0.5)', borderRadius: '10px', textAlign: 'center' }}>
                <p style={{ color: '#F5D77F', fontSize: '18px', fontWeight: 'bold', fontFamily: 'serif' }}>🎉 Order Placed Successfully!</p>
                <p style={{ fontSize: '13px', color: '#CBD5E1', marginTop: '6px' }}>We have received your order details and payment confirmation. Your ZUVI piece is being prepared for dispatch.</p>
              </div>
            ) : (
              <button
                onClick={() => setIsCheckoutOpen(true)}
                style={{ width: '100%', maxWidth: '320px', padding: '16px', background: 'linear-gradient(135deg, #D4AF37, #AA8822)', color: '#040C08', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.15em', borderRadius: '6px', cursor: 'pointer', border: 'none', boxShadow: '0 0 25px rgba(212,175,55,0.3)', fontSize: '14px' }}
              >
                Order Now — ₹{product.price}
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Checkout Modal */}
      {isCheckoutOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, backgroundColor: 'rgba(0, 0, 0, 0.85)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ backgroundColor: '#0A1F14', maxWidth: '440px', width: '100%', borderRadius: '16px', padding: '30px', border: '1px solid rgba(212,175,55,0.4)', position: 'relative', boxShadow: '0 25px 50px rgba(0,0,0,0.7)' }}>
            <button onClick={() => setIsCheckoutOpen(false)} style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', color: '#94A3B8', fontSize: '18px', cursor: 'pointer' }}>✕</button>
            <h3 style={{ fontSize: '24px', fontWeight: 'bold', color: '#FFFFFF', marginBottom: '8px', fontFamily: 'serif' }}>Checkout</h3>
            <p style={{ fontSize: '12px', color: '#F5D77F', marginBottom: '24px' }}>Enter your shipping address for the {product.title}</p>
            
            <form onSubmit={handleCheckoutSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#CBD5E1', marginBottom: '6px' }}>Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={{ width: '100%', backgroundColor: '#040C08', border: '1px solid rgba(212,175,55,0.3)', borderRadius: '6px', padding: '12px', color: '#FFFFFF', outline: 'none', boxSizing: 'border-box' }}
                  placeholder="Chitranjan Vikram Singh"
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#CBD5E1', marginBottom: '6px' }}>Phone Number (for delivery updates)</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  style={{ width: '100%', backgroundColor: '#040C08', border: '1px solid rgba(212,175,55,0.3)', borderRadius: '6px', padding: '12px', color: '#FFFFFF', outline: 'none', boxSizing: 'border-box' }}
                  placeholder="9876543210"
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#CBD5E1', marginBottom: '6px' }}>Complete Shipping Address</label>
                <textarea
                  required
                  rows={3}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  style={{ width: '100%', backgroundColor: '#040C08', border: '1px solid rgba(212,175,55,0.3)', borderRadius: '6px', padding: '12px', color: '#FFFFFF', outline: 'none', boxSizing: 'border-box', resize: 'vertical' }}
                  placeholder="Hostel Room, College Campus, City, Pincode"
                ></textarea>
              </div>
              <button
                type="submit"
                style={{ width: '100%', padding: '14px', backgroundColor: '#D4AF37', color: '#040C08', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.1em', borderRadius: '6px', cursor: 'pointer', border: 'none', marginTop: '10px' }}
              >
                Proceed to UPI Payment (₹1499)
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Local UPI Payment Modal with Real QR Code */}
      {isUpiModalOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, backgroundColor: 'rgba(0, 0, 0, 0.90)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ backgroundColor: '#0A1F14', maxWidth: '380px', width: '100%', borderRadius: '16px', padding: '30px', border: '1px solid rgba(212,175,55,0.4)', textAlign: 'center', position: 'relative', boxShadow: '0 25px 50px rgba(0,0,0,0.7)' }}>
            <button onClick={() => setIsUpiModalOpen(false)} style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', color: '#94A3B8', fontSize: '18px', cursor: 'pointer' }}>✕</button>
            <h3 style={{ fontSize: '22px', fontWeight: 'bold', color: '#FFFFFF', marginBottom: '6px', fontFamily: 'serif' }}>Scan & Pay via UPI</h3>
            <p style={{ fontSize: '12px', color: '#CBD5E1', marginBottom: '16px' }}>Scan with Google Pay, PhonePe, or Paytm</p>
            
            {/* Real QR Code Display */}
            <div style={{ width: '200px', height: '200px', margin: '0 auto 16px auto', backgroundColor: '#FFFFFF', padding: '8px', borderRadius: '12px', border: '2px solid #D4AF37', boxSizing: 'border-box' }}>
              <img 
                src="/images/qr.png" 
                alt="ZUVI UPI QR" 
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              />
            </div>

            <p style={{ fontSize: '13px', color: '#CBD5E1', marginBottom: '4px' }}>
              UPI ID: <strong style={{ color: '#F5D77F' }}>yourupiid@okaxis</strong>
            </p>
            <p style={{ fontSize: '14px', color: '#F5D77F', marginBottom: '20px', fontWeight: 'bold' }}>Amount to Pay: ₹{product.price}</p>

            <button
              onClick={confirmUpiPayment}
              style={{ width: '100%', padding: '14px', backgroundColor: '#D4AF37', color: '#040C08', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.1em', borderRadius: '6px', cursor: 'pointer', border: 'none' }}
            >
              I Have Paid — Complete Order
            </button>
          </div>
        </div>
      )}
    </div>
  );
}