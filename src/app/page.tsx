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
const WISHLIST_STORAGE_KEY = 'zuvi_wishlist_ids_v1';

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

  // Auth & User Profile / Orders / Wishlist State
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [isOrdersOpen, setIsOrdersOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [userOrders, setUserOrders] = useState<OrderRecord[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    pincode: '',
    city: '',
  });

  useEffect(() => {
    try {
      const raw = localStorage.getItem(WISHLIST_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          setWishlistIds(parsed.filter((v): v is string => typeof v === 'string'));
        }
      }
    } catch {
      // ignore storage errors
    }
  }, []);

  const persistWishlist = async (nextIds: string[], currentUser: User | null) => {
    try {
      localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(nextIds));
    } catch {
      // ignore storage errors
    }
    if (currentUser) {
      try {
        await setDoc(
          doc(db, 'users', currentUser.uid),
          { wishlist: nextIds, updatedAt: serverTimestamp() },
          { merge: true }
        );
      } catch (err) {
        console.error('Failed to sync wishlist:', err);
      }
    }
  };

  const toggleWishlist = (productId: string) => {
    setWishlistIds((prev) => {
      const exists = prev.includes(productId);
      const next = exists ? prev.filter((id) => id !== productId) : [...prev, productId];
      void persistWishlist(next, user);
      return next;
    });
  };

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
            if (Array.isArray(saved.wishlist)) {
              const cloudIds = saved.wishlist.filter((v): v is string => typeof v === 'string');
              setWishlistIds((localPrev) => {
                const merged = Array.from(new Set([...localPrev, ...cloudIds]));
                try {
                  localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(merged));
                } catch {
                  // ignore
                }
                return merged;
              });
            }
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

  // Full Catalog across categories
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
      cardImage: 'earring-emerald-drop.png',
      angles: [{ file: 'earring-emerald-drop.png', label: 'Drop View' }],
    },
    {
      id: 'baguette-stud-earrings',
      category: 'EARINGS',
      name: 'Baguette Cluster Gold Studs',
      price: 350,
      originalPrice: 999,
      badge: 'ANTI-TARNISH',
      tagline:
        'Crisp baguette-cut ear studs finished in durable vacuum-plated 18k gold.',
      cardImage: 'earring-baguette-studs.png',
      angles: [{ file: 'earring-baguette-studs.png', label: 'Stud View' }],
    },
    {
      id: 'imperial-emerald-jumka',
      category: 'JUMKA',
      name: 'Imperial Emerald Gold Jumka',
      price: 399,
      originalPrice: 1199,
      badge: 'CAMPUS EDITION',
      tagline:
        'Modern anti-tarnish dome jumka crafted in 18k PVD gold over stainless steel.',
      cardImage: 'jumka-imperial-emerald.png',
      angles: [{ file: 'jumka-imperial-emerald.png', label: 'Front View' }],
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
      cardImage: 'jumka-sunburst-gold.png',
      angles: [{ file: 'jumka-sunburst-gold.png', label: 'Front View' }],
    },
    {
      id: 'crossover-pave-bracelet',
      category: 'BRACELTS',
      name: 'Crossover Pavé Gold Bracelet',
      price: 449,
      originalPrice: 1299,
      badge: '18K PVD GOLD',
      tagline:
        'Sleek anti-tarnish wrist bracelet with pavé shimmer over a water-resistant steel core.',
      cardImage: 'bracelet-crossover-pave.png',
      angles: [{ file: 'bracelet-crossover-pave.png', label: 'Wrist View' }],
    },
    {
      id: 'woven-gold-bracelet',
      category: 'BRACELTS',
      name: 'Woven Multi-Band Gold Bracelet',
      price: 449,
      originalPrice: 1299,
      badge: 'ANTI-TARNISH',
      tagline:
        'Layered gold-tone wrist chain designed for effortless everyday stack or solo wear.',
      cardImage: 'bracelet-woven-gold.png',
      angles: [{ file: 'bracelet-woven-gold.png', label: 'Chain View' }],
    },
    {
      id: 'teardrop-pave-pendant',
      category: 'PENDANTS',
      name: 'Teardrop Pavé Gold Pendant',
      price: 350,
      originalPrice: 999,
      badge: '18K PVD GOLD',
      tagline:
        'Everyday anti-tarnish neck pendant finished in rich 18k PVD gold over stainless steel.',
      cardImage: 'pendant-teardrop-pave.png',
      angles: [{ file: 'pendant-teardrop-pave.png', label: 'Necklace View' }],
    },
    {
      id: 'crown-leaf-pendant',
      category: 'PENDANTS',
      name: 'Crown Leaf Gold Pendant',
      price: 350,
      originalPrice: 999,
      badge: 'ANTI-TARNISH',
      tagline:
        'Sculpted leaf and crystal neck pendant built to hold its finish through daily campus wear.',
      cardImage: 'pendant-crown-leaf.png',
      angles: [{ file: 'pendant-crown-leaf.png', label: 'Pendant View' }],
    },
  ];

  const ringCatalog = catalogItems.filter((item) => item.category === 'RINGS');
  const visibleCategoryItems = catalogItems.filter((item) => item.category === selectedCategory);
  const wishlistedItems = catalogItems.filter((item) => wishlistIds.includes(item.id));

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
            wishlist: wishlistIds,
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

      {/* Smooth Cursor Sea Sheen & Water Ripples (hidden on touch/mobile via md:block) */}
      <div aria-hidden="true" className="hidden md:block fixed inset-0 pointer-events-none z-[1] overflow-hidden">
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

      {/* Navigation Header — Mobile-Compact */}
      <header className="border-b border-emerald-800/35 bg-[#0a1f16]/85 backdrop-blur-xl sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 shrink-0">
            <h1 className="text-xl sm:text-2xl font-serif tracking-widest text-amber-300 font-bold">
              ZUVI
            </h1>
            <span className="hidden xl:inline-block text-[10px] uppercase tracking-wider text-emerald-200/85 border border-emerald-700/50 px-2.5 py-0.5 rounded-full font-mono bg-emerald-950/60">
              ANTI-TARNISH JEWELRY
            </span>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-3 overflow-x-auto no-scrollbar">
            <nav className="hidden lg:flex items-center gap-5 text-xs uppercase tracking-wider text-emerald-100/75 font-mono">
              <a href="#collections" className="hover:text-amber-300 transition">Collections</a>
              <a href="#proof" className="hover:text-amber-300 transition">Why It Lasts</a>
              <a href="#event" className="hover:text-amber-300 transition">IMS Event</a>
            </nav>

            <button
              type="button"
              onClick={() => setIsWishlistOpen(true)}
              className="bg-emerald-950/85 hover:bg-emerald-900 text-amber-300 border border-emerald-700/50 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg text-[11px] sm:text-xs font-mono transition shrink-0"
            >
              ♥ <span className="hidden sm:inline">Wishlist</span> ({wishlistIds.length})
            </button>

            {!authLoading && user ? (
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    fetchUserOrders(user.uid);
                    setIsOrdersOpen(true);
                  }}
                  className="bg-emerald-950/85 hover:bg-emerald-900 text-emerald-100 border border-emerald-700/50 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg text-[11px] sm:text-xs font-mono transition shrink-0"
                >
                  Orders ({userOrders.length})
                </button>
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="hidden sm:inline-block text-[11px] font-mono text-emerald-300/80 hover:text-amber-300 px-2 py-1.5 transition"
                  title={`Signed in as ${user.email}`}
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleGoogleSignIn}
                className="bg-emerald-950/85 hover:bg-emerald-900 text-emerald-100 border border-emerald-700/50 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg text-[11px] sm:text-xs font-mono transition shrink-0"
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
              className="bg-amber-400 hover:bg-amber-300 text-[#081a12] font-bold px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg transition text-[11px] sm:text-xs font-mono shadow-sm shrink-0"
            >
              Order • ₹{activeHeroRing.price}
            </button>
          </div>
        </div>
      </header>

      {/* Editorial Hero + Floating Silk & Leaf Stage */}
      <section className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 pt-6 sm:pt-10 pb-8 sm:pb-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-10 items-center">
          <div className="lg:col-span-5 space-y-4 sm:space-y-5 text-left">
            <div className="inline-block bg-emerald-950/75 border border-emerald-700/50 px-3 py-1 rounded-full text-amber-300 text-[10px] sm:text-[11px] font-mono backdrop-blur-sm">
              Launch Price ₹{activeHeroRing.price} • {activeHeroRing.name}
            </div>

            <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif text-white tracking-tight leading-[1.12]">
              Effortless Shine,{' '}
              <span className="italic font-normal text-amber-300">
                Made for Everyday Wear
              </span>
            </h2>

            <p className="text-emerald-100/80 text-sm sm:text-base leading-relaxed">
              Crafted with 18k PVD gold plating over stainless steel. Water-resistant, skin-safe, and built to hold its rich finish wear after wear.
            </p>

            <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2.5 pt-1">
              <button
                onClick={() =>
                  handleBuyNow({
                    name: activeHeroRing.name,
                    price: activeHeroRing.price,
                    originalPrice: activeHeroRing.originalPrice,
                  })
                }
                className="col-span-2 sm:col-span-auto bg-amber-400 hover:bg-amber-300 text-[#081a12] font-bold px-6 py-3 rounded-xl transition text-xs sm:text-sm font-mono shadow-lg shadow-amber-500/15"
              >
                Order Now — ₹{activeHeroRing.price}
              </button>
              <button
                type="button"
                onClick={() => toggleWishlist(activeHeroRing.id)}
                className={`px-3.5 py-3 rounded-xl transition text-xs sm:text-sm font-mono border backdrop-blur-sm ${
                  wishlistIds.includes(activeHeroRing.id)
                    ? 'bg-amber-400/20 text-amber-300 border-amber-300/60'
                    : 'bg-emerald-950/70 hover:bg-emerald-900/80 text-emerald-100 border-emerald-700/50'
                }`}
              >
                {wishlistIds.includes(activeHeroRing.id) ? '♥ Saved' : '♡ Wishlist'}
              </button>
              <button
                onClick={() => openItemGallery(activeHeroRing, 0)}
                className="bg-emerald-950/70 hover:bg-emerald-900/80 text-emerald-100 border border-emerald-700/50 px-4 py-3 rounded-xl transition text-xs sm:text-sm font-mono backdrop-blur-sm"
              >
                Angles ({activeHeroRing.angles.length})
              </button>
            </div>

            <div className="pt-2.5 border-t border-emerald-800/40 flex items-center justify-between text-xs font-mono text-emerald-200/80">
              <span>
                <strong className="text-lg sm:text-xl font-serif text-amber-300">
                  ₹{activeHeroRing.price}
                </strong>{' '}
                <span className="line-through text-emerald-400/50">₹{activeHeroRing.originalPrice}</span>
              </span>
              <span>Free delivery on campus</span>
            </div>
          </div>

          <div className="lg:col-span-7">
            <div
              className="relative rounded-t-[96px] sm:rounded-t-[180px] rounded-b-3xl p-4 sm:p-7 border border-emerald-600/35 shadow-[0_24px_60px_rgba(3,12,8,0.55)] overflow-hidden"
              style={{
                background:
                  'linear-gradient(160deg, rgba(25, 74, 53, 0.72) 0%, rgba(14, 46, 32, 0.82) 52%, rgba(9, 30, 21, 0.92) 100%)',
              }}
            >
              <svg
                viewBox="0 0 240 240"
                aria-hidden="true"
                className="w-32 h-32 sm:w-40 sm:h-40 text-emerald-300/15 absolute -top-4 -right-4 pointer-events-none"
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
                className="relative h-64 sm:h-80 md:h-[420px] rounded-2xl bg-[#071811]/65 backdrop-blur-md border border-emerald-600/30 flex flex-col items-center justify-center p-4 sm:p-6 cursor-grab active:cursor-grabbing select-none overflow-hidden touch-pan-y"
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
              >
                <motion.div
                  animate={{ x: [-12, 12, -12], scale: [1, 1.04, 1] }}
                  transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                  className="w-48 sm:w-64 h-20 sm:h-24 rounded-full bg-gradient-to-r from-emerald-500/20 via-amber-300/20 to-emerald-400/20 blur-xl absolute bottom-6 sm:bottom-8 pointer-events-none"
                />

                <motion.div
                  animate={
                    gentleFloat
                      ? { y: [-6, 6, -6], rotate: tiltDeg }
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
                    alt={`${activeHeroRing.name} — drag to tilt or tap for angles`}
                    className="max-h-44 sm:max-h-60 md:max-h-72 w-auto object-contain rounded-xl pointer-events-none drop-shadow-[0_18px_28px_rgba(0,0,0,0.55)]"
                  />
                  <span className="mt-2.5 text-[10px] sm:text-[11px] font-mono text-emerald-200/80 bg-[#0d281c]/85 border border-emerald-700/45 px-3 py-1 rounded-full text-center">
                    Drag to tilt • Tap for angles ({Math.round(tiltDeg)}°)
                  </span>
                </motion.div>
              </div>

              <div className="mt-3.5 sm:mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setGentleFloat((prev) => !prev);
                      setTiltDeg(0);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono transition ${
                      gentleFloat
                        ? 'bg-amber-400 text-[#081a12] font-bold'
                        : 'bg-[#071811]/80 text-emerald-200 border border-emerald-700/50'
                    }`}
                  >
                    {gentleFloat ? 'Drift: On' : 'Drift: Paused'}
                  </button>
                  <button
                    type="button"
                    onClick={() => openItemGallery(activeHeroRing, 0)}
                    className="px-3 py-1.5 rounded-lg text-xs font-mono bg-[#071811]/80 hover:bg-emerald-950 text-amber-300 border border-emerald-700/50 transition"
                  >
                    {activeHeroRing.angles.length} Angles
                  </button>
                </div>

                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {ringCatalog.slice(0, 6).map((ring) => {
                    const isSelected = ring.id === activeHeroRing.id;
                    return (
                      <button
                        key={ring.id}
                        type="button"
                        onClick={() => {
                          setHeroRingId(ring.id);
                          setTiltDeg(0);
                        }}
                        title={ring.name}
                        className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl overflow-hidden border transition shrink-0 ${
                          isSelected
                            ? 'border-amber-300 ring-2 ring-amber-300/40 scale-105'
                            : 'border-emerald-700/45 opacity-75 hover:opacity-100'
                        }`}
                      >
                        <img
                          src={getImageUrl(ring.cardImage)}
                          alt={ring.name}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Shop By Category + Interactive Product Grid */}
      <section id="collections" className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10 border-t border-emerald-800/35">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-3.5 sm:gap-4 mb-6 sm:mb-8">
          <div>
            <span className="text-[11px] uppercase tracking-widest text-amber-300 font-mono">
              Shop By Category
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif text-white mt-1">
              ZUVI Collections
            </h2>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 -mx-4 px-4 sm:mx-0 sm:px-0">
            {categories.map((category) => {
              const active = selectedCategory === category;
              return (
                <button
                  key={category}
                  type="button"
                  onClick={() => setSelectedCategory(category)}
                  className={`px-3.5 sm:px-4 py-2 rounded-full text-[11px] sm:text-xs font-mono uppercase tracking-wider transition shrink-0 ${
                    active
                      ? 'bg-amber-400 text-[#081a12] font-bold shadow-sm'
                      : 'bg-emerald-950/75 text-emerald-100/80 border border-emerald-800/50 hover:border-amber-300/40 hover:text-white'
                  }`}
                >
                  {category}
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {visibleCategoryItems.map((item) => {
            const isWishlisted = wishlistIds.includes(item.id);
            return (
              <div
                key={item.id}
                className="bg-[#0e2a1e]/75 backdrop-blur-md border border-emerald-700/40 rounded-2xl p-4 sm:p-5 flex flex-col justify-between gap-4 hover:border-amber-300/45 transition group"
              >
                <div className="space-y-3.5">
                  <div
                    onClick={() => openItemGallery(item, 0)}
                    className="relative h-48 sm:h-56 rounded-xl bg-[#071811]/85 border border-emerald-800/50 overflow-hidden flex items-center justify-center cursor-pointer"
                  >
                    <img
                      src={getImageUrl(item.cardImage)}
                      alt={item.name}
                      className="max-h-full max-w-full object-contain group-hover:scale-105 transition duration-300 p-2"
                    />
                    <span className="absolute top-2.5 left-2.5 text-[10px] font-mono uppercase tracking-wider bg-[#0a1f16]/90 text-amber-300 border border-emerald-700/50 px-2 py-0.5 rounded-full">
                      {item.badge}
                    </span>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleWishlist(item.id);
                      }}
                      aria-label={isWishlisted ? `Remove ${item.name} from wishlist` : `Add ${item.name} to wishlist`}
                      className={`absolute top-2.5 right-2.5 h-8 px-2.5 rounded-full text-xs font-mono border transition flex items-center gap-1 ${
                        isWishlisted
                          ? 'bg-amber-400 text-[#081a12] border-amber-300 font-bold'
                          : 'bg-[#0a1f16]/90 text-emerald-100 border-emerald-700/50 hover:border-amber-300 hover:text-amber-300'
                      }`}
                    >
                      <span>{isWishlisted ? '♥' : '♡'}</span>
                      <span>{isWishlisted ? 'Saved' : 'Save'}</span>
                    </button>

                    {item.angles.length > 1 && (
                      <span className="absolute bottom-2.5 right-2.5 text-[10px] font-mono bg-emerald-950/90 text-emerald-200 border border-emerald-700/50 px-2.5 py-0.5 rounded-full">
                        {item.angles.length} angles
                      </span>
                    )}
                  </div>

                  <div>
                    <h3 className="text-lg sm:text-xl font-serif text-white font-bold">{item.name}</h3>
                    <p className="text-xs text-emerald-100/75 mt-1 leading-relaxed">{item.tagline}</p>
                  </div>
                </div>

                <div className="pt-3 border-t border-emerald-800/40 flex items-center justify-between gap-2">
                  <div>
                    <span className="text-lg font-serif text-amber-300 font-bold">₹{item.price}</span>{' '}
                    <span className="text-xs font-mono line-through text-emerald-400/50">
                      ₹{item.originalPrice}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => openItemGallery(item, 0)}
                      className="px-3 py-2 rounded-lg text-xs font-mono bg-[#071811]/80 hover:bg-emerald-950 text-emerald-200 border border-emerald-800/60 transition"
                    >
                      Angles
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        handleBuyNow({
                          name: item.name,
                          price: item.price,
                          originalPrice: item.originalPrice,
                        })
                      }
                      className="px-3.5 sm:px-4 py-2 rounded-lg text-xs font-mono font-bold bg-amber-400 hover:bg-amber-300 text-[#081a12] transition"
                    >
                      Buy Now
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Why ZUVI Lasts */}
      <section id="proof" className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-12 border-t border-emerald-800/35">
        <div className="mb-6 sm:mb-8">
          <span className="text-[11px] uppercase tracking-widest text-amber-300 font-mono">
            Material Craft
          </span>
          <h2 className="text-2xl sm:text-3xl font-serif text-white mt-1">Why ZUVI Lasts</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          <div className="bg-[#0e2a1e]/70 backdrop-blur-md border border-emerald-700/40 rounded-2xl p-5 sm:p-6 space-y-2">
            <h3 className="text-lg sm:text-xl font-serif text-amber-300">18K PVD Gold Plating</h3>
            <p className="text-sm text-emerald-100/80 leading-relaxed">
              Vacuum-deposited 18k gold over surgical-grade stainless steel prevents everyday tarnish, sweat dulling, and green skin marks.
            </p>
          </div>
          <div className="bg-[#0e2a1e]/70 backdrop-blur-md border border-emerald-700/40 rounded-2xl p-5 sm:p-6 space-y-2">
            <h3 className="text-lg sm:text-xl font-serif text-amber-300">All-Day Comfort</h3>
            <p className="text-sm text-emerald-100/80 leading-relaxed">
              Thoughtfully proportioned bands and settings made for lectures, workdays, and evening outings without snagging.
            </p>
          </div>
          <div className="bg-[#0e2a1e]/70 backdrop-blur-md border border-emerald-700/40 rounded-2xl p-5 sm:p-6 space-y-2">
            <h3 className="text-lg sm:text-xl font-serif text-amber-300">Direct Launch Pricing</h3>
            <p className="text-sm text-emerald-100/80 leading-relaxed">
              Transparent pricing starting at ₹350 with instant UPI QR checkout and live order tracking under your account.
            </p>
          </div>
        </div>
      </section>

      {/* IMS Ghaziabad Event Showcase */}
      <section id="event" className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-12 border-t border-emerald-800/35">
        <div className="bg-[#0e2a1e]/75 backdrop-blur-md border border-emerald-700/40 rounded-3xl p-5 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-center">
          <div className="lg:col-span-6 space-y-3.5 sm:space-y-4">
            <span className="text-[11px] uppercase tracking-widest text-amber-300 font-mono">
              Campus Showcase
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif text-white">IMS Ghaziabad Event</h2>
            <p className="text-sm text-emerald-100/80 leading-relaxed">
              Over 80 anti-tarnish pieces found homes during our IMS Ghaziabad campus event. Switch between reels or expand full screen below.
            </p>

            <div className="flex flex-wrap gap-2 pt-1">
              {['video1.mp4', 'video2.mp4', 'video3.mp4'].map((vid, idx) => (
                <button
                  key={vid}
                  type="button"
                  onClick={() => setActiveVideo(vid)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-mono transition ${
                    activeVideo === vid
                      ? 'bg-amber-400 text-[#081a12] font-bold'
                      : 'bg-[#071811] text-emerald-200 border border-emerald-800/60 hover:border-amber-300/40'
                  }`}
                >
                  Reel {idx + 1}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setIsVideoModalOpen(true)}
                className="px-3.5 py-1.5 rounded-lg text-xs font-mono bg-emerald-950 text-amber-300 border border-emerald-700/50 hover:bg-emerald-900 transition"
              >
                Expand Reel
              </button>
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="rounded-2xl overflow-hidden bg-[#071811] border border-emerald-800/50 aspect-video flex items-center justify-center">
              <video
                key={activeVideo}
                src={encodeURI(`/videos/${activeVideo}`)}
                controls
                playsInline
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-emerald-800/35 bg-[#071811]/85 backdrop-blur-md py-7 mt-4">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono text-emerald-200/75 text-center sm:text-left">
          <span>ZUVI Jewelry • zuvis.in</span>
          <span>18K PVD Gold • Anti-Tarnish • UPI Direct</span>
        </div>
      </footer>

      {/* Wishlist Drawer */}
      {isWishlistOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex justify-end">
          <div className="w-full max-w-md bg-[#0e2a1e] border-l border-emerald-700/50 h-full p-5 sm:p-6 overflow-y-auto space-y-5">
            <div className="flex items-center justify-between border-b border-emerald-800/50 pb-4">
              <div>
                <span className="text-[10px] font-mono uppercase text-amber-300">
                  Saved Pieces ({wishlistedItems.length})
                </span>
                <h3 className="text-xl sm:text-2xl font-serif text-white">Your Wishlist</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsWishlistOpen(false)}
                className="text-xs font-mono px-3 py-1.5 rounded-lg bg-[#071811] text-emerald-200 border border-emerald-800/60"
              >
                Close ✕
              </button>
            </div>

            {wishlistedItems.length === 0 ? (
              <p className="text-sm text-emerald-100/75">
                No saved items yet. Tap <strong>♡ Save</strong> on any jewelry piece to keep it here.
              </p>
            ) : (
              <div className="space-y-3">
                {wishlistedItems.map((item) => (
                  <div
                    key={item.id}
                    className="bg-[#071811] border border-emerald-800/60 rounded-xl p-3.5 flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={getImageUrl(item.cardImage)}
                        alt={item.name}
                        className="w-14 h-14 rounded-lg object-cover bg-[#0e2a1e] border border-emerald-800/50 shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="font-serif text-sm text-white font-bold truncate">
                          {item.name}
                        </p>
                        <p className="text-xs font-mono text-amber-300">₹{item.price}</p>
                        <p className="text-[10px] font-mono text-emerald-300/65">{item.category}</p>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          setIsWishlistOpen(false);
                          handleBuyNow({
                            name: item.name,
                            price: item.price,
                            originalPrice: item.originalPrice,
                          });
                        }}
                        className="bg-amber-400 hover:bg-amber-300 text-[#081a12] font-bold px-3 py-1.5 rounded-lg text-[11px] font-mono transition"
                      >
                        Buy Now
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleWishlist(item.id)}
                        className="text-[11px] font-mono text-emerald-300/80 hover:text-rose-300 px-2 py-1 transition"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Multi-Angle Gallery Modal */}
      {isGalleryOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="bg-[#0e2a1e] border border-emerald-700/50 rounded-2xl max-w-2xl w-full p-4 sm:p-6 space-y-4 sm:space-y-5 shadow-2xl max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between gap-2">
              <div>
                <span className="text-[10px] font-mono uppercase text-amber-300">
                  {activeGalleryItem.angles[galleryIndex]?.label || 'Angle View'}
                </span>
                <h3 className="text-xl sm:text-2xl font-serif text-white">{activeGalleryItem.name}</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsGalleryOpen(false)}
                className="text-emerald-200 hover:text-white text-xs sm:text-sm font-mono px-3 py-1 rounded-lg bg-[#071811] border border-emerald-800/60 shrink-0"
              >
                Close ✕
              </button>
            </div>

            <div className="h-56 sm:h-80 rounded-xl bg-[#071811] border border-emerald-800/50 flex items-center justify-center p-3 sm:p-4">
              <img
                src={getImageUrl(
                  activeGalleryItem.angles[galleryIndex]?.file || activeGalleryItem.cardImage
                )}
                alt={activeGalleryItem.name}
                className="max-h-full max-w-full object-contain rounded-lg"
              />
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {activeGalleryItem.angles.map((ang, idx) => (
                  <button
                    key={`${ang.file}-${idx}`}
                    type="button"
                    onClick={() => setGalleryIndex(idx)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono transition shrink-0 ${
                      galleryIndex === idx
                        ? 'bg-amber-400 text-[#081a12] font-bold'
                        : 'bg-[#071811] text-emerald-200 border border-emerald-800/60'
                    }`}
                  >
                    {ang.label}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => toggleWishlist(activeGalleryItem.id)}
                  className="bg-[#071811] hover:bg-emerald-950 text-amber-300 border border-emerald-700/50 px-3.5 py-2.5 rounded-xl text-xs font-mono transition"
                >
                  {wishlistIds.includes(activeGalleryItem.id) ? '♥ Saved' : '♡ Wishlist'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const item = activeGalleryItem;
                    setIsGalleryOpen(false);
                    handleBuyNow({
                      name: item.name,
                      price: item.price,
                      originalPrice: item.originalPrice,
                    });
                  }}
                  className="flex-1 sm:flex-initial bg-amber-400 hover:bg-amber-300 text-[#081a12] font-bold px-5 py-2.5 rounded-xl text-xs font-mono transition"
                >
                  Buy Now — ₹{activeGalleryItem.price}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Video Lightbox Modal */}
      {isVideoModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="bg-[#0e2a1e] border border-emerald-700/50 rounded-2xl max-w-3xl w-full p-4 sm:p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-base sm:text-lg font-serif text-white">IMS Ghaziabad Event Reel</h3>
              <button
                type="button"
                onClick={() => setIsVideoModalOpen(false)}
                className="text-emerald-200 hover:text-white text-xs font-mono px-3 py-1 rounded-lg bg-[#071811]"
              >
                Close ✕
              </button>
            </div>
            <div className="aspect-video rounded-xl overflow-hidden bg-black">
              <video
                src={encodeURI(`/videos/${activeVideo}`)}
                controls
                autoPlay
                playsInline
                className="w-full h-full object-contain"
              />
            </div>
          </div>
        </div>
      )}

      {/* Checkout Modal with 2-Min UPI QR & 12-Digit UTR Verification */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-[#0e2a1e] border border-emerald-700/50 rounded-2xl max-w-md w-full p-5 sm:p-6 space-y-4 sm:space-y-5 shadow-2xl my-6">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase text-amber-300">
                  ZUVI Express Checkout
                </span>
                <h3 className="text-xl sm:text-2xl font-serif text-white">{selectedItem.name}</h3>
                <p className="text-xs font-mono text-emerald-200/80 mt-0.5">
                  ₹{selectedItem.price}{' '}
                  <span className="line-through text-emerald-400/50">
                    ₹{selectedItem.originalPrice}
                  </span>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsCheckoutOpen(false)}
                className="text-emerald-200 hover:text-white text-sm font-mono px-2.5 py-1 rounded-lg bg-[#071811]"
              >
                ✕
              </button>
            </div>

            {step === 'form' && (
              <form onSubmit={validateAndProceed} className="space-y-3.5">
                {!user && (
                  <div className="bg-[#071811]/90 border border-emerald-800/60 rounded-xl p-3 flex items-center justify-between gap-2 text-xs">
                    <span className="text-emerald-200/80">Sign in to save address &amp; track orders</span>
                    <button
                      type="button"
                      onClick={handleGoogleSignIn}
                      className="bg-amber-400 text-[#081a12] font-bold px-3 py-1.5 rounded-lg font-mono shrink-0"
                    >
                      Google Sign-In
                    </button>
                  </div>
                )}

                <div>
                  <label className="block text-[11px] font-mono uppercase text-emerald-200/80 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter your name"
                    className="w-full bg-[#071811] border border-emerald-800/60 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-300"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase text-emerald-200/80 mb-1">
                    Mobile Number (10 digits) *
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })
                    }
                    placeholder="9876543210"
                    className="w-full bg-[#071811] border border-emerald-800/60 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-300"
                  />
                  {errors.phone && (
                    <p className="text-[11px] font-mono text-rose-300 mt-1">{errors.phone}</p>
                  )}
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase text-emerald-200/80 mb-1">
                    Delivery Address *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Hostel / House No., Street, Landmark"
                    className="w-full bg-[#071811] border border-emerald-800/60 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-300"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-mono uppercase text-emerald-200/80 mb-1">
                      City *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      placeholder="Ghaziabad"
                      className="w-full bg-[#071811] border border-emerald-800/60 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-300"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-mono uppercase text-emerald-200/80 mb-1">
                      Pincode *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.pincode}
                      onChange={(e) =>
                        setFormData({ ...formData, pincode: e.target.value.replace(/\D/g, '').slice(0, 6) })
                      }
                      placeholder="201001"
                      className="w-full bg-[#071811] border border-emerald-800/60 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-300"
                    />
                    {errors.pincode && (
                      <p className="text-[11px] font-mono text-rose-300 mt-1">{errors.pincode}</p>
                    )}
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-amber-400 hover:bg-amber-300 text-[#081a12] font-bold py-3 rounded-xl text-xs font-mono uppercase tracking-wider transition mt-2"
                >
                  Proceed to UPI QR (₹{selectedItem.price})
                </button>
              </form>
            )}

            {step === 'qr' && (
              <form onSubmit={handlePaymentConfirmed} className="space-y-4">
                <div className="flex items-center justify-between bg-[#071811] border border-emerald-800/60 rounded-xl px-4 py-2.5 text-xs font-mono">
                  <span className="text-emerald-200/80">QR Session Valid For</span>
                  <span className={secondsLeft > 0 ? 'text-amber-300 font-bold' : 'text-rose-400 font-bold'}>
                    {formatTimer(secondsLeft)}
                  </span>
                </div>

                <div className="bg-white p-4 rounded-2xl flex flex-col items-center justify-center gap-2">
                  <QRCodeSVG value={upiPaymentUri} size={172} />
                  <span className="text-[11px] font-mono text-slate-700 font-semibold">
                    {UPI_ID} • ₹{selectedItem.price}
                  </span>
                </div>

                <a
                  href={upiPaymentUri}
                  className="block text-center text-xs font-mono text-amber-300 hover:underline"
                >
                  Tap here to open UPI App directly
                </a>

                <div>
                  <label className="block text-[11px] font-mono uppercase text-emerald-200/80 mb-1">
                    12-Digit UPI UTR / Reference Number *
                  </label>
                  <input
                    type="text"
                    required
                    value={utrNumber}
                    onChange={(e) =>
                      setUtrNumber(e.target.value.replace(/\D/g, '').slice(0, 12))
                    }
                    placeholder="Enter 12-digit UTR number"
                    className="w-full bg-[#071811] border border-emerald-800/60 rounded-xl px-3.5 py-2.5 text-sm font-mono tracking-widest text-white focus:outline-none focus:border-amber-300"
                  />
                  {utrError && (
                    <p className="text-[11px] font-mono text-rose-300 mt-1">{utrError}</p>
                  )}
                </div>

                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => setStep('form')}
                    className="px-4 py-3 rounded-xl text-xs font-mono bg-[#071811] border border-emerald-800/60 text-emerald-200"
                  >
                    ← Back
                  </button>
                  <button
                    type="submit"
                    disabled={isVerifying}
                    className="flex-1 bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-[#081a12] font-bold py-3 rounded-xl text-xs font-mono uppercase tracking-wider transition"
                  >
                    {isVerifying ? 'Saving Order...' : 'Submit UTR & Confirm Order'}
                  </button>
                </div>
              </form>
            )}

            {step === 'success' && (
              <div className="bg-[#071811] border border-emerald-700/50 rounded-2xl p-6 text-center space-y-3">
                <span className="text-xs font-mono uppercase text-amber-300">Order Recorded</span>
                <h4 className="text-2xl font-serif text-white">Thank You, {formData.name}!</h4>
                <p className="text-xs text-emerald-100/80 leading-relaxed font-mono">
                  Item: {selectedItem.name} (₹{selectedItem.price})
                  <br />
                  UTR: {utrNumber}
                  <br />
                  Status: Payment Verifying
                </p>
                <div className="flex items-center justify-center gap-3 pt-2">
                  {user && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsCheckoutOpen(false);
                        setIsOrdersOpen(true);
                      }}
                      className="bg-emerald-900 hover:bg-emerald-800 text-emerald-100 px-4 py-2.5 rounded-xl text-xs font-mono"
                    >
                      View My Orders
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setIsCheckoutOpen(false)}
                    className="bg-amber-400 hover:bg-amber-300 text-[#081a12] font-bold px-5 py-2.5 rounded-xl text-xs font-mono"
                  >
                    Done
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* User Orders History Drawer */}
      {isOrdersOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex justify-end">
          <div className="w-full max-w-md bg-[#0e2a1e] border-l border-emerald-700/50 h-full p-5 sm:p-6 overflow-y-auto space-y-5">
            <div className="flex items-center justify-between border-b border-emerald-800/50 pb-4">
              <div>
                <span className="text-[10px] font-mono uppercase text-amber-300">
                  {user?.email || 'Customer Account'}
                </span>
                <h3 className="text-xl sm:text-2xl font-serif text-white">My Orders</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsOrdersOpen(false)}
                className="text-xs font-mono px-3 py-1.5 rounded-lg bg-[#071811] text-emerald-200 border border-emerald-800/60"
              >
                Close ✕
              </button>
            </div>

            {loadingOrders ? (
              <p className="text-xs font-mono text-emerald-200/75">Loading your orders...</p>
            ) : userOrders.length === 0 ? (
              <p className="text-sm text-emerald-100/75">
                No orders placed yet. Click Buy Now on any piece to start UPI checkout.
              </p>
            ) : (
              <div className="space-y-3">
                {userOrders.map((ord) => (
                  <div
                    key={ord.id}
                    className="bg-[#071811] border border-emerald-800/60 rounded-xl p-4 space-y-1.5 text-xs font-mono"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-serif text-base text-white font-bold">
                        {ord.productName}
                      </span>
                      <span className="text-amber-300 font-bold">₹{ord.price}</span>
                    </div>
                    <p className="text-emerald-200/80">
                      Status: <strong className="text-amber-300">{ord.status}</strong>
                    </p>
                    <p className="text-emerald-300/75">UTR: {ord.utrNumber}</p>
                    <p className="text-emerald-200/60">
                      {ord.city} — {ord.pincode}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}