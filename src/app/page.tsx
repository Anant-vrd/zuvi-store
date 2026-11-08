'use client';

import React, { useState } from 'react';

export default function ZuviHomepage() {
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isUpiModalOpen, setIsUpiModalOpen] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [phoneError, setPhoneError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Customer Form State
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [pincode, setPincode] = useState('');
  const [address, setAddress] = useState('');

  // Product Images Gallery State (Using your exact local filenames)
  const productImages = [
    '/images/ring1.jpeg',
    '/images/ring2.jpeg',
    '/images/ring3.jpeg',
    '/images/ring4.jpeg'
  ];
  const [selectedImage, setSelectedImage] = useState(productImages[0]);

  const product = {
    title: 'Imperial Emerald Anti-Tarnish Ring',
    price: 350,
    category: 'Flagship Piece',
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, ''); // Numbers only
    if (val.length <= 10) {
      setPhone(val);
      if (val.length === 10) {
        setPhoneError('');
      } else {
        setPhoneError('Phone number must be exactly 10 digits.');
      }
    }
  };

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.length !== 10) {
      setPhoneError('Please enter a valid 10-digit mobile number.');
      return;
    }
    if (!name || !pincode || !address) return;

    setIsSubmitting(true);

    // Send instant order details to your email via Web3Forms
    try {
      await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          access_key: 'f2860cc8-d7f5-456d-981b-9adfc22c5fd7',
          subject: `🚨 New ZUVI Order: ${product.title} (₹${product.price})`,
          from_name: 'ZUVI Storefront',
          message: `New Order Received!\n\nProduct: ${product.title}\nPrice: ₹${product.price}\nCustomer Name: ${name}\nPhone: ${phone}\nPincode: ${pincode}\nDelivery Address: ${address}`
        }),
      });
    } catch (err) {
      console.error('Notification error:', err);
    }

    setIsSubmitting(false);
    setIsCheckoutOpen(false);
    setIsUpiModalOpen(true);
  };

  const confirmUpiPayment = () => {
    setOrderPlaced(true);
    setIsUpiModalOpen(false);
  };

  return (
    <div style={{ backgroundColor: '#040C08', color: '#E2E8F0', minHeight: '100vh', fontFamily: 'sans-serif', overflowX: 'hidden' }}>
      
      {/* Announcement Bar */}
      <div style={{ background: 'linear-gradient(to right, #0A1F14, #AA8822, #0A1F14)', color: '#FFF6D6', fontSize: '11px', padding: '9px 0', textAlign: 'center', letterSpacing: '0.2em', textTransform: 'uppercase', fontWeight: 600, borderBottom: '1px solid rgba(212,175,55,0.2)' }}>
        ✨ ZUVI Live Offline Event @ IMS Campus &nbsp;•&nbsp; Made To Be Seen ✨
      </div>

      {/* Navigation Header */}
      <header style={{ position: 'sticky', top: 0, zIndex: 40, backgroundColor: 'rgba(4, 12, 8, 0.95)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(212, 175, 55, 0.25)' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px', height: '84px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <a href="#" style={{ textDecoration: 'none' }}>
            <span style={{ fontSize: '30px', fontWeight: 'bold', letterSpacing: '0.18em', background: 'linear-gradient(135deg, #FFF6D6 0%, #D4AF37 50%, #AA8822 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontFamily: 'serif' }}>
              ZUVI
            </span>
            <span style={{ display: 'block', fontSize: '7px', letterSpacing: '0.35em', color: '#E6BE53', textTransform: 'uppercase' }}>Made To Be Seen</span>
          </a>
          
          <nav style={{ display: 'flex', gap: '30px', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#CBD5E1' }}>
            <a href="#collection" style={{ color: '#E6BE53', textDecoration: 'none' }}>Collection</a>
            <a href="#offline-event" style={{ color: '#F5D77F', textDecoration: 'none' }}>IMS Event</a>
            <a href="#standards" style={{ textDecoration: 'none' }}>The Standard</a>
            <a href="#story" style={{ textDecoration: 'none' }}>Brand Story</a>
          </nav>

          <button
            onClick={() => setIsCheckoutOpen(true)}
            style={{ padding: '11px 26px', background: 'linear-gradient(135deg, #D4AF37, #AA8822)', color: '#040C08', fontWeight: 'bold', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.12em', borderRadius: '4px', cursor: 'pointer', border: 'none', boxShadow: '0 0 25px rgba(212,175,55,0.35)', transition: 'all 0.3s ease' }}
          >
            Order Now
          </button>
        </div>
      </header>

      {/* Hero Banner Section */}
      <section style={{ position: 'relative', padding: '100px 24px', textAlign: 'center', background: 'radial-gradient(circle at center, #0A2617 0%, #040C08 70%)', borderBottom: '1px solid rgba(212,175,55,0.15)' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <span style={{ fontSize: '12px', letterSpacing: '0.3em', color: '#D4AF37', textTransform: 'uppercase', display: 'block', marginBottom: '16px' }}>
            Luxury Anti-Tarnish Jewelry
          </span>
          <h1 style={{ fontSize: 'clamp(36px, 5vw, 64px)', fontWeight: 'normal', color: '#FFFFFF', fontFamily: 'serif', lineHeight: 1.15, marginBottom: '24px' }}>
            Uncompromising Radiance, <br /><span style={{ fontStyle: 'italic', color: '#F5D77F' }}>Built for Everyday Life.</span>
          </h1>
          <p style={{ fontSize: '16px', color: '#94A3B8', lineHeight: 1.7, marginBottom: '40px', maxWidth: '600px', margin: '0 auto 40px auto' }}>
            Designed in deep emerald and polished gold. ZUVI pieces are meticulously crafted to resist fading, water, and sweat without losing their brilliant luster.
          </p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a
              href="#collection"
              style={{ padding: '14px 36px', background: 'linear-gradient(135deg, #D4AF37, #AA8822)', color: '#040C08', textDecoration: 'none', textTransform: 'uppercase', letterSpacing: '0.15em', fontSize: '12px', fontWeight: 'bold', borderRadius: '4px' }}
            >
              Shop Online — ₹350
            </a>
            <a
              href="#offline-event"
              style={{ padding: '14px 36px', border: '1px solid #D4AF37', color: '#F5D77F', textDecoration: 'none', textTransform: 'uppercase', letterSpacing: '0.15em', fontSize: '12px', fontWeight: 'bold', borderRadius: '4px' }}
            >
              🎉 IMS Event Highlights
            </a>
          </div>
        </div>
      </section>

      {/* IMS Campus Offline Event Section & Video Showcase */}
      <section id="offline-event" style={{ padding: '80px 24px', backgroundColor: '#06190F', borderBottom: '1px solid rgba(212,175,55,0.2)' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '40px', alignItems: 'center', marginBottom: '60px' }}>
            <div style={{ backgroundColor: '#0A2417', padding: '40px', borderRadius: '16px', border: '1px solid rgba(212,175,55,0.3)', boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }}>
              <span style={{ backgroundColor: 'rgba(212,175,55,0.15)', color: '#F5D77F', border: '1px solid rgba(212,175,55,0.4)', fontSize: '11px', textTransform: 'uppercase', padding: '6px 12px', borderRadius: '4px', letterSpacing: '0.15em', fontWeight: 'bold' }}>
                Live Campus Pop-Up
              </span>
              <h2 style={{ fontSize: '32px', color: '#FFFFFF', fontFamily: 'serif', marginTop: '16px', marginBottom: '16px' }}>
                ZUVI Offline Event @ IMS
              </h2>
              <p style={{ color: '#CBD5E1', lineHeight: 1.7, fontSize: '15px', marginBottom: '24px' }}>
                Our official offline exhibition event at IMS campus brought out an incredible crowd! Students experienced the luxury anti-tarnish jewelry live, tried on pieces, and secured their favorites on the spot.
              </p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px', color: '#F5D77F' }}>
                <div>📍 <strong>Venue:</strong> IMS Campus Exhibition Hall & Atrium</div>
                <div>⚡ <strong>Event Highlight:</strong> Live try-ons, exclusive discounts, and instant UPI checkout</div>
                <div>🛍️ <strong>Community Response:</strong> Overwhelming student turnout & instant sales</div>
              </div>
            </div>

            <div style={{ textAlign: 'center', padding: '30px', backgroundColor: '#040C08', borderRadius: '16px', border: '1px solid rgba(212,175,55,0.2)' }}>
              <div style={{ fontSize: '48px', marginBottom: '12px' }}>🎓✨</div>
              <h3 style={{ fontSize: '22px', color: '#FFFFFF', fontFamily: 'serif', marginBottom: '12px' }}>Claim Launch Pricing</h3>
              <p style={{ color: '#94A3B8', fontSize: '14px', lineHeight: 1.6, marginBottom: '24px' }}>
                Grab the official event launch price of ₹350 right here online with expedited delivery!
              </p>
              <button
                onClick={() => setIsCheckoutOpen(true)}
                style={{ width: '100%', padding: '14px', background: 'linear-gradient(135deg, #D4AF37, #AA8822)', color: '#040C08', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.1em', borderRadius: '6px', cursor: 'pointer', border: 'none' }}
              >
                Secure Ring — ₹350
              </button>
            </div>
          </div>

          {/* Video Highlights Gallery */}
          <div style={{ textAlign: 'center', marginBottom: '30px' }}>
            <h3 style={{ fontSize: '24px', color: '#FFFFFF', fontFamily: 'serif', marginBottom: '8px' }}>Glimpses from the Event</h3>
            <p style={{ fontSize: '13px', color: '#D4AF37', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Watch moments from our IMS pop-up setup</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
            <div style={{ borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(212,175,55,0.3)', backgroundColor: '#040C08' }}>
              <video src="/videos/video1.mp4" controls autoPlay muted loop style={{ width: '100%', height: '260px', objectFit: 'cover' }} />
            </div>
            <div style={{ borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(212,175,55,0.3)', backgroundColor: '#040C08' }}>
              <video src="/videos/video2.mp4" controls autoPlay muted loop style={{ width: '100%', height: '260px', objectFit: 'cover' }} />
            </div>
            <div style={{ borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(212,175,55,0.3)', backgroundColor: '#040C08' }}>
              <video src="/videos/video3.mp4" controls autoPlay muted loop style={{ width: '100%', height: '260px', objectFit: 'cover' }} />
            </div>
          </div>

        </div>
      </section>

      {/* Main Product Showcase Section */}
      <section id="collection" style={{ padding: '100px 24px', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
          <p style={{ color: '#D4AF37', fontSize: '12px', letterSpacing: '0.25em', textTransform: 'uppercase', marginBottom: '8px' }}>Exclusive Launch Drop</p>
          <h2 style={{ fontSize: '36px', color: '#FFFFFF', fontFamily: 'serif' }}>The Signature Masterpiece</h2>
          <div style={{ height: '2px', width: '60px', background: '#D4AF37', margin: '16px auto 0 auto' }}></div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '60px', alignItems: 'center' }}>
          
          {/* Product Image Gallery Display */}
          <div>
            <div style={{ aspectRatio: '1/1', backgroundColor: 'rgba(10, 31, 20, 0.9)', border: '1px solid rgba(212,175,55,0.35)', borderRadius: '16px', overflow: 'hidden', position: 'relative', boxShadow: '0 25px 50px rgba(0,0,0,0.6)', marginBottom: '16px' }}>
              <img 
                src={selectedImage} 
                alt={product.title} 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <span style={{ position: 'absolute', top: '20px', left: '20px', backgroundColor: 'rgba(4, 12, 8, 0.92)', border: '1px solid rgba(212,175,55,0.5)', color: '#F5D77F', fontSize: '11px', textTransform: 'uppercase', fontWeight: 'bold', padding: '8px 14px', borderRadius: '4px', letterSpacing: '0.1em' }}>
                {product.category}
              </span>
            </div>
            
            {/* Thumbnails Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
              {productImages.map((img, idx) => (
                <div 
                  key={idx} 
                  onClick={() => setSelectedImage(img)}
                  style={{ 
                    aspectRatio: '1/1', 
                    borderRadius: '8px', 
                    overflow: 'hidden', 
                    cursor: 'pointer', 
                    border: selectedImage === img ? '2px solid #D4AF37' : '1px solid rgba(212,175,55,0.2)',
                    opacity: selectedImage === img ? 1 : 0.6,
                    transition: 'all 0.2s'
                  }}
                >
                  <img src={img} alt={`Thumb ${idx}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              ))}
            </div>
          </div>

          {/* Product Details & Purchase Form */}
          <div>
            <h3 style={{ fontSize: '36px', fontWeight: 'normal', color: '#FFFFFF', marginBottom: '12px', fontFamily: 'serif' }}>
              {product.title}
            </h3>
            <p style={{ fontStyle: 'italic', color: '#E6BE53', fontSize: '16px', marginBottom: '24px', fontFamily: 'serif' }}>Engineered anti-tarnish mirror gold • Dual emerald teardown stones</p>
            
            <div style={{ fontSize: '34px', fontWeight: 'bold', color: '#D4AF37', marginBottom: '24px', fontFamily: 'serif' }}>
              ₹{product.price} <span style={{ display: 'block', fontSize: '11px', color: '#94A3B8', fontWeight: 'normal', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: '6px', fontFamily: 'sans-serif' }}>Inclusive of all taxes & express shipping</span>
            </div>

            <p style={{ color: '#CBD5E1', fontWeight: 300, lineHeight: 1.8, marginBottom: '32px', fontSize: '15px' }}>
              Featuring stunning dual pear-cut emerald stones framed by brilliant micro-pavé crystals along a polished 18k gold band. Built to withstand daily wear without fading or tarnishing.
            </p>

            {orderPlaced ? (
              <div style={{ padding: '24px', backgroundColor: 'rgba(15, 45, 30, 0.85)', border: '1px solid rgba(212,175,55,0.6)', borderRadius: '10px', textAlign: 'center' }}>
                <p style={{ color: '#F5D77F', fontSize: '18px', fontWeight: 'bold', fontFamily: 'serif', marginBottom: '6px' }}>🎉 Order Placed Successfully!</p>
                <p style={{ fontSize: '13px', color: '#CBD5E1' }}>Thank you for shopping with ZUVI. Your order is confirmed and preparing for priority dispatch.</p>
              </div>
            ) : (
              <button
                onClick={() => setIsCheckoutOpen(true)}
                style={{ width: '100%', maxWidth: '340px', padding: '16px', background: 'linear-gradient(135deg, #D4AF37, #AA8822)', color: '#040C08', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.15em', borderRadius: '6px', cursor: 'pointer', border: 'none', boxShadow: '0 0 30px rgba(212,175,55,0.35)', fontSize: '14px' }}
              >
                Secure Your Piece — ₹{product.price}
              </button>
            )}
          </div>
        </div>
      </section>

      {/* The ZUVI Standard Section */}
      <section id="standards" style={{ padding: '90px 24px', backgroundColor: '#07160E', borderTop: '1px solid rgba(212,175,55,0.15)', borderBottom: '1px solid rgba(212,175,55,0.15)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
          <p style={{ color: '#D4AF37', fontSize: '12px', letterSpacing: '0.25em', textTransform: 'uppercase', marginBottom: '8px' }}>Why ZUVI</p>
          <h2 style={{ fontSize: '32px', color: '#FFFFFF', fontFamily: 'serif', marginBottom: '50px' }}>The Anti-Tarnish Promise</h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '30px', textAlign: 'left' }}>
            <div style={{ backgroundColor: '#0A1F14', padding: '30px', borderRadius: '12px', border: '1px solid rgba(212,175,55,0.2)' }}>
              <div style={{ fontSize: '28px', marginBottom: '16px' }}>🛡️</div>
              <h3 style={{ fontSize: '18px', color: '#F5D77F', marginBottom: '10px', fontFamily: 'serif' }}>Advanced Anti-Tarnish Layer</h3>
              <p style={{ fontSize: '14px', color: '#94A3B8', lineHeight: 1.6 }}>Specially treated coating ensures your rings never dull, fade, or turn your skin green over time.</p>
            </div>
            <div style={{ backgroundColor: '#0A1F14', padding: '30px', borderRadius: '12px', border: '1px solid rgba(212,175,55,0.2)' }}>
              <div style={{ fontSize: '28px', marginBottom: '16px' }}>💧</div>
              <h3 style={{ fontSize: '18px', color: '#F5D77F', marginBottom: '10px', fontFamily: 'serif' }}>Water & Sweat Resistant</h3>
              <p style={{ fontSize: '14px', color: '#94A3B8', lineHeight: 1.6 }}>Wear it seamlessly in the shower, at the gym, or through daily routines without taking it off.</p>
            </div>
            <div style={{ backgroundColor: '#0A1F14', padding: '30px', borderRadius: '12px', border: '1px solid rgba(212,175,55,0.2)' }}>
              <div style={{ fontSize: '28px', marginBottom: '16px' }}>✨</div>
              <h3 style={{ fontSize: '18px', color: '#F5D77F', marginBottom: '10px', fontFamily: 'serif' }}>Signature Packaging</h3>
              <p style={{ fontSize: '14px', color: '#94A3B8', lineHeight: 1.6 }}>Every order arrives in custom emerald and gold ZUVI unboxing packaging designed for preservation.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Brand Story & Founder Section */}
      <section id="story" style={{ padding: '100px 24px', maxWidth: '900px', margin: '0 auto', textAlign: 'center' }}>
        <p style={{ color: '#D4AF37', fontSize: '12px', letterSpacing: '0.25em', textTransform: 'uppercase', marginBottom: '12px' }}>The Vision</p>
        <h2 style={{ fontSize: '36px', color: '#FFFFFF', fontFamily: 'serif', marginBottom: '24px' }}>Made To Be Seen</h2>
        <p style={{ fontSize: '16px', color: '#CBD5E1', lineHeight: 1.8, marginBottom: '24px', fontWeight: 300 }}>
          ZUVI was founded by Anant Pratap Singh with a singular objective: to eliminate the compromise between high-end aesthetic jewelry and practical durability. We believe true luxury shouldn't require delicate handling.
        </p>
        <div style={{ fontSize: '14px', fontStyle: 'italic', color: '#F5D77F', fontFamily: 'serif' }}>
          — Anant Pratap Singh, Founder of ZUVI
        </div>
      </section>

      {/* Footer */}
      <footer style={{ backgroundColor: '#020604', borderTop: '1px solid rgba(212,175,55,0.2)', padding: '50px 24px', textAlign: 'center' }}>
        <span style={{ fontSize: '24px', fontWeight: 'bold', letterSpacing: '0.2em', background: 'linear-gradient(135deg, #FFF6D6 0%, #D4AF37 50%, #AA8822 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontFamily: 'serif' }}>
          ZUVI
        </span>
        <p style={{ fontSize: '12px', color: '#64748B', marginTop: '12px', letterSpacing: '0.05em' }}>
          © 2026 ZUVI. All rights reserved. Crafted with precision.
        </p>
      </footer>

      {/* Checkout Modal Form */}
      {isCheckoutOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, backgroundColor: 'rgba(0, 0, 0, 0.85)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ backgroundColor: '#0A1F14', maxWidth: '440px', width: '100%', borderRadius: '16px', padding: '30px', border: '1px solid rgba(212,175,55,0.4)', position: 'relative', boxShadow: '0 25px 50px rgba(0,0,0,0.8)' }}>
            <button onClick={() => setIsCheckoutOpen(false)} style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', color: '#94A3B8', fontSize: '18px', cursor: 'pointer' }}>✕</button>
            <h3 style={{ fontSize: '24px', fontWeight: 'bold', color: '#FFFFFF', marginBottom: '4px', fontFamily: 'serif' }}>Complete Your Order</h3>
            <p style={{ fontSize: '12px', color: '#F5D77F', marginBottom: '20px' }}>{product.title} (₹{product.price})</p>
            
            <form onSubmit={handleCheckoutSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#CBD5E1', marginBottom: '6px' }}>Full Name</label>
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
                <label style={{ display: 'block', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#CBD5E1', marginBottom: '6px' }}>Phone Number (10 Digits)</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={handlePhoneChange}
                  maxLength={10}
                  style={{ width: '100%', backgroundColor: '#040C08', border: '1px solid rgba(212,175,55,0.3)', borderRadius: '6px', padding: '12px', color: '#FFFFFF', outline: 'none', boxSizing: 'border-box' }}
                  placeholder="9876543210"
                />
                {phoneError && <p style={{ fontSize: '11px', color: '#EF4444', marginTop: '4px' }}>{phoneError}</p>}
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#CBD5E1', marginBottom: '6px' }}>Pincode</label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
                  style={{ width: '100%', backgroundColor: '#040C08', border: '1px solid rgba(212,175,55,0.3)', borderRadius: '6px', padding: '12px', color: '#FFFFFF', outline: 'none', boxSizing: 'border-box' }}
                  placeholder="201001"
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#CBD5E1', marginBottom: '6px' }}>Complete Delivery Address</label>
                <textarea
                  required
                  rows={2}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  style={{ width: '100%', backgroundColor: '#040C08', border: '1px solid rgba(212,175,55,0.3)', borderRadius: '6px', padding: '12px', color: '#FFFFFF', outline: 'none', boxSizing: 'border-box', resize: 'vertical' }}
                  placeholder="Hostel Room, Campus, City"
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                style={{ width: '100%', padding: '14px', backgroundColor: '#D4AF37', color: '#040C08', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.12em', borderRadius: '6px', cursor: 'pointer', border: 'none', marginTop: '6px' }}
              >
                {isSubmitting ? 'Sending Details...' : `Proceed to UPI Payment (₹${product.price})`}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Local UPI Payment Modal with Real QR Code */}
      {isUpiModalOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, backgroundColor: 'rgba(0, 0, 0, 0.90)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ backgroundColor: '#0A1F14', maxWidth: '380px', width: '100%', borderRadius: '16px', padding: '30px', border: '1px solid rgba(212,175,55,0.4)', textAlign: 'center', position: 'relative', boxShadow: '0 25px 50px rgba(0,0,0,0.8)' }}>
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
            <p style={{ fontSize: '14px', color: '#F5D77F', marginBottom: '6px', fontWeight: 'bold' }}>Item: {product.title}</p>
            <p style={{ fontSize: '14px', color: '#F5D77F', marginBottom: '20px', fontWeight: 'bold' }}>Amount to Pay: ₹{product.price}</p>

            <button
              onClick={confirmUpiPayment}
              style={{ width: '100%', padding: '14px', backgroundColor: '#D4AF37', color: '#040C08', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.12em', borderRadius: '6px', cursor: 'pointer', border: 'none' }}
            >
              I Have Paid — Complete Order
            </button>
          </div>
        </div>
      )}

    </div>
  );
}