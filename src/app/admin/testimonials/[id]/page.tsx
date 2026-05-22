'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function AdminTestimonialFormPage() {
  const router = useRouter();
  const params = useParams();
  const isNew = params.id === 'new';
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: '', role: '', company: '', quote: '', imageUrl: '', accentColor: '#4F8BD2', isActive: true, order: 0, rating: 5 });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState('');

  useEffect(() => {
    if (!isNew) {
      fetch(`/api/testimonials/${params.id}`).then(r => r.json()).then((data) => {
        if (data._id) setForm({ name: data.name || '', role: data.role || '', company: data.company || '', quote: data.quote || '', imageUrl: data.imageUrl || '', accentColor: data.accentColor || '#4F8BD2', isActive: data.isActive ?? true, order: data.order || 0, rating: data.rating ?? 5 });
      });
    }
  }, [params.id, isNew]);

  useEffect(() => {
    if (!imageFile) {
      setPreviewUrl('');
      return;
    }

    const objectUrl = URL.createObjectURL(imageFile);
    setPreviewUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [imageFile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const url = isNew ? '/api/testimonials' : `/api/testimonials/${params.id}`;
    const method = isNew ? 'POST' : 'PUT';

    const payload = new FormData();
    payload.append('name', form.name);
    payload.append('role', form.role);
    payload.append('company', form.company);
    payload.append('quote', form.quote);
    payload.append('accentColor', form.accentColor);
    payload.append('isActive', String(form.isActive));
    payload.append('order', String(form.order));
    payload.append('rating', String(form.rating));
    payload.append('imageUrl', form.imageUrl || '');
    if (imageFile) payload.append('image', imageFile);

    const res = await fetch(url, { method, body: payload });

    if (res.ok) {
      toast.success(isNew ? 'Testimonial created!' : 'Testimonial updated!');
      router.push('/admin/testimonials');
    } else {
      const data = await res.json();
      toast.error(data.error || 'Something went wrong');
    }
    setLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Link href="/admin/testimonials" className="text-sm text-navy/40 hover:text-navy font-semibold mb-6 inline-block">← Back to Testimonials</Link>
        <h2 className="text-2xl font-bold text-navy mb-6">{isNew ? 'Add Testimonial' : 'Edit Testimonial'}</h2>

        <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-8 shadow-card space-y-5">
          <div className="grid grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-navy/50">Name *</label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="form-input" required />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-navy/50">Role *</label>
              <input value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className="form-input" required />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-navy/50">Company *</label>
              <input value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} className="form-input" required />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-navy/50">Upload Image</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                className="form-input file:mr-3 file:px-3 file:py-1.5 file:rounded-lg file:border-0 file:bg-navy/5 file:text-xs file:font-bold"
              />
            </div>
          </div>
          {(previewUrl || form.imageUrl) && (
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-navy/50">Image Preview</label>
              <img
                src={previewUrl || form.imageUrl}
                alt="Testimonial preview"
                className="w-28 h-28 rounded-xl object-cover border border-navy/10"
              />
            </div>
          )}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-navy/50">Quote *</label>
            <textarea value={form.quote} onChange={(e) => setForm({ ...form, quote: e.target.value })} className="form-input min-h-[100px] resize-none" required />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-navy/50">Star Rating</label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setForm({ ...form, rating: star })}
                  className="text-3xl transition-transform hover:scale-110 focus:outline-none"
                  style={{ color: star <= form.rating ? '#E8A020' : '#D1D5DB' }}
                  aria-label={`${star} star`}
                >
                  &#9733;
                </button>
              ))}
              <span className="ml-2 self-center text-sm font-bold text-navy/50">{form.rating} / 5</span>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-5">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-navy/50">Accent Color</label>
              <input type="color" value={form.accentColor} onChange={(e) => setForm({ ...form, accentColor: e.target.value })} className="form-input h-10" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-navy/50">Order</label>
              <input type="number" value={form.order} onChange={(e) => setForm({ ...form, order: parseInt(e.target.value) || 0 })} className="form-input" />
            </div>
            <div className="flex items-end gap-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} className="w-4 h-4 rounded border-navy/20" />
                <span className="text-sm font-semibold text-navy">Active</span>
              </label>
            </div>
          </div>
          <div className="flex gap-3 pt-4">
            <button type="submit" disabled={loading} className="px-8 py-3 rounded-full text-white font-bold text-sm disabled:opacity-50" style={{ backgroundColor: '#0F1F3D' }}>
              {loading ? 'Saving...' : isNew ? 'Create Testimonial' : 'Update Testimonial'}
            </button>
            <Link href="/admin/testimonials" className="px-6 py-3 rounded-full text-navy/50 font-bold text-sm border border-navy/10 hover:bg-bg transition-colors">Cancel</Link>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
