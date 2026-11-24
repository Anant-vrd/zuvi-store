'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { onAuthStateChanged, signInWithPopup, signOut, User } from 'firebase/auth';
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
} from 'firebase/firestore';
import { auth, googleProvider, db } from '@/lib/firebase';

const ADMIN_EMAILS = ['priyanshusingh7839@gmail.com'];
const CATEGORIES = ['RINGS', 'EARINGS', 'JUMKA', 'BRACELTS', 'PENDANTS'] as const;

type ProductCategory = (typeof CATEGORIES)[number];

export interface ManagedProduct {
  id: string;
  name: string;
  category: ProductCategory;
  price: number;
  originalPrice: number;
  badge: string;
  tagline: string;
  imageUrl: string;
  available: boolean;
  createdAt?: { seconds?: number };
}

function compressFileToDataUrl(file: File, maxDim = 640, quality = 0.72): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read image file.'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('Failed to load selected image.'));
      img.onload = () => {
        let { width, height } = img;
        if (width > maxDim || height > maxDim) {
          if (width >= height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Could not initialize image canvas.'));
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.src = String(reader.result || '');
    };
    reader.readAsDataURL(file);
  });
}

export default function AdminProductsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [products, setProducts] = useState<ManagedProduct[]>([]);
  const [loading, setLoading] = useState(false);

  // Add / Edit form state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [category, setCategory] = useState<ProductCategory>('RINGS');
  const [price, setPrice] = useState('350');
  const [originalPrice, setOriginalPrice] = useState('999');
  const [badge, setBadge] = useState('18K PVD GOLD');
  const [tagline, setTagline] = useState(
    'Anti-tarnish 18k PVD gold finish over stainless steel for everyday wear.'
  );
  const [available, setAvailable] = useState(true);
  const [imageUrl, setImageUrl] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const isAuthorizedAdmin =
    Boolean(user?.email) && ADMIN_EMAILS.includes((user!.email || '').toLowerCase());

  const loadProducts = useCallback(async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const snap = await getDocs(collection(db, 'products'));
      const list: ManagedProduct[] = snap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<ManagedProduct, 'id'>),
      }));
      list.sort((a, b) => (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0));
      setProducts(list);
    } catch (err) {
      console.error('Failed to load products:', err);
      setErrorMsg('Could not load products from Firestore.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setAuthReady(true);
      if (currentUser?.email && ADMIN_EMAILS.includes(currentUser.email.toLowerCase())) {
        await loadProducts();
      } else {
        setProducts([]);
      }
    });
    return () => unsub();
  }, [loadProducts]);

  const resetForm = () => {
    setEditingId(null);
    setName('');
    setCategory('RINGS');
    setPrice('350');
    setOriginalPrice('999');
    setBadge('18K PVD GOLD');
    setTagline('Anti-tarnish 18k PVD gold finish over stainless steel for everyday wear.');
    setAvailable(true);
    setImageUrl('');
    setSelectedFiles([]);
    setPreviewUrls([]);
  };

  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setErrorMsg('');
    setSelectedFiles(files);
    try {
      const compressedList = await Promise.all(
        files.slice(0, 3).map((file) => compressFileToDataUrl(file))
      );
      setPreviewUrls(compressedList);
      if (compressedList[0]) {
        setImageUrl(compressedList[0]);
      }
    } catch (err) {
      console.error('Photo preview error:', err);
      setErrorMsg('Could not process selected photo.');
    }
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthorizedAdmin) return;

    setSaving(true);
    setErrorMsg('');
    setStatusMsg('');

    try {
      let finalImageUrl = imageUrl.trim();
      if (selectedFiles.length > 0 && !finalImageUrl) {
        finalImageUrl = await compressFileToDataUrl(selectedFiles[0]);
      }

      if (!finalImageUrl) {
        setErrorMsg('Please pick a photo from your device or enter an image path/URL.');
        setSaving(false);
        return;
      }

      if (finalImageUrl.length > 750_000) {
        setErrorMsg('Selected image is too large for Firestore. Please choose a smaller photo.');
        setSaving(false);
        return;
      }

      const payload = {
        name: name.trim(),
        category,
        price: Number(price) || 350,
        originalPrice: Number(originalPrice) || 999,
        badge: badge.trim() || '18K PVD GOLD',
        tagline: tagline.trim(),
        imageUrl: finalImageUrl,
        available,
      };

      if (editingId) {
        await updateDoc(doc(db, 'products', editingId), payload);
        setStatusMsg(`Updated "${payload.name}".`);
      } else {
        await addDoc(collection(db, 'products'), {
          ...payload,
          createdAt: serverTimestamp(),
        });
        setStatusMsg(`Added "${payload.name}" to ZUVI catalog.`);
      }

      resetForm();
      await loadProducts();
    } catch (err) {
      console.error('Error saving product:', err);
      setErrorMsg('Failed to save product. Check Firestore rules for /products.');
    } finally {
      setSaving(false);
    }
  };

  const handleEditClick = (item: ManagedProduct) => {
    setEditingId(item.id);
    setName(item.name);
    setCategory(item.category);
    setPrice(String(item.price));
    setOriginalPrice(String(item.originalPrice));
    setBadge(item.badge);
    setTagline(item.tagline);
    setAvailable(item.available);
    setImageUrl(item.imageUrl);
    setSelectedFiles([]);
    setPreviewUrls([item.imageUrl]);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleToggleAvailability = async (item: ManagedProduct) => {
    const nextState = !item.available;
    setErrorMsg('');
    try {
      await updateDoc(doc(db, 'products', item.id), { available: nextState });
      setProducts((prev) =>
        prev.map((p) => (p.id === item.id ? { ...p, available: nextState } : p))
      );
      setStatusMsg(
        `"${item.name}" is now marked ${nextState ? 'Available' : 'Out of Stock'}.`
      );
    } catch (err) {
      console.error('Availability toggle failed:', err);
      setErrorMsg('Could not update availability.');
    }
  };

  const handleDeleteProduct = async (item: ManagedProduct) => {
    setErrorMsg('');
    try {
      await deleteDoc(doc(db, 'products', item.id));
      setProducts((prev) => prev.filter((p) => p.id !== item.id));
      setStatusMsg(`Removed "${item.name}".`);
    } catch (err) {
      console.error('Delete failed:', err);
      setErrorMsg('Could not delete product.');
    }
  };

  return (
    <div className="min-h-screen bg-[#0a1f16] text-[#ecfdf5] font-sans">
      <header className="border-b border-emerald-800/40 bg-[#071811]/90 backdrop-blur-md sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-2xl font-serif tracking-widest text-amber-300 font-bold">
              ZUVI
            </Link>
            <span className="text-[11px] font-mono uppercase tracking-wider px-2.5 py-0.5 rounded-full border border-amber-400/40 text-amber-300 bg-amber-400/10">
              Product &amp; Stock Studio
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono">
            <Link href="/admin" className="text-emerald-200/80 hover:text-amber-300 transition">
              Orders Desk
            </Link>
            <Link href="/" className="text-emerald-200/80 hover:text-amber-300 transition">
              ← Storefront
            </Link>
            {user && (
              <button
                type="button"
                onClick={() => signOut(auth)}
                className="bg-emerald-950 hover:bg-emerald-900 border border-emerald-700/50 text-emerald-100 px-3 py-1.5 rounded-lg transition"
              >
                Sign Out
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-10 space-y-10">
        {!authReady ? (
          <p className="text-xs font-mono text-emerald-200/75">Checking session...</p>
        ) : !user ? (
          <div className="max-w-md mx-auto bg-[#0e2a1e]/85 border border-emerald-700/40 rounded-3xl p-8 text-center space-y-5 shadow-xl">
            <span className="text-[11px] font-mono uppercase text-amber-300">Admin Only</span>
            <h1 className="text-3xl font-serif text-white">ZUVI Catalog Manager</h1>
            <p className="text-sm text-emerald-100/75">
              Sign in with your admin Google account to post new jewelry photos, edit prices, and toggle availability.
            </p>
            <button
              type="button"
              onClick={() => signInWithPopup(auth, googleProvider)}
              className="w-full bg-amber-400 hover:bg-amber-300 text-[#081a12] font-bold py-3 rounded-xl text-xs font-mono uppercase tracking-wider transition"
            >
              Sign In With Google
            </button>
          </div>
        ) : !isAuthorizedAdmin ? (
          <div className="max-w-md mx-auto bg-[#0e2a1e]/85 border border-rose-500/40 rounded-3xl p-8 text-center space-y-4">
            <h1 className="text-2xl font-serif text-rose-300">Access Denied</h1>
            <p className="text-sm text-emerald-100/80">
              Account <span className="font-mono text-white">{user.email}</span> is not authorized.
            </p>
            <button
              type="button"
              onClick={() => signOut(auth)}
              className="bg-emerald-950 hover:bg-emerald-900 border border-emerald-700/50 text-emerald-100 px-4 py-2 rounded-xl text-xs font-mono"
            >
              Switch Account
            </button>
          </div>
        ) : (
          <>
            <form
              onSubmit={handleSaveProduct}
              className="bg-[#0e2a1e]/80 border border-emerald-700/40 rounded-3xl p-6 md:p-8 shadow-xl space-y-5"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <span className="text-[11px] font-mono uppercase text-amber-300">
                    {editingId ? 'Edit Existing Item' : 'Post New Jewelry'}
                  </span>
                  <h1 className="text-2xl md:text-3xl font-serif text-white">
                    {editingId ? 'Update Product' : 'Add Product & Choose Photos'}
                  </h1>
                </div>
                {editingId && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="text-xs font-mono text-emerald-200 hover:text-amber-300 underline"
                  >
                    Cancel Edit
                  </button>
                )}
              </div>

              {statusMsg && (
                <div className="bg-emerald-950/90 border border-emerald-500/50 text-emerald-200 text-xs font-mono px-4 py-3 rounded-xl">
                  {statusMsg}
                </div>
              )}
              {errorMsg && (
                <div className="bg-rose-950/70 border border-rose-500/50 text-rose-200 text-xs font-mono px-4 py-3 rounded-xl">
                  {errorMsg}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-mono uppercase text-emerald-200/80 mb-1">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Royal Emerald Signet Ring"
                    className="w-full bg-[#071811] border border-emerald-800/60 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-300"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase text-emerald-200/80 mb-1">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as ProductCategory)}
                    className="w-full bg-[#071811] border border-emerald-800/60 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-300"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase text-emerald-200/80 mb-1">
                    Badge Tag
                  </label>
                  <input
                    type="text"
                    value={badge}
                    onChange={(e) => setBadge(e.target.value)}
                    placeholder="18K PVD GOLD"
                    className="w-full bg-[#071811] border border-emerald-800/60 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-300"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
                <div>
                  <label className="block text-xs font-mono uppercase text-emerald-200/80 mb-1">
                    Price (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full bg-[#071811] border border-emerald-800/60 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-300"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase text-emerald-200/80 mb-1">
                    Original / MRP (₹)
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={originalPrice}
                    onChange={(e) => setOriginalPrice(e.target.value)}
                    className="w-full bg-[#071811] border border-emerald-800/60 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-300"
                  />
                </div>

                <div className="pt-4 sm:pt-5">
                  <label className="inline-flex items-center gap-3 cursor-pointer bg-[#071811] border border-emerald-800/60 px-4 py-2.5 rounded-xl w-full">
                    <input
                      type="checkbox"
                      checked={available}
                      onChange={(e) => setAvailable(e.target.checked)}
                      className="accent-amber-400 w-4 h-4"
                    />
                    <span className="text-xs font-mono uppercase text-emerald-100">
                      {available ? 'Available in Stock' : 'Out of Stock'}
                    </span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-emerald-200/80 mb-1">
                  Description / Caption
                </label>
                <textarea
                  rows={2}
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  className="w-full bg-[#071811] border border-emerald-800/60 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-300 resize-none"
                />
              </div>

              <div className="space-y-3">
                <label className="block text-xs font-mono uppercase text-emerald-200/80">
                  Pick Photo From Device (or paste `/images/...` path)
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <label className="flex flex-col items-center justify-center border-2 border-dashed border-emerald-700/60 hover:border-amber-300/70 bg-[#071811]/80 rounded-2xl p-5 cursor-pointer transition text-center">
                    <span className="text-xs font-mono text-amber-300 font-bold">
                      + Choose Photo From Gallery / Files
                    </span>
                    <span className="text-[11px] text-emerald-200/65 mt-1">
                      Auto-compressed for Firestore (no Storage billing required)
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handlePhotoSelect}
                      className="hidden"
                    />
                  </label>

                  <div>
                    <input
                      type="text"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      placeholder="/images/Gold Ring on Forest Green Velvet-3.png"
                      className="w-full bg-[#071811] border border-emerald-800/60 rounded-xl px-4 py-3 text-xs font-mono text-white focus:outline-none focus:border-amber-300"
                    />
                    <p className="text-[11px] text-emerald-300/60 mt-1.5 font-mono">
                      Auto-populated when you select a photo on the left.
                    </p>
                  </div>
                </div>

                {previewUrls.length > 0 && (
                  <div className="flex flex-wrap gap-3 pt-1">
                    {previewUrls.map((src, i) => (
                      <img
                        key={`${src.slice(0, 32)}-${i}`}
                        src={src}
                        alt="Selected preview"
                        className="w-20 h-20 object-cover rounded-xl border border-amber-300/50 bg-[#071811]"
                      />
                    ))}
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={saving}
                className="bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-[#081a12] font-bold px-6 py-3 rounded-xl text-xs font-mono uppercase tracking-wider transition"
              >
                {saving
                  ? 'Saving Product...'
                  : editingId
                  ? 'Save Product Changes'
                  : 'Publish Product'}
              </button>
            </form>

            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-serif text-white">
                  Added Products ({products.length})
                </h2>
                <button
                  type="button"
                  onClick={loadProducts}
                  className="text-xs font-mono text-amber-300 hover:underline"
                >
                  Refresh List
                </button>
              </div>

              {loading ? (
                <p className="text-xs font-mono text-emerald-200/75 py-6">Loading products...</p>
              ) : products.length === 0 ? (
                <div className="bg-[#0e2a1e]/60 border border-emerald-800/50 rounded-2xl p-8 text-center text-sm text-emerald-100/75">
                  No custom products added yet. Use the form above to post your first item.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {products.map((item) => (
                    <div
                      key={item.id}
                      className="bg-[#0e2a1e]/80 border border-emerald-700/40 rounded-2xl p-4 flex flex-col justify-between gap-4"
                    >
                      <div className="space-y-3">
                        <div className="h-44 rounded-xl bg-[#071811] border border-emerald-800/50 overflow-hidden flex items-center justify-center p-2 relative">
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            className="max-h-full max-w-full object-contain rounded-lg"
                          />
                          <span
                            className={`absolute top-2.5 right-2.5 text-[10px] font-mono px-2.5 py-0.5 rounded-full font-bold ${
                              item.available
                                ? 'bg-emerald-500/20 text-emerald-200 border border-emerald-400/40'
                                : 'bg-rose-500/20 text-rose-200 border border-rose-400/40'
                            }`}
                          >
                            {item.available ? 'AVAILABLE' : 'OUT OF STOCK'}
                          </span>
                        </div>

                        <div>
                          <span className="text-[10px] font-mono text-emerald-300/75 uppercase">
                            {item.category} • {item.badge}
                          </span>
                          <h3 className="text-lg font-serif text-white font-bold">{item.name}</h3>
                          <p className="text-xs text-emerald-100/75 line-clamp-2 mt-0.5">
                            {item.tagline}
                          </p>
                          <p className="text-sm font-mono text-amber-300 font-bold mt-2">
                            ₹{item.price}{' '}
                            <span className="text-xs line-through text-emerald-400/50">
                              ₹{item.originalPrice}
                            </span>
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-emerald-800/40 text-xs font-mono">
                        <button
                          type="button"
                          onClick={() => handleToggleAvailability(item)}
                          className={`flex-1 py-2 px-3 rounded-xl font-bold transition ${
                            item.available
                              ? 'bg-amber-400 hover:bg-amber-300 text-[#081a12]'
                              : 'bg-emerald-950 hover:bg-emerald-900 text-amber-300 border border-amber-400/40'
                          }`}
                        >
                          {item.available ? 'Mark Out of Stock' : 'Mark Available'}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleEditClick(item)}
                          className="py-2 px-3 rounded-xl bg-[#071811] hover:bg-emerald-950 border border-emerald-800/60 text-emerald-100"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteProduct(item)}
                          className="py-2 px-3 rounded-xl bg-rose-950/60 hover:bg-rose-900/70 border border-rose-500/40 text-rose-200"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </main>
    </div>
  );
}