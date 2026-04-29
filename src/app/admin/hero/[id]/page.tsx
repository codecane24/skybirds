"use client";

import React, { useEffect, useState, useRef } from "react";
import { useRouter, useParams } from "next/navigation";

export default function EditHeroSlidePage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const [form, setForm] = useState({
    title: "",
    subtitle: "",
    description: "",
    imageUrl: "",
    ctaText: "",
    ctaLink: "",
    location: "",
    order: 0,
    isActive: true,
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/hero/${id}`)
      .then((r) => r.json())
      .then((data) => {
        setForm({
          title: data.title || "",
          subtitle: data.subtitle || "",
          description: data.description || "",
          imageUrl: data.imageUrl || "",
          ctaText: data.ctaText || "",
          ctaLink: data.ctaLink || "",
          location: data.location || "",
          order: data.order || 0,
          isActive: data.isActive !== false,
        });
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("_id", id);
      formData.append("title", form.title);
      formData.append("subtitle", form.subtitle);
      formData.append("description", form.description || "");
      formData.append("ctaText", form.ctaText);
      formData.append("ctaLink", form.ctaLink);
      formData.append("location", form.location);
      formData.append("order", String(form.order));
      formData.append("isActive", String(form.isActive));
      if (imageFile) {
        formData.append("image", imageFile);
      } else {
        formData.append("imageUrl", form.imageUrl);
      }
      const res = await fetch(`/api/hero/${id}`, {
        method: "PUT",
        body: formData,
      });
      if (!res.ok) throw new Error("Failed to update hero slide");
      // Show toast before redirect
      if (typeof window !== "undefined") {
        const toast = (await import("react-hot-toast")).default;
        toast.success("Hero slide updated!");
      }
      router.push("/admin/hero");
    } catch (err: any) {
      setError(err.message || "Unknown error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="py-20 text-center text-navy/30">Loading...</div>;

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-4xl shadow-card p-10 mt-10 border border-navy/10">
      <h2 className="text-3xl font-extrabold text-navy mb-8 text-center tracking-tight">Edit Hero Slide</h2>
      <form onSubmit={handleSubmit} className="space-y-6" encType="multipart/form-data">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-navy font-semibold mb-2">Title <span className="text-red-500">*</span></label>
            <input name="title" value={form.title} onChange={handleChange} required className="input w-full" placeholder="Enter main headline" />
          </div>
          <div>
            <label className="block text-navy font-semibold mb-2">Subtitle</label>
            <input name="subtitle" value={form.subtitle} onChange={handleChange} className="input w-full" placeholder="Optional subheading" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-navy font-semibold mb-2">Image <span className="text-red-500">*</span></label>
            <input ref={fileInputRef} name="image" type="file" accept="image/*" onChange={handleFileChange} className="input w-full" />
            <p className="text-xs text-navy/40 mt-1">Recommended size: 1920x800px (JPG/PNG, &lt;1MB)</p>
            {(imageFile || form.imageUrl) && (
              <img src={imageFile ? URL.createObjectURL(imageFile) : form.imageUrl} alt="Preview" className="mt-2 rounded-xl h-32 object-cover border w-full max-w-lg" />
            )}
          </div>
          <div>
            <label className="block text-navy font-semibold mb-2">CTA Text</label>
            <input name="ctaText" value={form.ctaText} onChange={handleChange} className="input w-full" placeholder="e.g. Book Now" />
          </div>
          <div>
            <label className="block text-navy font-semibold mb-2">CTA Link</label>
            <input name="ctaLink" value={form.ctaLink} onChange={handleChange} className="input w-full" placeholder="e.g. /book" />
          </div>
          <div>
            <label className="block text-navy font-semibold mb-2">Location</label>
            <input name="location" value={form.location} onChange={handleChange} className="input w-full" placeholder="e.g. Switzerland" />
          </div>
          <div>
            <label className="block text-navy font-semibold mb-2">Order</label>
            <input name="order" type="number" value={form.order} onChange={handleChange} className="input w-full" min={0} />
          </div>
          <div className="flex items-center gap-2 mt-8 md:mt-0">
            <input name="isActive" type="checkbox" checked={form.isActive} onChange={handleChange} id="isActive" className="accent-sky-600 w-5 h-5" />
            <label htmlFor="isActive" className="text-navy font-semibold">Active</label>
          </div>
          <div className="md:col-span-2">
            <label className="block text-navy font-semibold mb-2">Description</label>
            <textarea name="description" value={form.description || ""} onChange={handleChange} className="input w-full min-h-[80px]" placeholder="Short description for this slide" />
          </div>
        </div>
        {error && <div className="text-red-500 text-sm text-center mt-2">{error}</div>}
        <button type="submit" className="w-full py-3 rounded-xl bg-navy text-white font-bold text-lg shadow hover:bg-navy/90 transition-all disabled:opacity-60 disabled:cursor-not-allowed" disabled={saving}>
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </div>
  );
}
