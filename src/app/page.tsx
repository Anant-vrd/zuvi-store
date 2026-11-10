'use client';

import React, { useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

export default function ZuviStore() {
  const { scrollYProgress } = useScroll();
  const heroOpacity = useTransform(scrollYProgress, [0, 0.15], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.15], [1, 0.95]);

  // Ring Angles using your actual local photos in public/images/
  const ringAngles = [
    { id: 'ring1.jpeg', label: 'Front Brilliance' },
    { id: 'ring2.jpeg', label: 'Emerald Cut Angle' },
    { id: 'ring3.jpeg', label: '18K Band Profile' },
    { id: 'ring4.jpeg', label: 'Dual Stone Detail' },
  ];
  const [currentRingIndex, setCurrentRingIndex] = useState(0);

  // Video State for IMS Pop-Up Reels
  const [activeVideo, setActiveVideo] = useState('video1.mp4');
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);

  // Checkout State
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', phone: '', address: '', pincode: '', city: '' });
  const [errors, setErrors] = useState<{ phone?: string; pincode?: string }>({});
  const [step, setStep] = useState<'form' | 'qr' | 'success'>('form');

  const product = {
    name: 'Imperial Emerald Anti-Tarnish Ring',
    price: 350,
    originalPrice: 999,
    tagline: 'Vacuum-plated 18k gold with dual brilliant-cut emerald stones.',
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
    <div className="min-h-screen bg-[#030712] text-slate-100 font-sans selection:bg-amber-500 selection:text-slate-950 overflow-x-hidden">
      
      {/* Ambient Luxury Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-emerald-900/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-[35%] left-1/4 w-[600px] h-[600px] bg-amber-500/5 rounded-full blur-[160px] pointer-events-none" />

      {/* Announcement Bar */}
      <div className="bg-emerald-950/90 text-emerald-300 text-[11px] py-2.5 px-4 text-center tracking-[0.25em] font-mono uppercase border-b border-emerald-800/50 backdrop-blur-md relative z-50">
        ✨ ZUVI OFFSHORE POP-UP @ IMS CAMPUS • 80+ SOLD IN 2 HOURS ✨
      </div>

      {/* Sticky Navigation Header */}
      <header className="border-b border-emerald-900/30 bg-[#030712]/80 backdrop-blur-2xl sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-serif tracking-[0.3em] text-amber-400 font-bold">ZUVI</h1>
            <span className="hidden sm:inline-block text-[9px] uppercase tracking-widest bg-emerald-950 text-emerald-300 px-3 py-1 rounded-full border border-emerald-800/60 font-mono">
              High Jewelry Architecture
            </span>
          </div>

          <div className="flex items-center gap-6">
            <nav className="hidden md:flex items-center gap-6 text-xs uppercase tracking-widest text-slate-300 font-mono">
              <a href="#interactive-3d" className="hover:text-amber-400 transition">Ring Inspector</a>
              <a href="#science" className="hover:text-amber-400 transition">Anti-Tarnish Science</a>
              <a href="#event" className="hover:text-amber-400 transition">IMS Pop-Up</a>
            </nav>
            <button 
              onClick={handleBuyNow}
              className="bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-bold px-6 py-2.5 rounded-xl transition duration-300 shadow-[0_0_25px_rgba(245,158,11,0.3)] text-xs uppercase tracking-wider font-mono"
            >
              Order Ring — ₹350
            </button>
          </div>
        </div>
      </header>

      {/* Cinematic Hero Section */}
      <motion.section 
        style={{ opacity: heroOpacity, scale: heroScale }}
        className="relative min-h-[75vh] flex flex-col items-center justify-center px-6 pt-10 pb-16 text-center"
      >
        <div className="max-w-4xl mx-auto space-y-6 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 bg-emerald-950/80 border border-emerald-800/80 px-4 py-1.5 rounded-full text-amber-400 text-[11px] uppercase tracking-[0.3em] font-mono shadow-lg"
          >
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            Launch Special Collection
          </motion.div>

          <motion.h2 
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-8xl font-serif tracking-tight text-white leading-[1.08]"
          >
            Uncompromising Radiance, <br />
            <span className="bg-gradient-to-r from-amber-200 via-amber-400 to-amber-600 bg-clip-text text-transparent italic">
              Built for Eternity.
            </span>
          </motion.h2>

          <motion.p 
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-slate-400 text-base md:text-lg max-w-xl mx-auto font-light leading-relaxed"
          >
            Vacuum-plated 18K gold with dual brilliant-cut emerald stones. Designed to resist water, sweat, and daily wear without ever losing its luster.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-wrap justify-center gap-4 pt-2"
          >
            <button 
              onClick={handleBuyNow}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-10 py-4 rounded-xl transition shadow-[0_0_35px_rgba(245,158,11,0.4)] text-sm uppercase tracking-wider font-mono"
            >
              Claim Imperial Ring — ₹350
            </button>
            <a 
              href="#interactive-3d"
              className="border border-emerald-800/80 hover:border-amber-400 text-emerald-200 hover:text-white px-8 py-4 rounded-xl transition backdrop-blur-md text-sm font-mono tracking-wider uppercase flex items-center gap-2"
            >
              <span>↓</span> Inspect Ring Angles
            </a>
          </motion.div>
        </div>
      </motion.section>

      {/* Interactive Ring Angle Inspector Showcase */}
      <section id="interactive-3d" className="max-w-6xl mx-auto px-6 py-16">
        <div className="text-center space-y-3 mb-10">
          <span className="text-amber-400 text-xs font-mono uppercase tracking-[0.3em]">Multi-Angle Inspector</span>
          <h3 className="text-3xl md:text-5xl font-serif text-white">Examine Every Detail</h3>
          <p className="text-slate-400 text-sm max-w-lg mx-auto font-light">
            Select different views to inspect the mirror polish, gold refraction, and dual emerald stone setting.
          </p>
        </div>

        <div className="bg-gradient-to-b from-emerald-950/30 to-[#030712] border border-emerald-800/50 rounded-3xl p-6 md:p-10 shadow-2xl relative overflow-hidden backdrop-blur-xl">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-amber-500/10 via-transparent to-transparent pointer-events-none" />

          {/* Active Ring Image Stage */}
          <div className="relative h-80 md:h-[420px] flex items-center justify-center p-4">
            <motion.img 
              key={ringAngles[currentRingIndex].id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              src={`/images/${ringAngles[currentRingIndex].id}`} 
              alt={ringAngles[currentRingIndex].label}
              className="max-h-full max-w-full object-contain filter drop-shadow-[0_25px_35px_rgba(0,0,0,0.8)] relative z-10"
            />
          </div>

          {/* Angle Switcher Buttons */}
          <div className="flex flex-wrap justify-center items-center gap-3 mt-8 pt-6 border-t border-emerald-900/40 relative z-20">
            {ringAngles.map((angle, idx) => (
              <button
                key={angle.id}
                onClick={() => setCurrentRingIndex(idx)}
                className={`flex items-center gap-3 px-5 py-3 rounded-xl border text-xs font-mono tracking-wider uppercase transition duration-300 ${
                  currentRingIndex === idx 
                    ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold shadow-lg shadow-amber-500/20 scale-105' 
                    : 'bg-slate-900/80 border-emerald-900/60 text-slate-300 hover:border-amber-400/50'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${currentRingIndex === idx ? 'bg-slate-950' : 'bg-emerald-400'}`} />
                {angle.label}
              </button>
            ))}
          </div>

          {/* Pricing & Instant Buy Bar */}
          <div className="mt-8 bg-slate-950/90 border border-emerald-900/60 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-6 relative z-20 shadow-xl">
            <div>
              <div className="flex items-center gap-3">
                <span className="text-3xl font-serif text-amber-400 font-bold">₹{product.price}</span>
                <span className="text-base text-slate-500 line-through">₹{product.originalPrice}</span>
                <span className="text-[10px] bg-emerald-900/80 text-emerald-300 px-2.5 py-1 rounded-md font-mono border border-emerald-700/50">Save 65% Launch Deal</span>
              </div>
              <p className="text-xs text-slate-400 mt-1">{product.tagline}</p>
            </div>
            <button 
              onClick={handleBuyNow}
              className="w-full sm:w-auto bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-8 py-3.5 rounded-xl transition shadow-lg shadow-amber-500/20 text-xs uppercase tracking-wider font-mono"
            >
              Buy Imperial Ring — ₹350
            </button>
          </div>
        </div>
      </section>

      {/* Scrollytelling Science Section with Staggered Motion */}
      <section id="science" className="max-w-7xl mx-auto px-6 py-24">
        <div className="text-center mb-16 space-y-3">
          <span className="text-amber-400 text-xs font-mono uppercase tracking-[0.3em]">Material Science</span>
          <h3 className="text-3xl md:text-5xl font-serif text-white">Why ZUVI Never Fades</h3>
          <p className="text-slate-400 text-sm max-w-xl mx-auto">
            Traditional jewelry uses weak electroplating that chips in weeks. ZUVI is engineered with aerospace-grade durability.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            whileHover={{ y: -5 }}
            className="bg-gradient-to-b from-emerald-950/40 to-slate-900/80 border border-emerald-800/40 rounded-3xl p-8 backdrop-blur-md space-y-4 shadow-xl relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl group-hover:bg-amber-500/10 transition" />
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-400/30 flex items-center justify-center text-amber-400 text-xl font-serif">
              01
            </div>
            <h4 className="text-2xl font-serif text-white">Vacuum PVD Bonding</h4>
            <p className="text-slate-400 text-sm leading-relaxed font-light">
              Gold ions are vaporized in a vacuum chamber and permanently fused into the stainless steel substrate at molecular levels.
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            whileHover={{ y: -5 }}
            className="bg-gradient-to-b from-emerald-950/40 to-slate-900/80 border border-emerald-800/40 rounded-3xl p-8 backdrop-blur-md space-y-4 shadow-xl relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl group-hover:bg-amber-500/10 transition" />
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-400/30 flex items-center justify-center text-amber-400 text-xl font-serif">
              02
            </div>
            <h4 className="text-2xl font-serif text-white">Water & Sweat Armor</h4>
            <p className="text-slate-400 text-sm leading-relaxed font-light">
              Completely waterproof and sweat-proof. Wear it in the gym, shower, or pool without tarnishing, oxidation, or turning skin green.
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            whileHover={{ y: -5 }}
            className="bg-gradient-to-b from-emerald-950/40 to-slate-900/80 border border-emerald-800/40 rounded-3xl p-8 backdrop-blur-md space-y-4 shadow-xl relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl group-hover:bg-amber-500/10 transition" />
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-400/30 flex items-center justify-center text-amber-400 text-xl font-serif">
              03
            </div>
            <h4 className="text-2xl font-serif text-white">Brilliant-Cut Emeralds</h4>
            <p className="text-slate-400 text-sm leading-relaxed font-light">
              Hand-set dual emerald stones precision-crafted to refract light dynamically from every angle with mirror-like clarity.
            </p>
          </motion.div>
        </div>
      </section>

      {/* High-Visual-Weight IMS Pop-Up Section */}
      <section id="event" className="max-w-6xl mx-auto px-6 py-20">
        <div className="bg-slate-900/90 border border-emerald-800/40 rounded-3xl p-8 md:p-14 shadow-2xl relative overflow-hidden backdrop-blur-xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            <div className="space-y-6">
              <span className="bg-amber-500 text-slate-950 text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full font-mono">
                IMS CAMPUS POP-UP EXHIBITION
              </span>
              <h3 className="text-3xl md:text-5xl font-serif text-white">80+ Rings Sold in 120 Minutes</h3>
              <p className="text-slate-300 text-sm leading-relaxed font-light">
                Our offline launch at IMS campus brought out an incredible crowd. Students experienced the anti-tarnish quality live, tried them on, and paid instantly via UPI in under 30 seconds.
              </p>
              
              <div className="grid grid-cols-2 gap-4 pt-2 font-mono text-xs">
                <div className="bg-emerald-950/60 border border-emerald-800/50 p-4 rounded-xl shadow-lg">
                  <span className="text-amber-400 text-xl font-bold block">80+ Sold</span>
                  <span className="text-slate-400">In 2 Hours Live</span>
                </div>
                <div className="bg-emerald-950/60 border border-emerald-800/50 p-4 rounded-xl shadow-lg">
                  <span className="text-amber-400 text-xl font-bold block">&lt; 30 Sec</span>
                  <span className="text-slate-400">Instant UPI Checkout</span>
                </div>
              </div>

              {/* Video Selector Tabs */}
              <div className="flex flex-col gap-2 pt-4">
                {[
                  { title: 'IMS Pop-Up Event Highlights', file: 'video1.mp4' },
                  { title: 'Live Student Try-Ons & Reactions', file: 'video2.mp4' },
                  { title: 'Behind the Scenes & Sales Surge', file: 'video3.mp4' },
                ].map((vid) => (
                  <button
                    key={vid.file}
                    onClick={() => { setActiveVideo(vid.file); setIsVideoModalOpen(true); }}
                    className={`flex items-center justify-between p-3.5 rounded-xl border text-left transition duration-200 ${
                      activeVideo === vid.file 
                        ? 'bg-emerald-900/40 border-amber-400 text-white font-medium' 
                        : 'bg-slate-950/60 border-emerald-900/40 text-slate-400 hover:text-white'
                    }`}
                  >
                    <span className="flex items-center gap-3 text-xs font-mono uppercase tracking-wider">
                      <span className="w-6 h-6 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center font-bold text-[10px]">▶</span>
                      {vid.title}
                    </span>
                    <span className="text-[10px] font-mono text-amber-400">Watch Reel</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Embedded Live Video Player */}
            <div className="relative h-96 rounded-2xl overflow-hidden border border-emerald-800/50 bg-slate-950 shadow-2xl flex items-center justify-center group cursor-pointer" onClick={() => setIsVideoModalOpen(true)}>
              <video 
                key={activeVideo}
                controls
                autoPlay
                muted
                loop
                className="w-full h-full object-cover"
              >
                <source src={`/videos/${activeVideo}`} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>

          </div>
        </div>
      </section>

      {/* Fullscreen Video Modal */}
      {isVideoModalOpen && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="relative w-full max-w-4xl bg-slate-900 rounded-2xl overflow-hidden border border-emerald-800/50 shadow-2xl">
            <button 
              onClick={() => setIsVideoModalOpen(false)}
              className="absolute top-4 right-4 text-white text-xl z-10 bg-slate-950/80 w-10 h-10 rounded-full flex items-center justify-center hover:bg-amber-500 hover:text-slate-950 transition"
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

      {/* Secure Checkout Modal */}
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
                  <img src="/images/qr.png" alt="UPI QR Code" className="w-full h-full object-contain" />
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