"use client";

import React, { useState } from 'react';

// ZUVI Products - Premium Anti-Tarnish Jewelry
const products = [
  { id: 1, title: 'Classic Gold Cuban Chain', price: 1499, image: 'https://images.unsplash.com/photo-1599643478524-fb66f7f6f1c4?auto=format&fit=crop&q=80&w=500' },
  { id: 2, title: 'Minimalist Silver Ring', price: 899, image: 'https://images.unsplash.com/photo-1605100804763-247f67b2548e?auto=format&fit=crop&q=80&w=500' },
  { id: 3, title: 'Rose Gold Pearl Bracelet', price: 1299, image: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&q=80&w=500' },
  { id: 4, title: 'Emerald Pendant Necklace', price: 1799, image: 'https://images.unsplash.com/photo-1599643477877-530eb83abc8e?auto=format&fit=crop&q=80&w=500' },
];

export default function ZuviStore() {
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isUpiModalOpen, setIsUpiModalOpen] = useState(false);

  // Checkout Form States
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [pincode, setPincode] = useState('');
  const [address, setAddress] = useState('');
  const [phoneError, setPhoneError] = useState('');

  const openCheckout = (product: any) => {
    setSelectedProduct(product);
    setIsCheckoutOpen(true);
  };

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simple validation
    if (phone.length !== 10) {
      setPhoneError('Please enter a valid 10-digit mobile number.');
      return;
    }
    if (!name || !pincode || !address) return;
    setPhoneError('');

    // Web3Forms Order Notification (Sends email to anantpratapsingh7164@gmail.com)
    try {
      await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          access_key: 'f2860cc8-d7f5-456d-981b-9adfc22c5fd7',
          subject: `🚨 New ZUVI Order: ${selectedProduct.title} (₹${selectedProduct.price})`,
          from_name: 'ZUVI Storefront',
          message: `New Order Received!\n\nProduct: ${selectedProduct.title}\nPrice: ₹${selectedProduct.price}\nCustomer: ${name}\nPhone: ${phone}\nPincode: ${pincode}\nAddress: ${address}`
        }),
      });
    } catch (err) {
      console.error('Notification error:', err);
    }

    // Close checkout and open the payment scanner
    setIsCheckoutOpen(false);
    setIsUpiModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
      {/* Navbar */}
      <header className="bg-white shadow-sm py-6">
        <div className="max-w-6xl mx-auto px-4 flex justify-between items-center">
          <h1 className="text-3xl font-bold tracking-widest text-gray-900">ZUVI</h1>
          <p className="text-sm text-gray-500 uppercase tracking-widest hidden sm:block">
            Premium Anti-Tarnish Jewelry
          </p>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-6xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-extrabold mb-4">Elevate Your Everyday</h2>
          <p className="text-gray-600">
            Discover our collection of premium, life-proof jewelry designed to never fade.
          </p>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {products.map((product) => (
            <div key={product.id} className="bg-white rounded-lg shadow hover:shadow-xl transition-shadow overflow-hidden">
              <img src={product.image} alt={product.title} className="w-full h-64 object-cover" />
              <div className="p-6 text-center">
                <h3 className="font-semibold text-lg mb-2">{product.title}</h3>
                <p className="text-gray-600 mb-4 font-medium">₹{product.price}</p>
                <button 
                  onClick={() => openCheckout(product)}
                  className="w-full bg-black text-white py-2.5 rounded font-bold hover:bg-gray-800 transition-colors tracking-wide"
                >
                  Buy Now
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Checkout Form Modal */}
      {isCheckoutOpen && selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 relative animate-fade-in-up">
            <button 
              onClick={() => setIsCheckoutOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-900 text-2xl leading-none"
            >
              &times;
            </button>
            
            <h2 className="text-2xl font-bold mb-1">Checkout</h2>
            <p className="text-gray-600 mb-6 text-sm">
              Ordering: <span className="font-semibold text-black">{selectedProduct.title}</span> (₹{selectedProduct.price})
            </p>

            <form onSubmit={handleCheckoutSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input 
                  type="text" required 
                  value={name} onChange={(e) => setName(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-black focus:border-black outline-none transition-all" 
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <input 
                  type="number" required 
                  value={phone} onChange={(e) => setPhone(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-black focus:border-black outline-none transition-all" 
                  placeholder="10-digit mobile number"
                />
                {phoneError && <p className="text-red-500 text-xs mt-1 font-medium">{phoneError}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Pincode</label>
                <input 
                  type="number" required 
                  value={pincode} onChange={(e) => setPincode(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-black focus:border-black outline-none transition-all" 
                  placeholder="110001"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Address</label>
                <textarea 
                  required rows={3}
                  value={address} onChange={(e) => setAddress(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-black focus:border-black outline-none transition-all resize-none" 
                  placeholder="House number, street, city..."
                />
              </div>

              <button 
                type="submit" 
                className="w-full bg-black text-white py-3.5 rounded-lg font-bold hover:bg-gray-800 transition-colors mt-4 tracking-wide shadow-lg"
              >
                Proceed to Pay ₹{selectedProduct.price}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* UPI QR Code Payment Modal */}
      {isUpiModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-8 text-center relative animate-fade-in-up">
            <button 
              onClick={() => {
                setIsUpiModalOpen(false);
                // Clear form for next order
                setName(''); setPhone(''); setPincode(''); setAddress('');
              }}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-900 text-2xl leading-none"
            >
              &times;
            </button>
            <h2 className="text-2xl font-bold mb-2">Pay with UPI</h2>
            <p className="text-gray-600 mb-6 text-sm">Scan the QR code below using GPay, PhonePe, or Paytm.</p>
            
            {/* Dynamic QR Code Generation */}
            <div className="bg-white p-4 rounded-xl inline-block mb-6 border-2 border-dashed border-gray-300 shadow-sm">
               <img 
                 src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=upi://pay?pa=zuvi@upi&pn=ZUVI%20Store&am=${selectedProduct?.price}&cu=INR`} 
                 alt="UPI QR Code" 
                 className="w-48 h-48 mx-auto" 
               />
            </div>

            <p className="text-sm text-gray-500 font-medium bg-gray-100 py-2 rounded-lg inline-block px-4">UPI ID: zuvi@upi</p>
            <div className="mt-6 pt-6 border-t border-gray-100">
               <p className="text-xs text-gray-400 font-medium">Order details have been securely recorded.<br/> We will dispatch your item once payment clears.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}