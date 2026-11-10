'use client';

import React, { useState, useRef } from 'react';
import { motion, useScroll, useTransform, useSpring, useMotionValue } from 'framer-motion';

// --- 3D Interactive Ring Perspective Component ---
function Interactive3DRing({ activeRingImage }: { activeRingImage: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [20, -20]), { stiffness: 150, damping: 15 });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-25, 25]), { stiffness: 150, damping: 15 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
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
      className="relative w-full h-[450px] md:h-[520px] flex items-center justify-center cursor-grab active:cursor-grabbing perspective-1000 select-none"
    >
      <motion.div 
        style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
        className="relative w-72 h-72 md:w-96 md:h-96 flex items-center justify-center rounded-3xl bg-gradient-to-tr from-emerald-950/80 via-slate-900 to-emerald-950/40 border border-emerald-800/50 shadow-2xl overflow-hidden p-6"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-amber-500/10 via-transparent to-transparent pointer-events-none" />
        
        {/* Actual Product Photo from public/images/ */}
        <motion.img 
          key={activeRingImage}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          src={`/images/${activeRingImage}`} 
          alt="Imperial Emerald Ring" 
          style={{ transform: 'translateZ(40px)' }}
          className="max-h-full max-w-full object-contain relative z-20 drop-shadow-[0_20px_30px_rgba(0,0,0,0.8)]"
        />

        <div 
          style={{ transform: 'translateZ(50px)' }}
          className="absolute bottom-4 bg-slate-950/90 border border-amber-400/50 px-4 py-1.5 rounded-full backdrop-blur-md z-30 shadow-xl"
        >
          <span className="text-[10px] font-mono tracking-widest text-amber-300 uppercase">18K Vacuum Gold • Anti-Tarnish</span>
        </div>
      </motion.div>

      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[10px] font-mono tracking-widest text-slate-400 flex items-center gap-2 bg-slate-900/80 px-4 py-1.5 rounded-full border border-emerald-900/40 backdrop-blur-md">
        <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
        MOVE MOUSE TO ROTATE 3D PERSPECTIVE
      </div>
    </div>
  );
}

export default function ZuviStore() {
  const { scrollYProgress } = useScroll();
  const opacityHero = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const scaleHero = useTransform(scrollYProgress, [0, 0.2], [1, 0.95]);

  const [activeRingImage, setActiveRingImage] = useState('ring1.jpeg');
  const [activeVideo, setActiveVideo] = useState('video1.mp4');
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);

  const ringImages = ['ring1.jpeg', 'ring2.jpeg', 'ring3.jpeg', 'ring4.jpeg'];
  const campusVideos = [
    { title: 'IMS Pop-Up Highlights', file: 'video1.mp4' },
    { title: 'Live Student Try-Ons', file: 'video2.mp4' },
    { title: 'Customer Reactions', file: 'video3.mp4' },
  ];

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
      
      {/* Background Particle Grid */}
      <div className="fixed inset-0 pointer-events-none opacity-20 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:24px_24px]" />

      {/* Announcement Bar */}
      <div className="bg-emerald-950/90 text-emerald-300 text-[11px] py-2.5 px-4 text-center tracking-[0.2em] font-mono uppercase border-b border-emerald-800/60 backdrop-blur-md relative z-50">
        ✨ ZUVI OFFSHORE POP-UP @ IMS CAMPUS • 80+ SOLD IN 2 HOURS ✨
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
              <a href="#hero3d" className="hover:text-amber-400 transition">3D Showcase</a>
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
        className="relative min-h-[90vh] flex flex-col items-center justify-center px-6 pt-8 pb-20"
      >
        <div className="max-w-5xl mx-auto text-center space-y-6 relative z-10 w-full">
          <div className="inline-flex items-center gap-2 bg-emerald-900/30 border border-emerald-700/50 px-4 py-1.5 rounded-full text-amber-400 text-[11px] uppercase tracking-[0.3em] font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            Interactive 3D Ring Viewer
          </div>

          <h2 className="text-4xl md:text-7xl font-serif tracking-tight text-white leading-tight">
            Immortal Radiance, <br />
            <span className="bg-gradient-to-r from-amber-200 via-amber-400 to-amber-600 bg-clip-text text-transparent italic">
              Built for Real Life.
            </span>
          </h2>

          {/* Interactive 3D Ring Display using actual ring1-4.jpeg */}
          <Interactive3DRing activeRingImage={activeRingImage} />

          {/* Thumbnail Image Switcher */}
          <div className="flex justify-center gap-3 pt-2">
            {ringImages.map((img) => (
              <button
                key={img}
                onClick={() => setActiveRingImage(img)}
                className={`w-14 h-14 rounded-xl overflow-hidden border-2 transition duration-200 ${
                  activeRingImage === img ? 'border-amber-400 scale-105 shadow-lg shadow-amber-500/20' : 'border-emerald-900/60 opacity-60 hover:opacity-100'
                }`}
              >
                <img src={`/images/${img}`} alt="Ring Thumbnail" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>

          <div className="flex flex-wrap justify-center gap-4 pt-6">
            <button 
              onClick={handleBuyNow}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-10 py-4 rounded-xl transition shadow-[0_0_30px_rgba(245,158,11,0.4)] text-sm uppercase tracking-wider font-mono"
            >
              Claim Launch Price — ₹350
            </button>
          </div>
        </div>
      </motion.section>

      {/* IMS Campus Pop-Up Video Section using actual video1-3.mp4 */}
      <section id="event" className="max-w-6xl mx-auto px-6 py-20">
        <div className="bg-slate-900/80 border border-emerald-800/40 rounded-3xl p-8 md:p-12 shadow-2xl relative overflow-hidden backdrop-blur-xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            <div className="space-y-6">
              <span className="bg-amber-500 text-slate-950 text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full font-mono">
                IMS CAMPUS POP-UP EXHIBITION
              </span>
              <h3 className="text-3xl md:text-4xl font-serif text-white">Live Event Reels</h3>
              <p className="text-slate-300 text-sm leading-relaxed font-light">
                Our offline pop-up at IMS campus was an absolute storm! Over 80+ rings sold in just 2 hours with live student try-ons and instant UPI settlements.
              </p>
              
              {/* Video Selector Tabs */}
              <div className="flex flex-col gap-2 pt-2">
                {campusVideos.map((vid) => (
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
            <div className="relative h-80 rounded-2xl overflow-hidden border border-emerald-800/50 bg-slate-950 shadow-2xl flex items-center justify-center">
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