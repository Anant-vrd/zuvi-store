'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform, useSpring, useMotionValue } from 'framer-motion';

// --- 3D Interactive Ring Canvas Component (WebGL style vector-rendered 3D gem) ---
function Interactive3DRing() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [25, -25]), { stiffness: 150, damping: 15 });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-35, 35]), { stiffness: 150, damping: 15 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const x = (e.clientX - rect.left) / width - 0.5;
    const y = (e.clientY - rect.top) / height - 0.5;
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <div 
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative w-full h-[450px] md:h-[550px] flex items-center justify-center cursor-grab active:cursor-grabbing perspective-1000 select-none"
    >
      {/* Dynamic 3D Floating Ring Showcase */}
      <motion.div 
        style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
        className="relative w-72 h-72 md:w-96 md:h-96 flex items-center justify-center"
      >
        {/* Ambient Outer Aura Glow */}
        <div className="absolute inset-0 bg-emerald-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute inset-4 bg-amber-500/15 rounded-full blur-2xl" />

        {/* 3D Ring Band Geometry Shadow */}
        <div 
          className="absolute w-64 h-64 md:w-80 md:h-80 rounded-full border-[18px] border-amber-400/90 shadow-[0_0_50px_rgba(251,191,36,0.4)] flex items-center justify-center transform backdrop-blur-sm"
          style={{ transform: 'translateZ(20px)' }}
        >
          {/* Inner Band Metallic Reflection */}
          <div className="w-full h-full rounded-full border-[6px] border-amber-200/50 opacity-80" />
        </div>

        {/* Dual 3D Emerald Gemstones */}
        <motion.div 
          style={{ transform: 'translateZ(65px)' }}
          className="absolute top-2 flex gap-3 z-30"
        >
          <div className="w-10 h-10 md:w-14 md:h-14 bg-gradient-to-tr from-emerald-950 via-emerald-500 to-emerald-300 rounded-lg rotate-45 border-2 border-amber-300 shadow-[0_0_30px_rgba(16,185,129,0.8)] animate-bounce" />
          <div className="w-10 h-10 md:w-14 md:h-14 bg-gradient-to-tr from-emerald-950 via-emerald-500 to-emerald-300 rounded-lg rotate-45 border-2 border-amber-300 shadow-[0_0_30px_rgba(16,185,129,0.8)] animate-bounce delay-150" />
        </motion.div>

        {/* 3D Vacuum-Plate Micro Badge */}
        <div 
          style={{ transform: 'translateZ(40px)' }}
          className="absolute bottom-6 bg-slate-950/90 border border-amber-400/50 px-4 py-1.5 rounded-full backdrop-blur-md shadow-2xl"
        >
          <span className="text-[10px] font-mono tracking-widest text-amber-300 uppercase">18K Vacuum Gold • Anti-Tarnish</span>
        </div>
      </motion.div>

      {/* Floating Interactive 3D Cursor Cue */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-[11px] font-mono tracking-widest text-slate-400 flex items-center gap-2 bg-slate-900/60 px-4 py-2 rounded-full border border-emerald-900/40 backdrop-blur-md">
        <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
        MOVE MOUSE TO ROTATE 3D RING
      </div>
    </div>
  );
}

export default function ZuviStore() {
  const { scrollYProgress } = useScroll();
  const opacityHero = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const scaleHero = useTransform(scrollYProgress, [0, 0.2], [1, 0.9]);

  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isVideoOpen, setIsVideoOpen] = useState(false);

  const product = {
    name: 'Imperial Emerald Anti-Tarnish Ring',
    price: 350,
    originalPrice: 999,
    tagline: 'Vacuum-plated 18k gold with dual brilliant-cut emerald stones.',
    badge: 'Launch Special — ₹350 ONLY'
  };

  const [formData, setFormData] = useState({ name: '', phone: '', address: '', pincode: '', city: '' });
  const [errors, setErrors] = useState<{ phone?: string; pincode?: string }>({});
  const [step, setStep] = useState<'form' | 'qr' | 'success'>('form');

  const handleBuyNow = () => {
    setIsCheckoutOpen(true);
    setStep('form');
  };

  const validateAndProceed = (e: React.FormEvent) => {
    e.preventDefault();
    let newErrors: { phone?: string; pincode?: string } = {};
    if (!/^\d{10}$/.test(formData.phone)) newErrors.phone = 'Please enter a valid 10-digit mobile number.';
    if (!/^\d{6}$/.test(formData.pincode)) newErrors.pincode = 'Please enter a valid 6-digit postal pincode.';
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }
    setErrors({});
    setStep('qr');
  };

  const handlePaymentConfirmed = async () => {
    try {
      await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          access_key: 'YOUR_WEB3FORMS_ACCESS_KEY',
          subject: `New ZUVI Order from ${formData.name}`,
          from_name: 'ZUVI Store',
          message: `Product: ${product.name} | Price: ₹${product.price} | Customer: ${formData.name} | Phone: ${formData.phone} | Address: ${formData.address}, ${formData.city} - ${formData.pincode}`
        }),
      });
    } catch (err) {
      console.error(err);
    }
    setStep('success');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-amber-500 selection:text-slate-950 overflow-x-hidden">
      
      {/* 3D Ambient Particle Grid Background */}
      <div className="fixed inset-0 pointer-events-none opacity-20 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:24px_24px]" />

      {/* Announcement Bar */}
      <div className="bg-emerald-950/90 text-emerald-300 text-[11px] py-2.5 px-4 text-center tracking-[0.2em] font-mono uppercase border-b border-emerald-800/60 backdrop-blur-md relative z-50">
        ✨ ZUVI POP-UP @ IMS CAMPUS • 80+ SOLD IN 2 HOURS ✨
      </div>

      {/* Navigation Header */}
      <header className="border-b border-emerald-900/40 bg-slate-950/80 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-serif tracking-[0.25em] text-amber-400 font-bold">ZUVI</h1>
            <span className="hidden sm:inline-block text-[9px] uppercase tracking-widest bg-emerald-900/40 text-emerald-300 px-3 py-1 rounded-full border border-emerald-700/40 font-mono">
              High Jewelry Architecture
            </span>
          </div>

          <div className="flex items-center gap-6">
            <nav className="hidden md:flex items-center gap-6 text-xs uppercase tracking-widest text-slate-300 font-mono">
              <a href="#hero3d" className="hover:text-amber-400 transition">3D View</a>
              <a href="#specs" className="hover:text-amber-400 transition">Durability</a>
              <a href="#event" className="hover:text-amber-400 transition">IMS Pop-Up</a>
            </nav>
            <button 
              onClick={handleBuyNow}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-6 py-2.5 rounded-xl transition duration-200 shadow-[0_0_20px_rgba(245,158,11,0.3)] text-xs uppercase tracking-wider font-mono"
            >
              Order Ring — ₹350
            </button>
          </div>
        </div>
      </header>

      {/* Hero 3D Scrollytelling Section */}
      <motion.section 
        style={{ opacity: opacityHero, scale: scaleHero }}
        id="hero3d" 
        className="relative min-h-[90vh] flex flex-col items-center justify-center px-6 pt-12 pb-24 overflow-hidden"
      >
        <div className="max-w-5xl mx-auto text-center space-y-6 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 bg-emerald-900/30 border border-emerald-700/50 px-4 py-1.5 rounded-full text-amber-400 text-[11px] uppercase tracking-[0.3em] font-mono"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            3D Interactive Jewelry Experience
          </motion.div>

          <motion.h2 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-8xl font-serif tracking-tight text-white leading-tight"
          >
            Immortal Style, <br />
            <span className="bg-gradient-to-r from-amber-200 via-amber-400 to-amber-600 bg-clip-text text-transparent italic">
              Never Fades.
            </span>
          </motion.h2>

          <p className="text-slate-400 text-base md:text-xl max-w-2xl mx-auto font-light leading-relaxed">
            Vacuum-plated 18K gold with dual brilliant-cut emerald stones. Water, sweat, and wear proof—engineered to stay glowing forever.
          </p>

          {/* Interactive 3D Canvas Embed */}
          <Interactive3DRing />

          <div className="flex flex-wrap justify-center gap-4 pt-4">
            <button 
              onClick={handleBuyNow}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-10 py-4 rounded-xl transition shadow-[0_0_30px_rgba(245,158,11,0.4)] text-sm uppercase tracking-wider font-mono"
            >
              Claim Imperial Ring — ₹350
            </button>
            <a 
              href="#event"
              className="border border-emerald-800/80 hover:border-amber-400 text-emerald-300 hover:text-white px-8 py-4 rounded-xl transition backdrop-blur-md text-sm font-mono tracking-wider uppercase flex items-center gap-3"
            >
              <span>▶</span> IMS Reel (80+ Sold)
            </a>
          </div>
        </div>
      </motion.section>

      {/* Scrollytelling Feature Bento Matrix */}
      <section id="specs" className="max-w-7xl mx-auto px-6 py-24">
        <div className="text-center mb-16 space-y-3">
          <span className="text-amber-400 text-xs font-mono uppercase tracking-[0.3em]">Built for Eternity</span>
          <h3 className="text-3xl md:text-5xl font-serif text-white">Why ZUVI Stands Alone</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card 1 */}
          <div className="bg-gradient-to-b from-emerald-950/40 to-slate-900/80 border border-emerald-800/40 rounded-3xl p-8 backdrop-blur-md space-y-4 hover:border-amber-400/50 transition duration-300 shadow-2xl">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-400/30 flex items-center justify-center text-amber-400 text-2xl font-serif">
              💧
            </div>
            <h4 className="text-2xl font-serif text-white">100% Water & Sweat Proof</h4>
            <p className="text-slate-400 text-sm leading-relaxed font-light">
              Shower, gym, or swim without taking it off. ZUVI's advanced vacuum coating resists oxidation indefinitely.
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-gradient-to-b from-emerald-950/40 to-slate-900/80 border border-emerald-800/40 rounded-3xl p-8 backdrop-blur-md space-y-4 hover:border-amber-400/50 transition duration-300 shadow-2xl">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-400/30 flex items-center justify-center text-amber-400 text-2xl font-serif">
              ✨
            </div>
            <h4 className="text-2xl font-serif text-white">18K Vacuum Gold Plating</h4>
            <p className="text-slate-400 text-sm leading-relaxed font-light">
              Unlike cheap electroplating, our vacuum PVD layer fuses gold molecules directly to stainless steel at high temperature.
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-gradient-to-b from-emerald-950/40 to-slate-900/80 border border-emerald-800/40 rounded-3xl p-8 backdrop-blur-md space-y-4 hover:border-amber-400/50 transition duration-300 shadow-2xl">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-400/30 flex items-center justify-center text-amber-400 text-2xl font-serif">
              🌿
            </div>
            <h4 className="text-2xl font-serif text-white">Hypoallergenic & Skin Safe</h4>
            <p className="text-slate-400 text-sm leading-relaxed font-light">
              Zero nickel, zero lead. Designed to never cause green skin marks or allergic reactions during daily wear.
            </p>
          </div>
        </div>
      </section>

      {/* IMS Event Video Section */}
      <section id="event" className="max-w-6xl mx-auto px-6 py-16">
        <div className="bg-slate-900/80 border border-emerald-800/40 rounded-3xl p-8 md:p-12 shadow-2xl relative overflow-hidden backdrop-blur-xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            <div className="space-y-6">
              <span className="bg-amber-500 text-slate-950 text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full font-mono">
                IMS CAMPUS POP-UP EXHIBITION
              </span>
              <h3 className="text-3xl md:text-4xl font-serif text-white">IMS Event Highlights</h3>
              <p className="text-slate-300 text-sm leading-relaxed font-light">
                Our offline exhibition at IMS campus sold over 80+ rings in just 2 hours! Students got to test anti-tarnish quality live and order instantly via UPI.
              </p>
              
              <ul className="space-y-3 text-xs font-mono text-slate-400">
                <li className="flex items-center gap-2">📍 <strong className="text-white">Venue:</strong> IMS Campus Main Atrium</li>
                <li className="flex items-center gap-2">⚡ <strong className="text-white">Sales Velocity:</strong> 80+ Rings Sold in 120 Minutes</li>
              </ul>

              <button 
                onClick={() => setIsVideoOpen(true)}
                className="bg-emerald-900/60 hover:bg-emerald-800/80 text-emerald-200 border border-emerald-700/60 px-6 py-3 rounded-xl transition text-xs font-mono uppercase tracking-wider flex items-center gap-3"
              >
                <span className="w-8 h-8 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center font-bold text-xs">▶</span>
                Play Live Pop-Up Reel
              </button>
            </div>

            {/* Video Play Trigger Box */}
            <div 
              onClick={() => setIsVideoOpen(true)}
              className="relative h-72 rounded-2xl overflow-hidden border border-emerald-800/50 bg-gradient-to-tr from-slate-950 via-emerald-950/60 to-slate-900 cursor-pointer group shadow-2xl flex items-center justify-center p-6 text-center"
            >
              <div className="relative z-20 space-y-3">
                <div className="w-16 h-16 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(245,158,11,0.5)] group-hover:scale-110 transition duration-300 font-bold text-lg">
                  ▶
                </div>
                <p className="text-white font-serif text-lg">IMS Campus Pop-Up Reel</p>
                <p className="text-amber-400 text-xs font-mono">Click to Watch Live Event</p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Interactive Video Modal */}
      {isVideoOpen && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="relative w-full max-w-3xl bg-slate-900 rounded-2xl overflow-hidden border border-emerald-800/50 shadow-2xl">
            <button 
              onClick={() => setIsVideoOpen(false)}
              className="absolute top-4 right-4 text-white text-xl z-10 bg-slate-950/80 w-10 h-10 rounded-full flex items-center justify-center hover:bg-amber-500 hover:text-slate-950 transition"
            >
              ✕
            </button>
            <div className="aspect-video w-full bg-slate-950 flex items-center justify-center">
              <iframe 
                className="w-full h-full"
                src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1" 
                title="ZUVI IMS Event Video"
                allow="autoplay; encrypted-media"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}

      {/* Checkout Modal */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-emerald-800/40 w-full max-w-lg rounded-2xl p-6 md:p-8 shadow-2xl relative my-8">
            <button 
              onClick={() => setIsCheckoutOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white text-xl"
            >
              ✕
            </button>

            {step === 'form' && (
              <form onSubmit={validateAndProceed} className="space-y-4">
                <h3 className="text-2xl font-serif text-amber-400 mb-2">Secure Checkout</h3>
                <p className="text-sm text-slate-400 mb-6">Ordering: <span className="text-white font-medium">{product.name}</span> (<span className="text-amber-400 font-bold">₹{product.price}</span>)</p>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-slate-400 mb-1 font-mono">Full Name</label>
                  <input 
                    type="text" 
                    required 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full bg-slate-950 border border-emerald-900/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-400"
                    placeholder="Chitranjan Vikram Singh"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-slate-400 mb-1 font-mono">Mobile Number (10 digits)</label>
                  <input 
                    type="tel" 
                    required 
                    maxLength={10}
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="w-full bg-slate-950 border border-emerald-900/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-400"
                    placeholder="9876543210"
                  />
                  {errors.phone && <p className="text-rose-400 text-xs mt-1">{errors.phone}</p>}
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-slate-400 mb-1 font-mono">Delivery Address</label>
                  <textarea 
                    required 
                    rows={2}
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    className="w-full bg-slate-950 border border-emerald-900/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-400 resize-none"
                    placeholder="Hostel room / Street address"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-slate-400 mb-1 font-mono">City</label>
                    <input 
                      type="text" 
                      required 
                      value={formData.city}
                      onChange={(e) => setFormData({...formData, city: e.target.value})}
                      className="w-full bg-slate-950 border border-emerald-900/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-400"
                      placeholder="Ghaziabad"
                    />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-slate-400 mb-1 font-mono">Pincode (6 digits)</label>
                    <input 
                      type="text" 
                      required 
                      maxLength={6}
                      value={formData.pincode}
                      onChange={(e) => setFormData({...formData, pincode: e.target.value})}
                      className="w-full bg-slate-950 border border-emerald-900/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-400"
                      placeholder="201009"
                    />
                    {errors.pincode && <p className="text-rose-400 text-xs mt-1">{errors.pincode}</p>}
                  </div>
                </div>

                <button 
                  type="submit"
                  className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-3.5 rounded-xl transition duration-200 mt-6 shadow-lg shadow-amber-500/20 uppercase tracking-wider font-mono text-sm"
                >
                  Proceed to UPI Payment
                </button>
              </form>
            )}

            {step === 'qr' && (
              <div className="text-center space-y-6 py-2">
                <h3 className="text-2xl font-serif text-amber-400">Scan & Pay ₹{product.price}</h3>
                <p className="text-sm text-slate-400">Scan using GPay, PhonePe, Paytm, or any UPI app</p>
                
                <div className="bg-white p-4 rounded-2xl w-56 h-56 mx-auto flex items-center justify-center border-4 border-amber-500/20 shadow-xl">
                  <span className="text-xs text-slate-800 font-mono text-center">Scan to Pay ₹350<br/>(Place qr.png in public/images)</span>
                </div>

                <button 
                  onClick={handlePaymentConfirmed}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3.5 rounded-xl transition duration-200 shadow-lg shadow-emerald-900/40 font-mono uppercase tracking-wider text-sm"
                >
                  I Have Paid – Complete Order
                </button>
              </div>
            )}

            {step === 'success' && (
              <div className="text-center space-y-6 py-6">
                <div className="w-16 h-16 bg-emerald-500/20 border border-emerald-500 text-emerald-400 rounded-full flex items-center justify-center mx-auto text-2xl animate-bounce">
                  ✓
                </div>
                <h3 className="text-3xl font-serif text-white">Order Confirmed!</h3>
                <p className="text-slate-400 text-sm max-w-sm mx-auto">
                  Thank you for shopping with ZUVI. Your order details have been recorded.
                </p>
                <button 
                  onClick={() => setIsCheckoutOpen(false)}
                  className="bg-emerald-700 hover:bg-emerald-600 text-white font-medium px-8 py-3 rounded-xl transition font-mono uppercase tracking-wider text-xs"
                >
                  Close & Return
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-emerald-900/40 bg-slate-950 py-16">
        <div className="max-w-7xl mx-auto px-6 text-center text-slate-500 text-xs space-y-4 font-mono">
          <p className="font-serif text-amber-400 tracking-[0.25em] text-lg font-bold">ZUVI HIGH JEWELRY</p>
          <p className="max-w-md mx-auto text-slate-400">Crafted for lifetime durability. Vacuum-plated anti-tarnish jewelry.</p>
          <p className="pt-4 border-t border-emerald-900/30">© 2026 ZUVI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}