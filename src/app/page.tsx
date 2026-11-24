'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  motion,
  useScroll,
  useTransform,
  useMotionValue,
  useSpring,
  useMotionTemplate,
  AnimatePresence,
} from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import { onAuthStateChanged, signInWithPopup, signOut, User } from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  addDoc,
  collection,
  query,
  where,
  getDocs,
  serverTimestamp,
} from 'firebase/firestore';
import { auth, googleProvider, db } from '@/lib/firebase';

interface WaterRipple {
  id: number;
  x: number;
  y: number;
}

interface ProductAngle {
  file: string;
  label: string;
}

type CategoryName = 'RINGS' | 'EARINGS' | 'JUMKA' | 'BRACELTS' | 'PENDANTS';

interface StoreProduct {
  id: string;
  category: CategoryName;
  name: string;
  price: number;
  originalPrice: number;
  badge: string;
  tagline: string;
  cardImage: string;
  angles: ProductAngle[];
}

interface OrderRecord {
  id: string;
  productName: string;
  price: number;
  utrNumber: string;
  status: string;
  city: string;
  pincode: string;
  createdAt?: { seconds?: number };
}

const UPI_ID = 'anantpratap.h7164@ptyes';
const MERCHANT_NAME = 'ZUVI Jewelry';

export default function ZuviStore() {
  const { scrollYProgress } = useScroll();
  const silkShift = useTransform(scrollYProgress, [0, 1], ['0%', '16%']);

  // Smooth Liquid Silk-Sea Cursor Sheen & Water Ripples
  const cursorX = useMotionValue(-500);
  const cursorY = useMotionValue(-500);
  const smoothX = useSpring(cursorX, { stiffness: 130, damping: 26, mass: 0.4 });
  const smoothY = useSpring(cursorY, { stiffness: 130, damping: 26, mass: 0.4 });

  const [ripples, setRipples] = useState<WaterRipple[]>([]);
  const lastRippleTime = useRef<number>(0);

  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);

      const now = Date.now();
      if (now - lastRippleTime.current > 240) {
        lastRippleTime.current = now;
        const id = now + Math.random();
        setRipples((prev) => [...prev.slice(-5), { id, x: e.clientX, y: e.clientY }]);
      }
    };

    window.addEventListener('mousemove', handleGlobalMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleGlobalMouseMove);
  }, [cursorX, cursorY]);

  const seaGlowBg = useMotionTemplate`radial-gradient(420px circle at ${smoothX}px ${smoothY}px, rgba(167, 243, 208, 0.24), rgba(52, 211, 153, 0.09) 45%, transparent 75%)`;

  // Auth & User Profile / Orders State
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [isOrdersOpen, setIsOrdersOpen] = useState(false);
  const [userOrders, setUserOrders] = useState<OrderRecord[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    pincode: '',
    city: '',
  });

  const fetchUserOrders = async (uid: string) => {
    setLoadingOrders(true);
    try {
      const q = query(collection(db, 'orders'), where('userId', '==', uid));
      const snap = await getDocs(q);
      const list: OrderRecord[] = snap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<OrderRecord, 'id'>),
      }));
      list.sort((a, b) => (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0));
      setUserOrders(list);
    } catch (err) {
      console.error('Failed to load orders:', err);
    } finally {
      setLoadingOrders(false);
    }
  };

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);

      if (currentUser) {
        try {
          const profileRef = doc(db, 'users', currentUser.uid);
          const profileSnap = await getDoc(profileRef);
          if (profileSnap.exists()) {
            const saved = profileSnap.data();
            setFormData((prev) => ({
              name: saved.name || currentUser.displayName || prev.name,
              phone: saved.phone || prev.phone,
              address: saved.address || prev.address,
              city: saved.city || prev.city,
              pincode: saved.pincode || prev.pincode,
            }));
          } else if (currentUser.displayName) {
            setFormData((prev) => ({ ...prev, name: currentUser.displayName || prev.name }));
          }
          await fetchUserOrders(currentUser.uid);
        } catch (err) {
          console.error('Profile load error:', err);
        }
      } else {
        setUserOrders([]);
      }
    });

    return () => unsub();
  }, []);

  const handleGoogleSignIn = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      console.error('Google sign-in failed:', err);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setIsOrdersOpen(false);
    } catch (err) {
      console.error('Sign out failed:', err);
    }
  };

  // Categories
  const categories: CategoryName[] = ['RINGS', 'EARINGS', 'JUMKA', 'BRACELTS', 'PENDANTS'];
  const [selectedCategory, setSelectedCategory] = useState<CategoryName>('RINGS');

  // Full Store Catalog matched to public/images/
  const catalogItems: StoreProduct[] = [
    {
      id: 'imperial-emerald',
      category: 'RINGS',
      name: 'Imperial Emerald Ring',
      price: 350,
      originalPrice: 999,
      badge: '360° PREVIEW',
      tagline:
        'Pear and baguette emerald stones in 18k PVD gold over stainless steel. Built for everyday wear.',
      cardImage: '360 Gold Emerald Ring Rotation.gif',
      angles: [
        { file: '360 Gold Emerald Ring Rotation.gif', label: '360° Rotation' },
        { file: 'Emerald-Set Gold Ring on Velvet.png', label: 'Front Stones' },
        { file: 'Emerald and Gold Ring on Velvet.png', label: 'Side Profile' },
        { file: 'Emerald Gold Ring on Velvet.png', label: 'Band & Prongs' },
      ],
    },
    {
      id: 'baguette-cluster',
      category: 'RINGS',
      name: 'Baguette Cluster Gold Ring',
      price: 350,
      originalPrice: 999,
      badge: '360° + MULTI-ANGLE',
      tagline:
        'Stepped twin baguette stone clusters framed with pave accents in durable 18k PVD gold.',
      cardImage: 'Rotating Gold Diamond Ring Grid.gif',
      angles: [
        { file: 'Rotating Gold Diamond Ring Grid.gif', label: '360° Rotation' },
        { file: 'Stepped Gold Baguette Ring on Green Velvet.png', label: 'Stepped Velvet' },
        { file: 'Baguette Cluster Gold Ring.png', label: 'Studio Angle' },
        { file: 'Gold Ring on Emerald Velvet.png', label: 'Prong Profile' },
      ],
    },
    {
      id: 'golden-double-wrap',
      category: 'RINGS',
      name: 'Golden Double-Wrap Ring',
      price: 350,
      originalPrice: 999,
      badge: '360° + VELVET',
      tagline:
        'Multi-row pavé spiral wrap accented with marquise and baguette stones in 18k PVD gold.',
      cardImage: 'Golden Double-Wrap Ring on Green Velvet-1.png',
      angles: [
        { file: 'Golden Double-Wrap Ring on Green Velvet-1.png', label: 'Velvet Studio' },
        { file: 'Rotating Diamond Ring on Velvet.gif', label: '360° Rotation' },
      ],
    },
    {
      id: 'pave-crossover-cuff',
      category: 'RINGS',
      name: 'Pavé Crossover Cuff Ring',
      price: 350,
      originalPrice: 999,
      badge: 'MULTI-ANGLE',
      tagline:
        'Intertwined multi-band open cuff lined with pavé stones in 18k PVD gold over stainless steel.',
      cardImage: 'Gold Pav Crossover Ring on Green Velvet.png',
      angles: [
        { file: 'Gold Pav Crossover Ring on Green Velvet.png', label: 'Velvet View' },
        { file: 'Golden Diamond Cuff on Emerald Velvet.png', label: 'Cuff Angle' },
        { file: 'Intertwined Gold Diamond Ring on Emerald Velvet.png', label: 'Open Weave' },
      ],
    },
    {
      id: 'woven-gold-open',
      category: 'RINGS',
      name: 'Woven Gold Open Ring',
      price: 350,
      originalPrice: 999,
      badge: '360° + ON HAND',
      tagline:
        'Multi-band crossover gold finish with an open adjustable fit and smooth 18k PVD shine.',
      cardImage: 'Animated Gold Open Ring Rotation Grid.gif',
      angles: [
        { file: 'Animated Gold Open Ring Rotation Grid.gif', label: '360° Rotation' },
        { file: 'Gold Multi-Band Ring on Emerald Velvet.png', label: '3-Angle Sheet' },
        { file: 'Gold Crossover Ring on Green Satin.png', label: 'Worn Look' },
      ],
    },
    {
      id: 'butterfly-solitaire',
      category: 'RINGS',
      name: 'Butterfly Pavé Gold Ring',
      price: 350,
      originalPrice: 999,
      badge: '360° + MULTI-ANGLE',
      tagline:
        'Pavé-set butterfly motif paired with a teardrop stone in warm 18k PVD gold over steel.',
      cardImage: 'Rotating Gold Butterfly Ring on Velvet.gif',
      angles: [
        { file: 'Rotating Gold Butterfly Ring on Velvet.gif', label: '360° Rotation' },
        { file: 'Butterfly Gold Ring on Emerald Velvet.png', label: 'Front View' },
        { file: 'Pear Gemstone Butterfly Ring on Velvet.png', label: 'Pear Stone Angle' },
        { file: 'Golden Butterfly Teardrop Ring on Velvet.png', label: 'Side & Teardrop' },
      ],
    },
    {
      id: 'crown-leaf-solitaire',
      category: 'RINGS',
      name: 'Crown Leaf Solitaire Ring',
      price: 350,
      originalPrice: 999,
      badge: '360° + 4-VIEW',
      tagline:
        'Raised center stone above sculpted leaf and pavé rows with detailed gallery metalwork.',
      cardImage: 'Rotating Gold Ring on Emerald Velvet (2).gif',
      angles: [
        { file: 'Rotating Gold Ring on Emerald Velvet (2).gif', label: '360° Rotation' },
        { file: 'Four-View Gold Leaf Ring on Velvet.png', label: '4-View Sheet' },
      ],
    },
    {
      id: 'fan-cluster',
      category: 'RINGS',
      name: 'Fan Cluster Gold Ring',
      price: 350,
      originalPrice: 999,
      badge: '360° + MULTI-ANGLE',
      tagline:
        'Dual fan-cut crystal clusters along a pavé-lined 18k PVD gold band.',
      cardImage: 'Gold Fan-Cluster Ring Rotation (1).gif',
      angles: [
        { file: 'Gold Fan-Cluster Ring Rotation (1).gif', label: '360° Rotation' },
        { file: 'Golden Sunburst Ring on Forest Velvet.png', label: 'Forest Velvet' },
        { file: 'Ornate Gold Ring on Emerald Velvet.png', label: 'Side Profile' },
      ],
    },
    {
      id: 'emerald-twin-band',
      category: 'RINGS',
      name: 'Emerald Twin-Stone Band',
      price: 350,
      originalPrice: 999,
      badge: 'MULTI-ANGLE',
      tagline:
        'Clean gold band set with emerald-toned stones for effortless everyday styling.',
      cardImage: 'Gold Ring on Forest Green Velvet-3.png',
      angles: [
        { file: 'Gold Ring on Forest Green Velvet-3.png', label: 'Forest Velvet' },
        { file: 'ring1.jpeg', label: 'Angle 1' },
        { file: 'ring2.jpeg', label: 'Angle 2' },
        { file: 'ring3.jpeg', label: 'Angle 3' },
        { file: 'ring4.jpeg', label: 'Angle 4' },
      ],
    },
    {
      id: 'emerald-drop-earrings',
      category: 'EARINGS',
      name: 'Emerald PVD Gold Drop Earrings',
      price: 350,
      originalPrice: 999,
      badge: '18K PVD GOLD',
      tagline:
        'Lightweight anti-tarnish drop earrings in 18k PVD gold over stainless steel for daily wear.',
      cardImage: 'Emerald-Set Gold Ring on Velvet.png',
      angles: [{ file: 'Emerald-Set Gold Ring on Velvet.png', label: 'Studio Angle' }],
    },
    {
      id: 'baguette-stud-earrings',
      category: 'EARINGS',
      name: 'Baguette Cluster Gold Studs',
      price: 350,
      originalPrice: 999,
      badge: 'ANTI-TARNISH',
      tagline:
        'Crisp baguette-cut stone studs finished in durable vacuum-plated 18k gold.',
      cardImage: 'Baguette Cluster Gold Ring.png',
      angles: [{ file: 'Baguette Cluster Gold Ring.png', label: 'Studio Angle' }],
    },
    {
      id: 'imperial-emerald-jumka',
      category: 'JUMKA',
      name: 'Imperial Emerald Gold Jumka',
      price: 399,
      originalPrice: 1199,
      badge: 'CAMPUS EDITION',
      tagline:
        'Modern anti-tarnish jumka silhouette crafted in 18k PVD gold over stainless steel.',
      cardImage: 'Emerald and Gold Ring on Velvet.png',
      angles: [{ file: 'Emerald and Gold Ring on Velvet.png', label: 'Studio Angle' }],
    },
    {
      id: 'sunburst-gold-jumka',
      category: 'JUMKA',
      name: 'Sunburst Motif Gold Jumka',
      price: 399,
      originalPrice: 1199,
      badge: '18K PVD GOLD',
      tagline:
        'Detailed gold-tone jumka built to keep its shine without tarnishing or turning skin green.',
      cardImage: 'Golden Sunburst Ring on Forest Velvet.png',
      angles: [{ file: 'Golden Sunburst Ring on Forest Velvet.png', label: 'Studio Angle' }],
    },
    {
      id: 'crossover-pave-bracelet',
      category: 'BRACELTS',
      name: 'Crossover Pavé Gold Bracelet',
      price: 449,
      originalPrice: 1299,
      badge: '18K PVD GOLD',
      tagline:
        'Sleek anti-tarnish bracelet with pavé shimmer over a water-resistant steel core.',
      cardImage: 'Gold Pav Crossover Ring on Green Velvet.png',
      angles: [{ file: 'Gold Pav Crossover Ring on Green Velvet.png', label: 'Studio Angle' }],
    },
    {
      id: 'woven-gold-bracelet',
      category: 'BRACELTS',
      name: 'Woven Multi-Band Gold Bracelet',
      price: 449,
      originalPrice: 1299,
      badge: 'ANTI-TARNISH',
      tagline:
        'Layered gold-tone weave designed for effortless everyday stack or solo wear.',
      cardImage: 'Gold Multi-Band Ring on Emerald Velvet.png',
      angles: [{ file: 'Gold Multi-Band Ring on Emerald Velvet.png', label: 'Studio Angle' }],
    },
    {
      id: 'teardrop-pave-pendant',
      category: 'PENDANTS',
      name: 'Teardrop Pavé Gold Pendant',
      price: 350,
      originalPrice: 999,
      badge: '18K PVD GOLD',
      tagline:
        'Everyday anti-tarnish pendant finished in rich 18k PVD gold over stainless steel.',
      cardImage: 'Pear Gemstone Butterfly Ring on Velvet.png',
      angles: [{ file: 'Pear Gemstone Butterfly Ring on Velvet.png', label: 'Studio Angle' }],
    },
    {
      id: 'crown-leaf-pendant',
      category: 'PENDANTS',
      name: 'Crown Leaf Gold Pendant',
      price: 350,
      originalPrice: 999,
      badge: 'ANTI-TARNISH',
      tagline:
        'Sculpted leaf and crystal pendant built to hold its finish through daily campus wear.',
      cardImage: 'Four-View Gold Leaf Ring on Velvet.png',
      angles: [{ file: 'Four-View Gold Leaf Ring on Velvet.png', label: 'Studio Angle' }],
    },
  ];

  const ringCatalog = catalogItems.filter((item) => item.category === 'RINGS');
  const visibleCategoryItems = catalogItems.filter((item) => item.category === selectedCategory);

  // Featured Hero Ring + Interactive Tilt & Multi-Angle Gallery State
  const featuredRing = ringCatalog[0];
  const [heroRingId, setHeroRingId] = useState<string>(featuredRing.id);
  const activeHeroRing = ringCatalog.find((r) => r.id === heroRingId) ?? featuredRing;

  const [tiltDeg, setTiltDeg] = useState(0);
  const [gentleFloat, setGentleFloat] = useState(true);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [activeGalleryItem, setActiveGalleryItem] = useState<StoreProduct>(featuredRing);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const dragStartX = useRef<number | null>(null);
  const startTilt = useRef<number>(0);

  // IMS Event Video Reels
  const [activeVideo, setActiveVideo] = useState('video1.mp4');
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);

  // Checkout + 2-Minute Dynamic QR + UTR State
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState({
    name: activeHeroRing.name,
    price: activeHeroRing.price,
    originalPrice: activeHeroRing.originalPrice,
  });
  const [errors, setErrors] = useState<{ phone?: string; pincode?: string }>({});
  const [step, setStep] = useState<'form' | 'qr' | 'success'>('form');
  const [secondsLeft, setSecondsLeft] = useState(120);
  const [utrNumber, setUtrNumber] = useState('');
  const [utrError, setUtrError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    if (!isCheckoutOpen || step !== 'qr' || secondsLeft <= 0) return;
    const timer = setInterval(() => {
      setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [isCheckoutOpen, step, secondsLeft]);

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60)
      .toString()
      .padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const upiPaymentUri = `upi://pay?pa=${encodeURIComponent(UPI_ID)}&pn=${encodeURIComponent(
    MERCHANT_NAME
  )}&am=${selectedItem.price.toFixed(2)}&cu=INR&tn=${encodeURIComponent(
    `ZUVI - ${selectedItem.name}`
  )}`;

  const getImageUrl = (fileName: string) => encodeURI(`/images/${fileName}`);

  const openItemGallery = (item: StoreProduct, index = 0) => {
    setActiveGalleryItem(item);
    setGalleryIndex(index);
    setIsGalleryOpen(true);
  };

  const handleBuyNow = (
    item = {
      name: activeHeroRing.name,
      price: activeHeroRing.price,
      originalPrice: activeHeroRing.originalPrice,
    }
  ) => {
    setSelectedItem(item);
    setErrors({});
    setSecondsLeft(120);
    setUtrNumber('');
    setUtrError('');
    setStep('form');
    setIsCheckoutOpen(true);
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    setGentleFloat(false);
    dragStartX.current = e.clientX;
    startTilt.current = tiltDeg;
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (dragStartX.current === null) return;
    const deltaX = e.clientX - dragStartX.current;
    const clamped = Math.max(-28, Math.min(28, startTilt.current + deltaX * 0.25));
    setTiltDeg(clamped);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (dragStartX.current === null) return;
    const movedDistance = Math.abs(e.clientX - dragStartX.current);
    dragStartX.current = null;
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
    if (movedDistance < 6) {
      openItemGallery(activeHeroRing, 0);
    }
  };

  const validateAndProceed = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { phone?: string; pincode?: string } = {};
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

    if (user) {
      try {
        await setDoc(
          doc(db, 'users', user.uid),
          {
            name: formData.name,
            phone: formData.phone,
            address: formData.address,
            city: formData.city,
            pincode: formData.pincode,
            email: user.email,
            updatedAt: serverTimestamp(),
          },
          { merge: true }
        );
      } catch (err) {
        console.error('Error saving address:', err);
      }
    }

    setSecondsLeft(120);
    setUtrNumber('');
    setUtrError('');
    setStep('qr');
  };

  const handlePaymentConfirmed = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\d{12}$/.test(utrNumber.trim())) {
      setUtrError('Enter a valid 12-digit UPI Transaction ID / UTR from your payment app.');
      return;
    }
    setUtrError('');
    setIsVerifying(true);

    try {
      if (user) {
        await addDoc(collection(db, 'orders'), {
          userId: user.uid,
          customerEmail: user.email,
          customerName: formData.name,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          pincode: formData.pincode,
          productName: selectedItem.name,
          price: selectedItem.price,
          utrNumber: utrNumber.trim(),
          status: 'Payment Verifying',
          createdAt: serverTimestamp(),
        });
        await fetchUserOrders(user.uid);
      }

      await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          access_key: 'YOUR_WEB3FORMS_ACCESS_KEY',
          subject: `New ZUVI Order (UTR: ${utrNumber.trim()}) from ${formData.name}`,
          from_name: 'ZUVI Store',
          message: `Product: ${selectedItem.name} | Amount: ₹${selectedItem.price} | UTR: ${utrNumber.trim()} | Customer: ${formData.name} | Phone: ${formData.phone} | Address: ${formData.address}, ${formData.city} - ${formData.pincode}`,
        }),
      });
    } catch (err) {
      console.error(err);
    } finally {
      setIsVerifying(false);
      setStep('success');
    }
  };

  return (
    <div className="min-h-screen bg-[#0a1f16] text-[#ecfdf5] font-sans selection:bg-amber-400 selection:text-[#081a12] overflow-x-hidden relative">
      {/* Smooth Dark Emerald Silk-Sea Background */}
      <motion.div
        style={{ y: silkShift }}
        aria-hidden="true"
        className="fixed inset-0 pointer-events-none z-0"
      >
        <div
          className="w-full h-[120vh] -top-[10vh] relative"
          style={{
            background: `
              radial-gradient(ellipse 85% 55% at 20% 22%, rgba(45, 118, 84, 0.45) 0%, rgba(18, 56, 39, 0.32) 48%, transparent 76%),
              radial-gradient(ellipse 80% 60% at 82% 35%, rgba(56, 138, 99, 0.35) 0%, rgba(14, 46, 32, 0.42) 52%, transparent 78%),
              radial-gradient(ellipse 95% 65% at 50% 82%, rgba(28, 84, 59, 0.5) 0%, rgba(10, 32, 22, 0.85) 58%, #071710 100%),
              linear-gradient(145deg, #0e2c1f 0%, #143b2a 38%, #0b2419 72%, #081a12 100%)
            `,
          }}
        />
        <motion.div
          animate={{ x: ['-4%', '4%', '-4%'], rotate: [-1, 1.5, -1] }}
          transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute inset-x-[-10%] top-[14%] h-64 rounded-full bg-emerald-400/10 blur-3xl"
        />
        <motion.div
          animate={{ x: ['5%', '-5%', '5%'], rotate: [1.5, -1, 1.5] }}
          transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute inset-x-[-10%] top-[54%] h-72 rounded-full bg-teal-300/10 blur-3xl"
        />
      </motion.div>

      {/* Smooth Cursor Sea Sheen & Water Ripples */}
      <div aria-hidden="true" className="fixed inset-0 pointer-events-none z-[1] overflow-hidden">
        <motion.div style={{ background: seaGlowBg }} className="absolute inset-0" />
        <AnimatePresence>
          {ripples.map((ripple) => (
            <motion.span
              key={ripple.id}
              initial={{ opacity: 0.45, scale: 0.2 }}
              animate={{ opacity: 0, scale: 2.3 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.5, ease: 'easeOut' }}
              onAnimationComplete={() =>
                setRipples((prev) => prev.filter((item) => item.id !== ripple.id))
              }
              style={{ left: ripple.x - 60, top: ripple.y - 60 }}
              className="w-[120px] h-[120px] rounded-full border border-emerald-200/35 shadow-[0_0_18px_rgba(110,231,183,0.2)] absolute"
            />
          ))}
        </AnimatePresence>
      </div>

      {/* Navigation Header */}
      <header className="border-b border-emerald-800/35 bg-[#0a1f16]/80 backdrop-blur-xl sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-serif tracking-widest text-amber-300 font-bold">ZUVI</h1>
            <span className="hidden xl:inline-block text-[10px] uppercase tracking-wider text-emerald-200/85 border border-emerald-700/50 px-2.5 py-0.5 rounded-full font-mono bg-emerald-950/60">
              ANTI-TARNISH JEWELRY
            </span>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            <nav className="hidden lg:flex items-center gap-5 text-xs uppercase tracking-wider text-emerald-100/75 font-mono">
              <a href="#collections" className="hover:text-amber-300 transition">Collections</a>
              <a href="#proof" className="hover:text-amber-300 transition">Why It Lasts</a>
              <a href="#event" className="hover:text-amber-300 transition">IMS Event</a>
            </nav>

            {!authLoading && user ? (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    fetchUserOrders(user.uid);
                    setIsOrdersOpen(true);
                  }}
                  className="bg-emerald-950/85 hover:bg-emerald-900 text-emerald-100 border border-emerald-700/50 px-3.5 py-2 rounded-lg text-xs font-mono transition"
                >
                  Orders ({userOrders.length})
                </button>
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="text-[11px] font-mono text-emerald-300/80 hover:text-amber-300 px-2 py-1.5 transition"
                  title={`Signed in as ${user.email}`}
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleGoogleSignIn}
                className="bg-emerald-950/85 hover:bg-emerald-900 text-emerald-100 border border-emerald-700/50 px-3.5 py-2 rounded-lg text-xs font-mono transition"
              >
                Sign In
              </button>
            )}

            <button
              onClick={() =>
                handleBuyNow({
                  name: activeHeroRing.name,
                  price: activeHeroRing.price,
                  originalPrice: activeHeroRing.originalPrice,
                })
              }
              className="bg-amber-400 hover:bg-amber-300 text-[#081a12] font-bold px-4 sm:px-5 py-2 rounded-lg transition text-xs font-mono shadow-sm shrink-0"
            >
              Order — ₹{activeHeroRing.price}
            </button>
          </div>
        </div>
      </header>

      {/* Editorial Hero + Floating Silk & Leaf Stage */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 pt-10 pb-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-5 space-y-5">
            <div className="inline-block bg-emerald-950/75 border border-emerald-700/50 px-3.5 py-1 rounded-full text-amber-300 text-[11px] font-mono backdrop-blur-sm">
              Launch Price ₹{activeHeroRing.price} • {activeHeroRing.name}
            </div>

            <h2 className="text-4xl md:text-5xl font-serif text-white tracking-tight leading-[1.12]">
              Effortless Shine,{' '}
              <span className="italic font-normal text-amber-300">
                Made for Everyday Wear
              </span>
            </h2>

            <p className="text-emerald-100/80 text-base leading-relaxed">
              Crafted with 18k PVD gold plating over stainless steel. Water-resistant, skin-safe, and built to hold its rich finish wear after wear.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button
                onClick={() =>
                  handleBuyNow({
                    name: activeHeroRing.name,
                    price: activeHeroRing.price,
                    originalPrice: activeHeroRing.originalPrice,
                  })
                }
                className="bg-amber-400 hover:bg-amber-300 text-[#081a12] font-bold px-7 py-3.5 rounded-xl transition text-sm font-mono shadow-lg shadow-amber-500/15"
              >
                Order Now — ₹{activeHeroRing.price}
              </button>
              <button
                onClick={() => openItemGallery(activeHeroRing, 0)}
                className="bg-emerald-950/70 hover:bg-emerald-900/80 text-emerald-100 border border-emerald-700/50 px-5 py-3.5 rounded-xl transition text-sm font-mono backdrop-blur-sm"
              >
                View All Angles
              </button>
            </div>

            <div className="pt-3 border-t border-emerald-800/40 flex items-center justify-between text-xs font-mono text-emerald-200/80">
              <span>
                <strong className="text-xl font-serif text-amber-300">₹{activeHeroRing.price}</strong>{' '}
                <span className="line-through text-emerald-400/50">₹{activeHeroRing.originalPrice}</span>
              </span>
              <span>Free delivery on campus</span>
            </div>
          </div>

          <div className="lg:col-span-7">
            <div
              className="relative rounded-t-[180px] rounded-b-3xl p-5 md:p-7 border border-emerald-600/35 shadow-[0_24px_60px_rgba(3,12,8,0.55)] overflow-hidden"
              style={{
                background:
                  'linear-gradient(160deg, rgba(25, 74, 53, 0.72) 0%, rgba(14, 46, 32, 0.82) 52%, rgba(9, 30, 21, 0.92) 100%)',
              }}
            >
              <svg
                viewBox="0 0 240 240"
                aria-hidden="true"
                className="w-40 h-40 text-emerald-300/15 absolute -top-4 -right-4 pointer-events-none"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path d="M40 190 C70 120, 140 60, 215 25" />
                <path d="M85 135 C55 115, 45 85, 65 65 C85 85, 95 110, 85 135 Z" />
                <path d="M125 95 C115 65, 130 40, 155 45 C155 70, 140 88, 125 95 Z" />
                <path d="M155 70 C175 75, 195 65, 200 45 C180 45, 162 55, 155 70 Z" />
              </svg>

              <div
                className="relative h-80 md:h-[420px] rounded-2xl bg-[#071811]/65 backdrop-blur-md border border-emerald-600/30 flex flex-col items-center justify-center p-6 cursor-grab active:cursor-grabbing select-none overflow-hidden"
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
              >
                <motion.div
                  animate={{ x: [-12, 12, -12], scale: [1, 1.04, 1] }}
                  transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                  className="w-64 h-24 rounded-full bg-gradient-to-r from-emerald-500/20 via-amber-300/20 to-emerald-400/20 blur-xl absolute bottom-8 pointer-events-none"
                />

                <motion.div
                  animate={
                    gentleFloat
                      ? { y: [-7, 7, -7], rotate: tiltDeg }
                      : { y: 0, rotate: tiltDeg }
                  }
                  transition={
                    gentleFloat
                      ? {
                          y: { duration: 4.2, repeat: Infinity, ease: 'easeInOut' },
                          rotate: { type: 'spring', stiffness: 180, damping: 22 },
                        }
                      : { type: 'spring', stiffness: 180, damping: 22 }
                  }
                  className="relative z-10 flex flex-col items-center justify-center"
                >
                  <img
                    src={getImageUrl(activeHeroRing.cardImage)}
                    alt={`${activeHeroRing.name} showcase`}
                    className="max-h-56 md:max-h-64 w-auto object-contain rounded-2xl drop-shadow-[0_18px_32px_rgba(0,0,0,0.65)]"
                  />
                </motion.div>

                <div className="mt-4 z-10 text-center space-y-1">
                  <span className="inline-block text-[11px] font-mono bg-emerald-950/90 border border-emerald-600/40 text-emerald-100 px-3 py-1 rounded-full">
                    Drag to tilt • Click ring for angle views
                  </span>
                </div>
              </div>

              <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#081b13]/80 backdrop-blur-md border border-emerald-700/35 rounded-2xl px-4 py-3">
                <div className="flex items-center gap-3 w-full sm:w-auto flex-1">
                  <button
                    type="button"
                    onClick={() => setGentleFloat((prev) => !prev)}
                    className="text-[11px] font-mono px-3 py-1.5 rounded-lg bg-amber-400 text-[#081a12] font-bold shrink-0"
                  >
                    {gentleFloat ? 'Steady View' : 'Float Motion'}
                  </button>
                  <input
                    type="range"
                    min={-28}
                    max={28}
                    value={Math.round(tiltDeg)}
                    onChange={(e) => {
                      setGentleFloat(false);
                      setTiltDeg(Number(e.target.value));
                    }}
                    aria-label="Tilt ring angle"
                    className="w-full accent-amber-400 cursor-pointer"
                  />
                </div>

                <div className="flex items-center gap-2 shrink-0 overflow-x-auto max-w-full">
                  {ringCatalog.slice(0, 6).map((ring) => (
                    <button
                      key={ring.id}
                      type="button"
                      onClick={() => setHeroRingId(ring.id)}
                      title={`Preview ${ring.name}`}
                      className={`w-10 h-10 rounded-lg overflow-hidden border bg-[#0b2218] hover:scale-105 transition shrink-0 ${
                        activeHeroRing.id === ring.id
                          ? 'border-amber-300 ring-2 ring-amber-300/40'
                          : 'border-emerald-600/40'
                      }`}
                    >
                      <img
                        src={getImageUrl(ring.cardImage)}
                        alt={ring.name}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Jewelry Categories Section */}
      <section id="collections" className="relative z-10 max-w-6xl mx-auto px-6 py-12">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <span className="text-[11px] font-mono uppercase tracking-widest text-amber-300">
              Shop By Category
            </span>
            <h3 className="text-3xl font-serif text-white mt-1">ZUVI Collections</h3>
          </div>

          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full text-xs font-mono tracking-wider transition border ${
                  selectedCategory === cat
                    ? 'bg-amber-400 text-[#081a12] border-amber-300 font-bold shadow-md'
                    : 'bg-[#0e2a1e]/80 text-emerald-100/80 border-emerald-700/40 hover:border-amber-300/50 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {visibleCategoryItems.map((item) => (
            <div
              key={item.id}
              className="bg-[#0e2a1e]/75 backdrop-blur-md border border-emerald-700/40 rounded-3xl p-5 flex flex-col justify-between shadow-xl group"
            >
              <div>
                <div
                  onClick={() => openItemGallery(item, 0)}
                  className="h-60 rounded-2xl bg-[#071811] border border-emerald-800/50 overflow-hidden flex items-center justify-center p-4 cursor-pointer relative"
                >
                  <img
                    src={getImageUrl(item.cardImage)}
                    alt={item.name}
                    className="max-h-full max-w-full object-contain rounded-xl group-hover:scale-105 transition duration-300"
                  />
                  <span className="absolute bottom-3 right-3 text-[10px] font-mono bg-[#0a1f16]/90 text-amber-300 border border-emerald-700/40 px-2.5 py-1 rounded-full">
                    {item.angles.length > 1 ? `${item.angles.length} angles` : 'Inspect view'}
                  </span>
                </div>

                <div className="mt-4 space-y-1.5">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-300/75">
                    {item.category} • {item.badge}
                  </span>
                  <h4 className="text-xl font-serif text-white">{item.name}</h4>
                  <p className="text-xs text-emerald-100/75 leading-relaxed">{item.tagline}</p>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-emerald-800/40 flex items-center justify-between">
                <div>
                  <span className="text-2xl font-serif text-amber-300 font-bold">
                    ₹{item.price}
                  </span>{' '}
                  <span className="text-xs line-through text-emerald-400/50">
                    ₹{item.originalPrice}
                  </span>
                </div>
                <button
                  onClick={() =>
                    handleBuyNow({
                      name: item.name,
                      price: item.price,
                      originalPrice: item.originalPrice,
                    })
                  }
                  className="bg-amber-400 hover:bg-amber-300 text-[#081a12] font-bold px-4 py-2 rounded-xl text-xs font-mono transition"
                >
                  Buy Now
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Why It Lasts */}
      <section id="proof" className="relative z-10 max-w-5xl mx-auto px-6 py-14">
        <div className="text-center mb-10">
          <h3 className="text-3xl font-serif text-white">
            Why ZUVI jewelry won&apos;t turn your skin green
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#0e2a1e]/65 backdrop-blur-md border border-emerald-700/35 rounded-2xl p-6 space-y-3 shadow-lg">
            <h4 className="text-xl font-serif text-amber-300">Anti-tarnish finish that lasts</h4>
            <p className="text-emerald-100/80 text-sm leading-relaxed">
              Most cheap pieces use thin plating that fades fast. Vacuum 18k PVD gold plating bonds over stainless steel so the color holds up over time.
            </p>
          </div>

          <div className="bg-[#0e2a1e]/65 backdrop-blur-md border border-emerald-700/35 rounded-2xl p-6 space-y-3 shadow-lg">
            <h4 className="text-xl font-serif text-amber-300">No need to remove it</h4>
            <p className="text-emerald-100/80 text-sm leading-relaxed">
              Wash your hands, go to the gym, get caught in rain — you can keep it on. It&apos;s made for daily use.
            </p>
          </div>

          <div className="bg-[#0e2a1e]/65 backdrop-blur-md border border-emerald-700/35 rounded-2xl p-6 space-y-3 shadow-lg">
            <h4 className="text-xl font-serif text-amber-300">Built for everyday wear</h4>
            <p className="text-emerald-100/80 text-sm leading-relaxed">
              Secure stone settings and sturdy stainless steel bases keep every piece ready for daily campus and lifestyle wear.
            </p>
          </div>
        </div>

        <div className="text-center mt-8">
          <p className="text-emerald-200/65 text-xs font-mono italic">
            Basically, it&apos;s built to survive real student life.
          </p>
        </div>
      </section>

      {/* IMS Ghaziabad Offline Event Section */}
      <section id="event" className="relative z-10 max-w-5xl mx-auto px-6 py-14">
        <div className="bg-[#0e2a1e]/75 border border-emerald-700/40 rounded-3xl p-6 md:p-10 shadow-2xl backdrop-blur-md">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="space-y-5">
              <span className="bg-amber-400/15 text-amber-300 border border-amber-400/30 text-[11px] font-mono px-3 py-1 rounded-full">
                REAL EVENT PROOF
              </span>
              <h3 className="text-3xl font-serif text-white">IMS Ghaziabad Offline Event</h3>
              <p className="text-emerald-100/80 text-sm leading-relaxed">
                We brought ZUVI directly to students at our IMS Ghaziabad offline event. Over 80+ rings were picked up live on the spot within 2 hours.
              </p>

              <div className="flex gap-4 font-mono text-xs text-emerald-100/80 pt-2">
                <div className="bg-[#081a12] p-3 rounded-xl border border-emerald-800/50">
                  <span className="text-amber-300 font-bold text-base block">80+ Sold</span>
                  In 120 Minutes
                </div>
                <div className="bg-[#081a12] p-3 rounded-xl border border-emerald-800/50">
                  <span className="text-amber-300 font-bold text-base block">Live Try-Ons</span>
                  Instant UPI
                </div>
              </div>

              <div className="space-y-2 pt-2">
                {[
                  { title: 'IMS Event Highlights', file: 'video1.mp4' },
                  { title: 'Student Try-Ons & Feedback', file: 'video2.mp4' },
                  { title: 'Behind The Scenes Reel', file: 'video3.mp4' },
                ].map((vid) => (
                  <button
                    key={vid.file}
                    onClick={() => {
                      setActiveVideo(vid.file);
                      setIsVideoModalOpen(true);
                    }}
                    className={`w-full flex items-center justify-between p-3 rounded-xl border text-xs font-mono text-left transition ${
                      activeVideo === vid.file
                        ? 'bg-emerald-900/70 border-amber-300 text-white'
                        : 'bg-[#081a12]/85 border-emerald-800/50 text-emerald-200/80 hover:text-white'
                    }`}
                  >
                    <span>▶ {vid.title}</span>
                    <span className="text-amber-300">Play Reel</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="h-80 bg-[#06140e] rounded-2xl overflow-hidden border border-emerald-800/50 relative flex items-center justify-center">
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

      {/* Multi-Angle Photo Inspector Modal */}
      <AnimatePresence>
        {isGalleryOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4"
            onClick={() => setIsGalleryOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-2xl bg-[#0e2a1e] text-white rounded-3xl p-6 md:p-8 border border-emerald-700/50 shadow-2xl relative space-y-5"
            >
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-mono uppercase text-amber-300">
                    Studio &amp; Angle Inspector
                  </span>
                  <h4 className="text-2xl font-serif font-bold">
                    {activeGalleryItem.name} —{' '}
                    {activeGalleryItem.angles[galleryIndex]?.label ?? 'Preview'}
                  </h4>
                </div>
                <button
                  onClick={() => setIsGalleryOpen(false)}
                  className="w-9 h-9 rounded-full bg-emerald-950 border border-emerald-700/50 text-white flex items-center justify-center text-sm hover:bg-amber-400 hover:text-[#081a12] transition"
                >
                  ✕
                </button>
              </div>

              <div className="h-72 md:h-96 bg-[#071811] rounded-2xl border border-emerald-800/50 flex items-center justify-center p-4 overflow-hidden">
                <img
                  src={getImageUrl(
                    activeGalleryItem.angles[galleryIndex]?.file ?? activeGalleryItem.cardImage
                  )}
                  alt={`${activeGalleryItem.name} view`}
                  className="max-h-full max-w-full object-contain rounded-xl"
                />
              </div>

              {activeGalleryItem.angles.length > 1 && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {activeGalleryItem.angles.map((angle, idx) => (
                    <button
                      key={`${angle.file}-${idx}`}
                      onClick={() => setGalleryIndex(idx)}
                      className={`p-2 rounded-xl border text-center transition ${
                        galleryIndex === idx
                          ? 'bg-amber-400 text-[#081a12] border-amber-300 font-bold'
                          : 'bg-[#081a12] text-emerald-100 border-emerald-800/50 hover:border-amber-300/50'
                      }`}
                    >
                      <img
                        src={getImageUrl(angle.file)}
                        alt={angle.label}
                        className="w-full h-12 object-cover rounded-lg mb-1"
                      />
                      <span className="text-[10px] font-mono block truncate">{angle.label}</span>
                    </button>
                  ))}
                </div>
              )}

              <div className="flex items-center justify-between pt-2">
                <span className="font-mono text-sm font-bold text-amber-300">
                  ₹{activeGalleryItem.price}{' '}
                  <span className="line-through text-xs text-emerald-400/50">
                    ₹{activeGalleryItem.originalPrice}
                  </span>
                </span>
                <button
                  onClick={() => {
                    setIsGalleryOpen(false);
                    handleBuyNow({
                      name: activeGalleryItem.name,
                      price: activeGalleryItem.price,
                      originalPrice: activeGalleryItem.originalPrice,
                    });
                  }}
                  className="bg-amber-400 hover:bg-amber-300 text-[#081a12] font-mono text-xs uppercase px-6 py-3 rounded-xl font-bold transition"
                >
                  Order Now — ₹{activeGalleryItem.price}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* My Orders Modal */}
      {isOrdersOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#0e2a1e] text-white border border-emerald-700/50 w-full max-w-lg rounded-2xl p-6 shadow-2xl relative my-8 space-y-4">
            <button
              onClick={() => setIsOrdersOpen(false)}
              className="absolute top-4 right-4 text-emerald-200 hover:text-white text-lg"
            >
              ✕
            </button>
            <div>
              <span className="text-[11px] font-mono uppercase text-amber-300">Account</span>
              <h3 className="text-2xl font-serif font-bold">My ZUVI Orders</h3>
              {user?.email && (
                <p className="text-xs text-emerald-200/70 font-mono">{user.email}</p>
              )}
            </div>

            {loadingOrders ? (
              <p className="text-xs font-mono text-emerald-200/70 py-6 text-center">
                Loading your orders...
              </p>
            ) : userOrders.length === 0 ? (
              <p className="text-sm text-emerald-100/75 py-6 text-center">
                No orders placed yet. Click Buy Now on any item to place your first order.
              </p>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                {userOrders.map((ord) => (
                  <div
                    key={ord.id}
                    className="bg-[#071811] border border-emerald-800/60 rounded-xl p-4 space-y-1.5 text-xs font-mono"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-white font-bold text-sm font-sans">
                        {ord.productName}
                      </span>
                      <span className="text-amber-300 font-bold">₹{ord.price}</span>
                    </div>
                    <div className="flex items-center justify-between text-emerald-200/75">
                      <span>UTR: {ord.utrNumber}</span>
                      <span className="text-amber-300">{ord.status}</span>
                    </div>
                    <p className="text-emerald-300/60">
                      {ord.city} - {ord.pincode}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Fullscreen Video Modal */}
      {isVideoModalOpen && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="relative w-full max-w-3xl bg-[#0e261b] rounded-2xl overflow-hidden border border-emerald-700/40 shadow-2xl">
            <button
              onClick={() => setIsVideoModalOpen(false)}
              className="absolute top-4 right-4 text-white text-lg bg-black/60 w-8 h-8 rounded-full flex items-center justify-center hover:bg-amber-400 hover:text-[#081a12] transition z-10"
            >
              ✕
            </button>
            <div className="aspect-video w-full bg-black flex items-center justify-center">
              <video controls autoPlay className="w-full h-full object-contain">
                <source src={`/videos/${activeVideo}`} type="video/mp4" />
              </video>
            </div>
          </div>
        </div>
      )}

      {/* Checkout Modal */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#0e2a1e] text-white border border-emerald-700/50 w-full max-w-lg rounded-2xl p-6 md:p-8 shadow-2xl relative my-8">
            <button
              onClick={() => setIsCheckoutOpen(false)}
              className="absolute top-4 right-4 text-emerald-200 hover:text-white text-lg"
            >
              ✕
            </button>

            {step === 'form' && (
              <form onSubmit={validateAndProceed} className="space-y-4">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-2xl font-serif text-amber-300 font-bold">
                    Shipping Details
                  </h3>
                  {!user && (
                    <button
                      type="button"
                      onClick={handleGoogleSignIn}
                      className="text-[11px] font-mono bg-[#071811] hover:bg-emerald-950 border border-emerald-700/60 text-amber-300 px-3 py-1.5 rounded-lg transition"
                    >
                      Sign in to save account
                    </button>
                  )}
                </div>

                <p className="text-xs text-emerald-100/75">
                  Item: <span className="font-semibold text-white">{selectedItem.name}</span> —{' '}
                  <span className="font-bold text-amber-300">₹{selectedItem.price}</span>
                </p>

                <div>
                  <label className="block text-xs uppercase font-mono text-emerald-200/80 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-[#071811] border border-emerald-800/60 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-amber-300"
                    placeholder="Chitranjan Vikram Singh"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase font-mono text-emerald-200/80 mb-1">
                    Mobile Number
                  </label>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-[#071811] border border-emerald-800/60 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-amber-300"
                    placeholder="9876543210"
                  />
                  {errors.phone && <p className="text-rose-400 text-xs mt-1">{errors.phone}</p>}
                </div>

                <div>
                  <label className="block text-xs uppercase font-mono text-emerald-200/80 mb-1">
                    Delivery Address
                  </label>
                  <textarea
                    required
                    rows={2}
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full bg-[#071811] border border-emerald-800/60 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-amber-300 resize-none"
                    placeholder="Hostel Room / Street Address"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs uppercase font-mono text-emerald-200/80 mb-1">
                      City
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="w-full bg-[#071811] border border-emerald-800/60 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-amber-300"
                      placeholder="Ghaziabad"
                    />
                  </div>
                  <div>
                    <label className="block text-xs uppercase font-mono text-emerald-200/80 mb-1">
                      Pincode
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={6}
                      value={formData.pincode}
                      onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                      className="w-full bg-[#071811] border border-emerald-800/60 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-amber-300"
                      placeholder="201009"
                    />
                    {errors.pincode && <p className="text-rose-400 text-xs mt-1">{errors.pincode}</p>}
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-amber-400 hover:bg-amber-300 text-[#081a12] font-bold py-3.5 rounded-xl transition mt-4 font-mono text-xs uppercase tracking-wider"
                >
                  Generate 2-Min UPI QR (₹{selectedItem.price})
                </button>
              </form>
            )}

            {step === 'qr' && (
              <form onSubmit={handlePaymentConfirmed} className="text-center space-y-4 py-1">
                <div className="flex items-center justify-between bg-[#071811] border border-emerald-800/60 px-4 py-2 rounded-xl text-xs font-mono">
                  <span className="text-emerald-200/80">Session Expires In</span>
                  <span
                    className={`font-bold ${
                      secondsLeft <= 30 ? 'text-rose-400 animate-pulse' : 'text-amber-300'
                    }`}
                  >
                    {formatTimer(secondsLeft)}
                  </span>
                </div>

                <div>
                  <h3 className="text-2xl font-serif text-amber-300 font-bold">
                    Scan &amp; Pay ₹{selectedItem.price}
                  </h3>
                  <p className="text-xs text-emerald-200/80 font-mono mt-1">
                    Exact amount ₹{selectedItem.price} locked • GPay, PhonePe, Paytm
                  </p>
                </div>

                {secondsLeft > 0 ? (
                  <div className="bg-white p-4 rounded-2xl w-52 h-52 mx-auto flex items-center justify-center border-2 border-amber-300/50 shadow-md">
                    <QRCodeSVG value={upiPaymentUri} size={176} level="H" />
                  </div>
                ) : (
                  <div className="bg-[#071811] border border-rose-500/40 rounded-2xl p-6 space-y-3">
                    <p className="text-sm text-rose-300 font-mono">QR session expired (02:00).</p>
                    <button
                      type="button"
                      onClick={() => {
                        setSecondsLeft(120);
                        setUtrError('');
                      }}
                      className="bg-amber-400 hover:bg-amber-300 text-[#081a12] font-bold px-4 py-2 rounded-xl text-xs font-mono"
                    >
                      Generate Fresh 2-Min QR
                    </button>
                  </div>
                )}

                {secondsLeft > 0 && (
                  <a
                    href={upiPaymentUri}
                    className="inline-block text-[11px] font-mono text-amber-300 underline hover:text-amber-200"
                  >
                    On mobile? Open UPI app directly →
                  </a>
                )}

                <div className="text-left pt-1">
                  <label className="block text-[11px] uppercase font-mono text-emerald-200/80 mb-1">
                    12-Digit UPI UTR / Transaction ID *
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={12}
                    required
                    disabled={secondsLeft === 0 || isVerifying}
                    value={utrNumber}
                    onChange={(e) => setUtrNumber(e.target.value.replace(/\D/g, ''))}
                    placeholder="e.g. 432918472615"
                    className="w-full bg-[#071811] border border-emerald-800/60 rounded-xl px-4 py-2.5 text-white text-sm font-mono tracking-wider focus:outline-none focus:border-amber-300 disabled:opacity-50"
                  />
                  {utrError && <p className="text-rose-400 text-xs mt-1">{utrError}</p>}
                </div>

                <button
                  type="submit"
                  disabled={secondsLeft === 0 || isVerifying}
                  className="w-full bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-[#081a12] font-bold py-3.5 rounded-xl transition font-mono text-xs uppercase tracking-wider"
                >
                  {isVerifying ? 'Recording Order...' : 'Verify UTR & Confirm Order'}
                </button>
              </form>
            )}

            {step === 'success' && (
              <div className="text-center space-y-6 py-6">
                <div className="w-14 h-14 bg-amber-400 text-[#081a12] font-bold rounded-full flex items-center justify-center mx-auto text-xl">
                  ✓
                </div>
                <h3 className="text-2xl font-serif text-white font-bold">Order Recorded!</h3>
                <p className="text-emerald-100/80 text-sm max-w-sm mx-auto">
                  UTR <span className="font-mono text-amber-300">{utrNumber}</span> is logged under{' '}
                  {user ? 'your account orders' : 'our order queue'} for verification and dispatch.
                </p>
                <div className="flex items-center justify-center gap-3">
                  {user && (
                    <button
                      onClick={() => {
                        setIsCheckoutOpen(false);
                        setIsOrdersOpen(true);
                      }}
                      className="bg-emerald-950 hover:bg-emerald-900 text-emerald-100 border border-emerald-700/50 font-mono text-xs uppercase px-5 py-2.5 rounded-xl transition"
                    >
                      View Orders
                    </button>
                  )}
                  <button
                    onClick={() => setIsCheckoutOpen(false)}
                    className="bg-amber-400 hover:bg-amber-300 text-[#081a12] font-bold font-mono text-xs uppercase px-6 py-2.5 rounded-xl transition"
                  >
                    Back to Store
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="relative z-10 border-t border-emerald-800/40 bg-[#071811]/90 backdrop-blur-md py-12">
        <div className="max-w-6xl mx-auto px-6 text-center text-emerald-200/70 text-xs font-mono space-y-3">
          <p className="font-serif text-amber-300 tracking-widest text-base font-bold">
            ZUVI JEWELRY
          </p>
          <p>Anti-tarnish jewelry designed for daily campus &amp; lifestyle wear.</p>
          <p className="pt-2 text-emerald-400/50">© 2026 ZUVI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}