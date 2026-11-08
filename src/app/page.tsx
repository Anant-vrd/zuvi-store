'use client';

import React, { useState } from 'react';

export default function ZuviHomepage() {
  const [cart, setCart] = useState<{ id: number; name: string; price: number; image: string }[]>([]);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<{ id: number; name: string; price: number; image: string } | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    pincode: '',
    city: '',
  });
  const [errors, setErrors] = useState<{ phone?: string; pincode?: string }>({});
  const [step, setStep] = useState<'form' | 'qr' | 'success'>('form');

  const products = [
    {
      id: 1,
      name: 'Classic Gold Cuban Chain',
      price: 1499,
      image: '/images/ring.png', // Fallback or local asset path
      description: 'Premium anti-tarnish 18k gold plated chain designed for everyday elegance.'
    },
    {
      id: 2,
      name: 'Minimalist Silver Ring',
      price: 899,
      image: '/images/ring.png',
      description: 'Sleek waterproof and sweat-resistant silver band with mirror finish.'
    }
  ];

  const handleAddToCart = (product: typeof products[0]) => {
    setCart([...cart, product]);
    setSelectedProduct(product);
    setIsCheckoutOpen(true);
    setStep('form');
  };

  const validateAndProceed = (e: React.FormEvent) => {
    e.preventDefault();
    let newErrors: { phone?: string; pincode?: string } = {};

    // Validate phone (exact 10 digits)
    if (!/^\d{10}$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid 10-digit mobile number.';
    }

    // Validate pincode (exact 6 digits for India)
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
    // Web3Forms submission
    const submissionData = {
      access_key: 'YOUR_WEB3FORMS_ACCESS_KEY', // Replace with your active Web3Forms key if needed
      subject: `New ZUVI Order from ${formData.name}`,
      from_name: 'ZUVI Storefront',
      redirect: 'https://zuvis.in',
      message: `
        New Order Details:
        - Product: ${selectedProduct?.name}
        - Price: ₹${selectedProduct?.price}
        - Customer Name: ${formData.name}
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
      console.error('Submission error', err);
    }

    setStep('success');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
      {/* Navigation Header */}
      <header className="border-b border-emerald-900/40 bg-emerald-950/20 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-serif tracking-widest text-amber-400 font-bold">ZUVI</h1>
            <span className="text-xs uppercase tracking-widest bg-emerald-900/50 text-emerald-300 px-2.5 py-1 rounded-full border border-emerald-700/50">
              Anti-Tarnish Luxury
            </span>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => {
                if (products[0]) handleAddToCart(products[0]);
              }}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold px-5 py-2.5 rounded-xl transition duration-200 shadow-lg shadow-amber-500/20"
            >
              Shop Collection
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-24 px-6 overflow-hidden bg-gradient-to-b from-emerald-950/40 to-slate-950">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h2 className="text-4xl md:text-6xl font-serif tracking-wide text-white">
            Elevate Your <span className="text-amber-400 italic">Everyday</span>
          </h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto font-light">
            Discover our curated collection of premium, life-proof jewelry designed never to fade. Waterproof, sweat-proof, and crafted for modern elegance.
          </p>
        </div>
      </section>

      {/* Product Catalog */}
      <main className="max-w-7xl mx-auto px-6 py-16">
        <h3 className="text-2xl font-serif mb-10 text-amber-400/90 border-b border-emerald-900/40 pb-4">Featured Masterpieces</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {products.map((product) => (
            <div key={product.id} className="bg-emerald-950/10 border border-emerald-900/30 rounded-2xl p-6 flex flex-col justify-between hover:border-amber-500/40 transition duration-300">
              <div className="space-y-4">
                <div className="h-64 bg-slate-900/80 rounded-xl overflow-hidden flex items-center justify-center border border-emerald-900/20">
                  <img src={product.image} alt={product.name} className="object-cover h-full w-full opacity-90 hover:scale-105 transition duration-500" />
                </div>
                <h4 className="text-xl font-medium text-white">{product.name}</h4>
                <p className="text-slate-400 text-sm">{product.description}</p>
              </div>
              <div className="mt-6 flex items-center justify-between pt-4 border-t border-emerald-900/20">
                <span className="text-2xl font-serif text-amber-400">₹{product.price}</span>
                <button
                  onClick={() => handleAddToCart(product)}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium px-6 py-2.5 rounded-xl transition shadow-md shadow-emerald-900/30"
                >
                  Buy Now
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Gallery / Showcase Section */}
        <div className="mt-24 space-y-8">
          <h3 className="text-2xl font-serif text-amber-400/90 border-b border-emerald-900/40 pb-4">The ZUVI Experience</h3>
          <div className="rounded-2xl overflow-hidden border border-emerald-900/40 shadow-2xl bg-emerald-950/20 p-2">
            <img src="/images/ring.png" alt="Zuvi Luxury Showcase" className="w-full h-[400px] object-cover rounded-xl" />
          </div>
        </div>
      </main>

      {/* Checkout Modal */}
      {isCheckoutOpen && selectedProduct && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-emerald-800/40 w-full max-w-lg rounded-2xl p-6 md:p-8 shadow-2xl relative">
            <button 
              onClick={() => setIsCheckoutOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white text-xl"
            >
              ✕
            </button>

            {step === 'form' && (
              <form onSubmit={validateAndProceed} className="space-y-4">
                <h3 className="text-2xl font-serif text-amber-400 mb-2">Secure Checkout</h3>
                <p className="text-sm text-slate-400 mb-6">Ordering: <span className="text-white font-medium">{selectedProduct.name}</span> (₹{selectedProduct.price})</p>

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
                  Proceed to Payment
                </button>
              </form>
            )}

            {step === 'qr' && (
              <div className="text-center space-y-6 py-4">
                <h3 className="text-2xl font-serif text-amber-400">Scan & Pay ₹{selectedProduct.price}</h3>
                <p className="text-sm text-slate-400">Scan the UPI QR code below using any UPI app (GPay, PhonePe, Paytm)</p>
                
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
              <div className="text-center space-y-6 py-8">
                <div className="w-16 h-16 bg-emerald-500/20 border border-emerald-500 text-emerald-400 rounded-full flex items-center justify-center mx-auto text-2xl">
                  ✓
                </div>
                <h3 className="text-3xl font-serif text-white">Order Confirmed!</h3>
                <p className="text-slate-400 text-sm max-w-sm mx-auto">
                  Thank you for shopping with ZUVI. An instant notification has been dispatched to our team. We will contact you shortly regarding delivery.
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
      <footer className="border-t border-emerald-900/40 bg-emerald-950/20 py-12 mt-24">
        <div className="max-w-7xl mx-auto px-6 text-center text-slate-500 text-sm space-y-3">
          <p className="font-serif text-amber-400/80 tracking-widest text-base">ZUVI ANTI-TARNISH JEWELRY</p>
          <p>© 2026 ZUVI. All rights reserved. Crafted with precision for premium durability.</p>
        </div>
      </footer>
    </div>
  );
}