'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface Product {
  id: number;
  name: string;
  price: number;
  originalPrice: number;
  image: string;
  category: string;
  badge?: string;
}

export default function ZuviStore() {
  const [activeTab, setActiveTab] = useState<'all' | 'necklaces' | 'rings' | 'bracelets'>('all');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  
  // Checkout Form State
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    pincode: '',
    city: '',
  });
  const [errors, setErrors] = useState<{ phone?: string; pincode?: string }>({});
  const [step, setStep] = useState<'form' | 'qr' | 'success'>('form');

  const products: Product[] = [
    {
      id: 1,
      name: 'Imperial Emerald Anti-Tarnish Ring',
      price: 350,
      originalPrice: 999,
      image: '/images/ring.png',
      category: 'rings',
      badge: 'Launch Special'
    },
    {
      id: 2,
      name: 'Classic Gold Cuban Chain',
      price: 1499,
      originalPrice: 2499,
      image: '/images/ring.png',
      category: 'necklaces',
      badge: 'Bestseller'
    },
    {
      id: 3,
      name: 'Minimalist Silver Band',
      price: 899,
      originalPrice: 1499,
      image: '/images/ring.png',
      category: 'rings',
      badge: 'New'
    },
    {
      id: 4,
      name: 'Sleek Serpent Bracelet',
      price: 1299,
      originalPrice: 2199,
      image: '/images/ring.png',
      category: 'bracelets',
      badge: 'Trending'
    }
  ];

  const filteredProducts = activeTab === 'all' 
    ? products 
    : products.filter(p => p.category === activeTab);

  const handleBuyNow = (product: Product) => {
    setSelectedProduct(product);
    setIsCheckoutOpen(true);
    setStep('form');
  };

  const validateAndProceed = (e: React.FormEvent) => {
    e.preventDefault();
    let newErrors: { phone?: string; pincode?: string } = {};

    if (!/^\d{10}$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid 10-digit mobile number.';
    }

    if (!/^\d{6}$/.test(formData.pincode)) {
      newErrors.pincode = 'Please enter a valid 6-digit postal pincode.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setStep('qr');
  };

  const handlePaymentConfirmed = async () => {
    const submissionData = {
      access_key: 'YOUR_WEB3FORMS_ACCESS_KEY',
      subject: `New ZUVI Order from ${formData.name}`,
      from_name: 'ZUVI Luxury Store',
      redirect: 'https://zuvis.in',
      message: `
        New Order Confirmed:
        - Product: ${selectedProduct?.name}
        - Price: ₹${selectedProduct?.price}
        - Customer: ${formData.name}
        - Phone: ${formData.phone}
        - Address: ${formData.address}, ${formData.city} - ${formData.pincode}
      `
    };

    try {
      await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submissionData),
      });
    } catch (err) {
      console.error('Submission error:', err);
    }

    setStep('success');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
      {/* Announcement Bar */}
      <div className="bg-emerald-900/90 text-emerald-200 text-xs py-2 px-4 text-center tracking-widest font-medium uppercase border-b border-emerald-800 backdrop-blur-md">
        ✨ ZUVI OFFSHORE POP-UP @ IMS CAMPUS • RAPID 80+ sold in 2 HOURS ✨
      </div>

      {/* Navigation Header */}
      <header className="border-b border-emerald-900/40 bg-emerald-950/40 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-serif tracking-widest text-amber-400 font-bold">ZUVI</h1>
            <span className="hidden sm:inline-block text-xs uppercase tracking-widest bg-emerald-900/50 text-emerald-300 px-3 py-1 rounded-full border border-emerald-700/50">
              Made to be Seen
            </span>
          </div>

          <div className="flex items-center gap-6">
            <nav className="hidden md:flex items-center gap-6 text-sm text-slate-300">
              <a href="#catalog" className="hover:text-amber-400 transition">Collection</a>
              <a href="#event" className="hover:text-amber-400 transition">IMS Event</a>
            </nav>
            <button 
              onClick={() => handleBuyNow(products[0])}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold px-5 py-2.5 rounded-xl transition duration-200 shadow-lg shadow-amber-500/20"
            >
              Order Ring — ₹350
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-24 px-6 overflow-hidden bg-gradient-to-b from-emerald-950/40 via-slate-950 to-slate-950">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <motion.span 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-amber-400 text-xs uppercase tracking-[0.3em] font-medium"
          >
            LUXURY ANTI-TARNISH JEWELRY
          </motion.span>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-7xl font-serif tracking-wide text-white leading-tight"
          >
            Uncompromising Radiance, <span className="text-amber-400 italic">Built for Everyday Life.</span>
          </motion.h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto font-light leading-relaxed">
            Designed in deep emerald and polished gold. ZUVI pieces are meticulously crafted to resist fading, water, and sweat without losing their brilliant luster.
          </p>
          <div className="flex flex-wrap justify-center gap-4 pt-4">
            <button 
              onClick={() => handleBuyNow(products[0])}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold px-8 py-3.5 rounded-xl transition shadow-lg shadow-amber-500/20"
            >
              Shop Online – ₹350
            </button>
            <a 
              href="#event"
              className="border border-emerald-800/80 hover:border-amber-400 text-emerald-200 hover:text-white px-6 py-3.5 rounded-xl transition backdrop-blur-sm text-sm font-medium"
            >
              IMS Event Highlights
            </a>
          </div>
        </div>
      </section>

      {/* Interactive Luxury Showcase Box */}
      <section className="max-w-5xl mx-auto px-6 py-12">
        <div className="relative h-[400px] md:h-[480px] rounded-3xl overflow-hidden border border-emerald-900/50 bg-gradient-to-tr from-emerald-950/80 via-slate-900 to-slate-950 shadow-2xl flex items-center justify-center p-8">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-amber-500/10 via-transparent to-transparent pointer-events-none" />
          <div className="text-center space-y-4 relative z-10 max-w-lg">
            <span className="bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs uppercase tracking-widest px-4 py-1.5 rounded-full">
              Flagship Masterpiece
            </span>
            <h3 className="text-3xl font-serif text-white">Imperial Emerald Anti-Tarnish Ring</h3>
            <p className="text-slate-400 text-sm">Vacuum-plated 18k gold with dual brilliant-cut emerald stones. Guaranteed against water and sweat fading.</p>
            <div className="pt-2">
              <button 
                onClick={() => handleBuyNow(products[0])}
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-8 py-3.5 rounded-xl transition shadow-lg shadow-amber-500/20"
              >
                Claim Launch Price — ₹350
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* IMS Campus Event & Social Proof Showcase */}
      <section id="event" className="max-w-7xl mx-auto px-6 py-16">
        <div className="bg-emerald-950/20 border border-emerald-900/50 rounded-3xl p-8 md:p-12 shadow-2xl relative overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <span className="bg-amber-500 text-slate-950 text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full">
                IMS CAMPUS POP-UP
              </span>
              <h3 className="text-3xl md:text-4xl font-serif text-white">ZUVI Offline Event @ IMS</h3>
              <p className="text-slate-300 text-sm leading-relaxed">
                Our official offline exhibition event at IMS campus brought out an incredible crowd! Students experienced the luxury anti-tarnish jewelry live, tried on pieces, and secured their favorites on the spot.
              </p>
              <ul className="space-y-3 text-sm text-slate-400">
                <li className="flex items-center gap-2">📍 <strong className="text-white">Venue:</strong> IMS Campus Exhibition Hall & Atrium</li>
                <li className="flex items-center gap-2">✨ <strong className="text-white">Event Highlight:</strong> Live try-ons, exclusive discounts, and instant UPI checkout</li>
                <li className="flex items-center gap-2">⚡ <strong className="text-white">Community Response:</strong> Overwhelming student turnout & instant sales</li>
              </ul>
            </div>

            <div className="bg-slate-900/80 border border-emerald-800/40 rounded-2xl p-6 text-center space-y-6 shadow-xl">
              <div className="w-12 h-12 bg-amber-500/20 border border-amber-500/40 rounded-full flex items-center justify-center mx-auto text-amber-400 text-xl font-serif">✨</div>
              <div>
                <span className="text-xs uppercase tracking-widest text-amber-400 font-medium">Claim Launch Pricing</span>
                <h4 className="text-2xl font-serif text-white mt-1">Imperial Emerald Ring</h4>
                <p className="text-3xl font-serif text-amber-400 mt-2">₹350 <span className="text-xs text-slate-500 line-through">₹999</span></p>
              </div>
              <button 
                onClick={() => handleBuyNow(products[0])}
                className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-3.5 rounded-xl transition shadow-lg shadow-amber-500/20"
              >
                SECURE RING — ₹350
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Product Catalog */}
      <main id="catalog" className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 border-b border-emerald-900/40 pb-6 gap-6">
          <div>
            <h3 className="text-3xl font-serif text-amber-400 mb-2">The Signature Masterpiece Collection</h3>
            <p className="text-slate-400 text-sm">Handcrafted luxury designed for daily wear without color fading.</p>
          </div>
          
          <div className="flex flex-wrap gap-2 bg-emerald-950/40 p-1.5 rounded-xl border border-emerald-900/40">
            {(['all', 'necklaces', 'rings', 'bracelets'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-lg text-xs uppercase tracking-wider font-medium transition duration-200 ${
                  activeTab === tab 
                    ? 'bg-amber-500 text-slate-950 shadow-md font-bold' 
                    : 'text-slate-400 hover:text-white hover:bg-emerald-900/30'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProducts.map((product) => (
            <div 
              key={product.id} 
              className="bg-emerald-950/10 border border-emerald-900/30 rounded-2xl p-6 flex flex-col justify-between hover:border-amber-500/50 transition duration-300 group shadow-xl"
            >
              <div className="space-y-4">
                <div className="relative h-64 bg-slate-900/80 rounded-xl overflow-hidden flex items-center justify-center border border-emerald-900/20">
                  {product.badge && (
                    <span className="absolute top-3 left-3 bg-amber-500 text-slate-950 text-[10px] uppercase font-bold tracking-widest px-2.5 py-1 rounded-md z-10 shadow-md">
                      {product.badge}
                    </span>
                  )}
                  <img src={product.image} alt={product.name} className="object-cover h-full w-full opacity-90 group-hover:scale-105 transition duration-500" />
                </div>
                <div>
                  <h4 className="text-xl font-medium text-white">{product.name}</h4>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-between pt-4 border-t border-emerald-900/20">
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-serif text-amber-400">₹{product.price}</span>
                  <span className="text-sm text-slate-500 line-through">₹{product.originalPrice}</span>
                </div>
                <button
                  onClick={() => handleBuyNow(product)}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium px-5 py-2.5 rounded-xl transition shadow-md shadow-emerald-900/30"
                >
                  Buy Now
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Checkout Modal */}
      {isCheckoutOpen && selectedProduct && (
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
                <p className="text-sm text-slate-400 mb-6">Ordering: <span className="text-white font-medium">{selectedProduct.name}</span> (<span className="text-amber-400">₹{selectedProduct.price}</span>)</p>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-slate-400 mb-1">Full Name</label>
                  <input 
                    type="text" 
                    required 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full bg-slate-950 border border-emerald-900/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-400"
                    placeholder="Anant Pratap Singh"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-slate-400 mb-1">Mobile Number (10 digits)</label>
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
                  <label className="block text-xs uppercase tracking-wider text-slate-400 mb-1">Delivery Address</label>
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
                    <label className="block text-xs uppercase tracking-wider text-slate-400 mb-1">City</label>
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
                    <label className="block text-xs uppercase tracking-wider text-slate-400 mb-1">Pincode (6 digits)</label>
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
                  className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-3.5 rounded-xl transition duration-200 mt-6 shadow-lg shadow-amber-500/20"
                >
                  Proceed to UPI Payment
                </button>
              </form>
            )}

            {step === 'qr' && (
              <div className="text-center space-y-6 py-2">
                <h3 className="text-2xl font-serif text-amber-400">Scan & Pay ₹{selectedProduct.price}</h3>
                <p className="text-sm text-slate-400">Scan using GPay, PhonePe, Paytm, or any UPI app</p>
                
                <div className="bg-white p-4 rounded-2xl w-56 h-56 mx-auto flex items-center justify-center border-4 border-amber-500/20 shadow-xl">
                  <img src="/images/qr.png" alt="UPI QR Code" className="w-full h-full object-contain" />
                </div>

                <button 
                  onClick={handlePaymentConfirmed}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3.5 rounded-xl transition duration-200 shadow-lg shadow-emerald-900/40"
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
                  Thank you for shopping with ZUVI. Your order details have been securely recorded.
                </p>
                <button 
                  onClick={() => setIsCheckoutOpen(false)}
                  className="bg-emerald-700 hover:bg-emerald-600 text-white font-medium px-8 py-3 rounded-xl transition"
                >
                  Close & Return
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-emerald-900/40 bg-emerald-950/20 py-16 mt-28">
        <div className="max-w-7xl mx-auto px-6 text-center text-slate-500 text-sm space-y-4">
          <p className="font-serif text-amber-400 tracking-widest text-lg font-bold">ZUVI ANTI-TARNISH JEWELRY</p>
          <p className="max-w-md mx-auto text-slate-400">Crafted with precision for enduring brilliance. Premium life-proof jewelry designed to never fade.</p>
          <p className="pt-4 border-t border-emerald-900/30">© 2026 ZUVI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}