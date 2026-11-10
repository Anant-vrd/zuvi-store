'use client';

import React, { useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

export default function ZuviStore() {
  const { scrollYProgress } = useScroll();
  const heroOpacity = useTransform(scrollYProgress, [0, 0.15], [1, 0]);

  // Real Product Photo Angles (public/images/ring1.jpeg - ring4.jpeg)
  const ringAngles = [
    { id: 'ring1.jpeg', label: 'Top View' },
    { id: 'ring2.jpeg', label: 'Front Angle' },
    { id: 'ring3.jpeg', label: 'Side Profile' },
    { id: 'ring4.jpeg', label: 'Stone Detail' },
  ];
  const [currentRingIndex, setCurrentRingIndex] = useState(0);

  // IMS Event Video Reels (public/videos/video1.mp4 - video3.mp4)
  const [activeVideo, setActiveVideo] = useState('video1.mp4');
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);

  // Checkout State
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', phone: '', address: '', pincode: '', city: '' });
  const [errors, setErrors] = useState<{ phone?: string; pincode?: string }>({});
  const [step, setStep] = useState<'form' | 'qr' | 'success'>('form');

  const product = {
    name: 'Imperial Emerald Ring',
    price: 350,
    originalPrice: 999,
    tagline: 'Dual emerald stones in solid 18k vacuum-plated gold. Built for daily wear.',
  };

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
    <div className="min-h-screen bg-[#06090e] text-slate-100 font-sans selection:bg-amber-500 selection:text-slate-950 overflow-x-hidden">
      
      {/* Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[400px] bg-emerald-950/20 rounded-full blur-[140px] pointer-events-none" />

      {/* Announcement Bar */}
      <div className="bg-emerald-950/80 text-emerald-300 text-[11px] py-2 px-4 text-center tracking-widest font-mono uppercase border-b border-emerald-900/50 backdrop-blur-md relative z-50">
        IMS Ghaziabad Event: 80+ Rings Sold in 2 Hours • Launch Price ₹350
      </div>

      {/* Navigation Header */}
      <header className="border-b border-slate-900 bg-[#06090e]/80 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-serif tracking-widest text-amber-400 font-bold">ZUVI</h1>
            <span className="hidden sm:inline-block text-[10px] uppercase tracking-wider text-slate-400 border border-slate-800 px-2.5 py-0.5 rounded-full font-mono">
              Anti-Tarnish Jewelry
            </span>
          </div>

          <div className="flex items-center gap-6">
            <nav className="hidden md:flex items-center gap-6 text-xs uppercase tracking-wider text-slate-400 font-mono">
              <a href="#inspector" className="hover:text-amber-400 transition">Ring Details</a>
              <a href="#proof" className="hover:text-amber-400 transition">Why It Lasts</a>
              <a href="#event" className="hover:text-amber-400 transition">IMS Event</a>
            </nav>
            <button 
              onClick={handleBuyNow}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-5 py-2 rounded-lg transition text-xs font-mono"
            >
              Get Ring — ₹350
            </button>
          </div>
        </div>
      </header>

      {/* Natural Hero Section */}
      <motion.section 
        style={{ opacity: heroOpacity }}
        className="relative pt-16 pb-12 px-6 text-center max-w-4xl mx-auto space-y-6"
      >
        <div className="inline-block bg-emerald-950/60 border border-emerald-800/60 px-3.5 py-1 rounded-full text-amber-400 text-[11px] font-mono">
          Launch Price ₹350
        </div>

        <h2 className="text-4xl md:text-6xl font-serif text-white tracking-tight leading-tight">
          Jewelry you can wear every day <br className="hidden sm:inline" />
          <span className="text-amber-400 italic font-normal">without worrying about fading.</span>
        </h2>

        <p className="text-slate-400 text-base md:text-lg max-w-xl mx-auto font-light leading-relaxed">
          No green marks. No color chipping when you sweat, wash your hands, or head to campus. Real 18k vacuum-gold made for daily life.
        </p>

        <div className="flex flex-wrap justify-center gap-4 pt-2">
          <button 
            onClick={handleBuyNow}
            className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-8 py-3.5 rounded-xl transition text-sm font-mono shadow-lg shadow-amber-500/10"
          >
            Order Now — ₹350
          </button>
          <a 
            href="#inspector"
            className="border border-slate-800 hover:border-slate-600 text-slate-300 px-6 py-3.5 rounded-xl transition text-sm font-mono"
          >
            See Close-Ups
          </a>
        </div>
      </motion.section>

      {/* Product Image Inspector */}
      <section id="inspector" className="max-w-5xl mx-auto px-6 py-12">
        <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6 md:p-10 shadow-xl backdrop-blur-md">
          
          <div className="flex flex-col md:flex-row items-center gap-10">
            {/* Real Product Image Stage */}
            <div className="w-full md:w-1/2 h-72 md:h-96 relative flex items-center justify-center p-4 bg-slate-950/60 rounded-2xl border border-slate-800/80">
              <motion.img 
                key={ringAngles[currentRingIndex].id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.25 }}
                src={`/images/${ringAngles[currentRingIndex].id}`} 
                alt={ringAngles[currentRingIndex].label}
                className="max-h-full max-w-full object-contain filter drop-shadow-xl"
              />
            </div>

            {/* Details & Angle Switcher */}
            <div className="w-full md:w-1/2 space-y-6">
              <div>
                <span className="text-xs uppercase font-mono text-amber-400">Real Studio Photos</span>
                <h3 className="text-2xl md:text-3xl font-serif text-white mt-1">{product.name}</h3>
                <p className="text-slate-400 text-sm mt-2 leading-relaxed font-light">
                  {product.tagline} Tested by students on campus during our live exhibition.
                </p>
              </div>

              {/* Angle Selector */}
              <div className="space-y-2">
                <span className="text-[11px] uppercase font-mono text-slate-500">Select Angle:</span>
                <div className="grid grid-cols-2 gap-2">
                  {ringAngles.map((angle, idx) => (
                    <button
                      key={angle.id}
                      onClick={() => setCurrentRingIndex(idx)}
                      className={`px-3 py-2.5 rounded-lg border text-xs font-mono text-left transition ${
                        currentRingIndex === idx 
                          ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold' 
                          : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      {angle.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-serif text-amber-400 font-bold">₹{product.price}</span>
                    <span className="text-sm text-slate-500 line-through">₹{product.originalPrice}</span>
                  </div>
                  <span className="text-[11px] text-emerald-400 font-mono">Free delivery on campus</span>
                </div>
                <button 
                  onClick={handleBuyNow}
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-6 py-3 rounded-xl transition text-xs font-mono"
                >
                  Buy Now
                </button>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Humanized Feature Section */}
      <section id="proof" className="max-w-5xl mx-auto px-6 py-16">
        <div className="text-center mb-10">
          <h3 className="text-3xl font-serif text-white">Why this ring won't turn your finger green</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-900/30 border border-slate-800/80 rounded-2xl p-6 space-y-3">
            <h4 className="text-xl font-serif text-white">Real gold that stays</h4>
            <p className="text-slate-400 text-sm font-light leading-relaxed">
              Most cheap rings use thin plating that starts peeling in a few days. We use vacuum plating so the 18k gold actually sticks and doesn’t wear off easily.
            </p>
          </div>

          <div className="bg-slate-900/30 border border-slate-800/80 rounded-2xl p-6 space-y-3">
            <h4 className="text-xl font-serif text-white">No need to remove it</h4>
            <p className="text-slate-400 text-sm font-light leading-relaxed">
              Wash your hands, go to the gym, get caught in rain — you can keep it on. It’s made for daily use.
            </p>
          </div>

          <div className="bg-slate-900/30 border border-slate-800/80 rounded-2xl p-6 space-y-3">
            <h4 className="text-xl font-serif text-white">Stones that don’t fall out</h4>
            <p className="text-slate-400 text-sm font-light leading-relaxed">
              The emeralds are held with proper prongs, not just glued. They’re much less likely to come loose.
            </p>
          </div>
        </div>

        {/* Casual Grounding Summary Line */}
        <div className="text-center mt-8">
          <p className="text-slate-500 text-xs font-mono italic">Basically, it’s built to survive real student life.</p>
        </div>
      </section>

      {/* Authentic IMS Ghaziabad Offline Event Section */}
      <section id="event" className="max-w-5xl mx-auto px-6 py-16">
        <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 md:p-10 shadow-xl backdrop-blur-md">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            
            <div className="space-y-5">
              <span className="bg-amber-500/20 text-amber-400 text-[11px] font-mono px-3 py-1 rounded-full border border-amber-500/30">
                REAL EVENT PROOF
              </span>
              <h3 className="text-3xl font-serif text-white">IMS Ghaziabad Event</h3>
              <p className="text-slate-300 text-sm leading-relaxed font-light">
                We brought ZUVI directly to students at our IMS Ghaziabad campus exhibition. Over 80+ rings were picked up live on the spot within 2 hours.
              </p>

              <div className="flex gap-4 font-mono text-xs text-slate-400 pt-2">
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span className="text-amber-400 font-bold text-base block">80+ Sold</span>
                  In 120 Minutes
                </div>
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span className="text-amber-400 font-bold text-base block">Live Try-Ons</span>
                  Instant UPI
                </div>
              </div>

              {/* Reel Triggers */}
              <div className="space-y-2 pt-2">
                {[
                  { title: 'IMS Event Highlights', file: 'video1.mp4' },
                  { title: 'Student Try-Ons & Feedback', file: 'video2.mp4' },
                  { title: 'Behind The Scenes Reel', file: 'video3.mp4' },
                ].map((vid) => (
                  <button
                    key={vid.file}
                    onClick={() => { setActiveVideo(vid.file); setIsVideoModalOpen(true); }}
                    className={`w-full flex items-center justify-between p-3 rounded-xl border text-xs font-mono text-left transition ${
                      activeVideo === vid.file 
                        ? 'bg-emerald-950/40 border-amber-400 text-white' 
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <span>▶ {vid.title}</span>
                    <span className="text-amber-400">Play Reel</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Embedded Video Box */}
            <div className="h-80 bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 relative flex items-center justify-center">
              <video 
                key={activeVideo}
                controls
                autoPlay
                muted
                loop
                className="w-full h-full object-cover"
              >
                <source src={`/videos/${activeVideo}`} type="video/mp4" />
                Your browser does not support video.
              </video>
            </div>

          </div>
        </div>
      </section>

      {/* Fullscreen Video Modal */}
      {isVideoModalOpen && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="relative w-full max-w-3xl bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 shadow-2xl">
            <button 
              onClick={() => setIsVideoModalOpen(false)}
              className="absolute top-4 right-4 text-white text-lg bg-slate-950/80 w-8 h-8 rounded-full flex items-center justify-center hover:bg-amber-500 hover:text-slate-950 transition"
            >
              ✕
            </button>
            <div className="aspect-video w-full bg-slate-950 flex items-center justify-center">
              <video controls autoPlay className="w-full h-full object-contain">
                <source src={`/videos/${activeVideo}`} type="video/mp4" />
              </video>
            </div>
          </div>
        </div>
      )}

      {/* Checkout Modal */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-2xl p-6 md:p-8 shadow-2xl relative my-8">
            <button 
              onClick={() => setIsCheckoutOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white text-lg"
            >
              ✕
            </button>

            {step === 'form' && (
              <form onSubmit={validateAndProceed} className="space-y-4">
                <h3 className="text-2xl font-serif text-amber-400 mb-1">Enter Shipping Details</h3>
                <p className="text-xs text-slate-400 mb-4">Item: <span className="text-white font-medium">{product.name}</span> — <span className="text-amber-400 font-bold">₹{product.price}</span></p>

                <div>
                  <label className="block text-xs uppercase font-mono text-slate-400 mb-1">Full Name</label>
                  <input 
                    type="text" 
                    required 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-amber-400"
                    placeholder="Chitranjan Vikram Singh"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase font-mono text-slate-400 mb-1">Mobile Number</label>
                  <input 
                    type="tel" 
                    required 
                    maxLength={10}
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-amber-400"
                    placeholder="9876543210"
                  />
                  {errors.phone && <p className="text-rose-400 text-xs mt-1">{errors.phone}</p>}
                </div>

                <div>
                  <label className="block text-xs uppercase font-mono text-slate-400 mb-1">Delivery Address</label>
                  <textarea 
                    required 
                    rows={2}
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-amber-400 resize-none"
                    placeholder="Hostel Room / Street Address"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs uppercase font-mono text-slate-400 mb-1">City</label>
                    <input 
                      type="text" 
                      required 
                      value={formData.city}
                      onChange={(e) => setFormData({...formData, city: e.target.value})}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-amber-400"
                      placeholder="Ghaziabad"
                    />
                  </div>
                  <div>
                    <label className="block text-xs uppercase font-mono text-slate-400 mb-1">Pincode</label>
                    <input 
                      type="text" 
                      required 
                      maxLength={6}
                      value={formData.pincode}
                      onChange={(e) => setFormData({...formData, pincode: e.target.value})}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-amber-400"
                      placeholder="201009"
                    />
                    {errors.pincode && <p className="text-rose-400 text-xs mt-1">{errors.pincode}</p>}
                  </div>
                </div>

                <button 
                  type="submit"
                  className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-3.5 rounded-xl transition mt-4 font-mono text-xs uppercase tracking-wider"
                >
                  Pay via UPI (₹350)
                </button>
              </form>
            )}

            {step === 'qr' && (
              <div className="text-center space-y-6 py-2">
                <h3 className="text-2xl font-serif text-amber-400">Scan & Pay ₹{product.price}</h3>
                <p className="text-xs text-slate-400 font-mono">Use Google Pay, PhonePe, Paytm, or BHIM</p>
                
                <div className="bg-white p-4 rounded-2xl w-56 h-56 mx-auto flex items-center justify-center border-4 border-amber-500/20 shadow-xl">
                  <img src="/images/qr.png" alt="UPI QR Code" className="w-full h-full object-contain" />
                </div>

                <button 
                  onClick={handlePaymentConfirmed}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3.5 rounded-xl transition font-mono text-xs uppercase tracking-wider"
                >
                  I Have Completed Payment
                </button>
              </div>
            )}

            {step === 'success' && (
              <div className="text-center space-y-6 py-6">
                <div className="w-14 h-14 bg-emerald-500/20 border border-emerald-500 text-emerald-400 rounded-full flex items-center justify-center mx-auto text-xl">
                  ✓
                </div>
                <h3 className="text-2xl font-serif text-white">Order Confirmed!</h3>
                <p className="text-slate-400 text-sm max-w-sm mx-auto font-light">
                  Thanks for ordering from ZUVI! We've recorded your order details and will dispatch it shortly.
                </p>
                <button 
                  onClick={() => setIsCheckoutOpen(false)}
                  className="bg-slate-800 hover:bg-slate-700 text-white font-mono text-xs uppercase px-6 py-2.5 rounded-xl transition"
                >
                  Back to Store
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-[#06090e] py-12">
        <div className="max-w-6xl mx-auto px-6 text-center text-slate-500 text-xs font-mono space-y-3">
          <p className="font-serif text-amber-400 tracking-widest text-base font-bold">ZUVI JEWELRY</p>
          <p className="text-slate-400 font-light">Anti-tarnish jewelry designed for daily campus & lifestyle wear.</p>
          <p className="pt-2 text-slate-600">© 2026 ZUVI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}