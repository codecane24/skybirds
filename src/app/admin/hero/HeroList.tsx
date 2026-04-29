"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import AppImage from "@/components/ui/AppImage";

interface HeroSlide {
  _id: string;
  title: string;
  subtitle?: string;
  imageUrl: string;
  location?: string;
  ctaText?: string;
  ctaLink?: string;
  order?: number;
  isActive?: boolean;
  description?: string;
}

export default function HeroList() {
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/hero?all=1")
      .then((r) => r.json())
      .then((data) => {
        setSlides(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="py-20 text-center text-navy/30">Loading...</div>;

  return (
    <div className="space-y-4">
      {slides.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 shadow-card text-center">
          <p className="text-navy/40">No hero slides found.</p>
        </div>
      ) : (
        slides.map((slide) => (
          <div key={slide._id} className="bg-white rounded-2xl p-5 shadow-card flex items-center gap-4">
            <div className="w-40 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-bg border">
              {slide.imageUrl && (
                <img src={slide.imageUrl} alt={slide.title} className="object-cover w-full h-full" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-navy text-lg truncate">{slide.title}</span>
                {slide.subtitle && <span className="text-navy/40 text-sm">{slide.subtitle}</span>}
                {slide.location && <span className="text-navy/30 text-xs">{slide.location}</span>}
              </div>
              {slide.description && <div className="text-navy/50 text-xs mt-1 line-clamp-2">{slide.description}</div>}
              <div className="flex gap-2 mt-1">
                {slide.ctaText && <span className="text-xs bg-sky-100 text-sky-700 px-2 py-0.5 rounded">{slide.ctaText}</span>}
                {slide.ctaLink && <a href={slide.ctaLink} className="text-xs text-sky-brand underline">Link</a>}
              </div>
            </div>
            <div className="flex flex-col gap-2 items-end">
              <Link href={`/admin/hero/${slide._id}`} className="px-3 py-1.5 rounded-lg text-xs font-bold bg-sky-brand/10 text-sky-brand">Edit</Link>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
