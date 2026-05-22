'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import AppImage from '@/components/ui/AppImage';

interface Testimonial { _id: string; name: string; role: string; company: string; quote: string; imageUrl?: string; isActive: boolean; order: number; rating?: number; }

export default function AdminTestimonialsPage() {
  const [items, setItems] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchItems = async () => {
    const res = await fetch('/api/testimonials?all=1');
    const data = await res.json();
    setItems(Array.isArray(data) ? data : []);
    setLoading(false);
  };

  useEffect(() => { fetchItems(); }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this testimonial?')) return;
    const res = await fetch(`/api/testimonials/${id}`, { method: 'DELETE' });
    if (res.ok) { toast.success('Deleted'); fetchItems(); } else { toast.error('Failed to delete'); }
  };

  const toggleActive = async (item: Testimonial) => {
    const res = await fetch(`/api/testimonials/${item._id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !item.isActive }),
    });
    if (res.ok) { fetchItems(); } else { toast.error('Update failed'); }
  };

  if (loading) return <div className="flex items-center justify-center py-20"><svg className="animate-spin h-8 w-8 text-navy/20" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/></svg></div>;

  return (
    <div className="max-w-5xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-navy">Testimonials</h2>
          <Link href="/admin/testimonials/new" className="px-5 py-2.5 rounded-full text-white text-sm font-bold" style={{ backgroundColor: '#0F1F3D' }}>+ Add New</Link>
        </div>

        {items.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 shadow-card text-center">
            <p className="text-navy/40">No testimonials yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((item) => (
              <div key={item._id} className="bg-white rounded-2xl p-5 shadow-card flex items-start gap-4">
                <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0">
                  <AppImage
                    src={item.imageUrl || '/assets/images/no_image.png'}
                    alt={`${item.name} photo`}
                    width={56}
                    height={56}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-bold text-navy text-sm">{item.name}</h3>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${item.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {item.isActive ? 'Active' : 'Inactive'}
                    </span>
                    {item.rating != null && (
                      <span className="flex gap-0.5">
                        {[1,2,3,4,5].map((s) => (
                          <span key={s} style={{ color: s <= item.rating! ? '#E8A020' : '#D1D5DB', fontSize: 13 }}>&#9733;</span>
                        ))}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-navy/40">{item.role} at {item.company}</p>
                  <p className="text-sm text-navy/60 mt-2 line-clamp-2">&ldquo;{item.quote}&rdquo;</p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button onClick={() => toggleActive(item)} className="px-3 py-1.5 rounded-lg text-xs font-bold border border-navy/10 hover:bg-bg transition-colors">{item.isActive ? 'Hide' : 'Show'}</button>
                  <Link href={`/admin/testimonials/${item._id}`} className="px-3 py-1.5 rounded-lg text-xs font-bold bg-sky-brand/10 text-sky-brand hover:bg-sky-brand/20 transition-colors">Edit</Link>
                  <button onClick={() => handleDelete(item._id)} className="px-3 py-1.5 rounded-lg text-xs font-bold bg-red-50 text-red-600 hover:bg-red-100 transition-colors">Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
