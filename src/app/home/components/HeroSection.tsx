"use client";

import React, { useEffect, useRef, useState } from "react";
import AppImage from "@/components/ui/AppImage";

export default function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const badgeRef = useRef<HTMLDivElement>(null);
  const [slides, setSlides] = useState<any[]>([]);
  const [current, setCurrent] = useState(0);
  const [isFading, setIsFading] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    fetch("/api/hero")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setSlides(data);
        }
      });
  }, []);

  useEffect(() => {
    if (slides.length <= 1) return;
    if (intervalRef.current) clearTimeout(intervalRef.current);
    intervalRef.current = setTimeout(() => {
      setIsFading(true);
      setTimeout(() => {
        setCurrent((prev) => (prev + 1) % slides.length);
        setIsFading(false);
      }, 400);
    }, 4000);
    return () => {
      if (intervalRef.current) clearTimeout(intervalRef.current);
    };
  }, [slides, current]);

  const handleContactClick = () => {
    const el = document.querySelector("#contact");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  const handleServicesClick = () => {
    const el = document.querySelector("#services");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section
      ref={sectionRef}
      className="relative w-full max-w-7xl xl:max-w-[96rem] mx-auto min-h-[88vh] rounded-5xl overflow-hidden group"
      style={{ minHeight: "88vh" }}
      aria-label="Sky Birds hero"
    >
      {/* Background image (slider) */}
      {slides.length > 0 && (
        <div className="absolute inset-0 transition-all duration-500">
          <AppImage
            src={slides[current].imageUrl}
            alt={slides[current].title}
            fill
            priority
            className={`object-cover transition-all duration-700 ${isFading ? "opacity-0 scale-105" : "opacity-100 scale-100"}`}
            sizes="100vw"
          />
        </div>
      )}

      {/* Gradient overlay — strong at bottom and left for text legibility */}
      <div className="absolute inset-0 bg-gradient-to-b from-navy/55 via-navy/30 to-navy/75" />
      <div className="absolute inset-0 bg-gradient-to-r from-navy/50 via-transparent to-transparent" />

      {/* Top badge */}
      <div className="absolute left-5 top-24 z-20 sm:left-10 sm:top-28" ref={badgeRef}>
        <div className="glass-card flex items-center gap-2 rounded-full px-3 py-2 sm:px-4">
          <span className="w-2 h-2 rounded-full bg-amber-brand pulse-amber" />
          <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-navy sm:text-xs sm:tracking-widest">
            Corporate Travel Partner
          </span>
        </div>
      </div>

      {/* Main content */}
      <div className="relative z-10 flex h-full flex-col justify-between p-6 pt-28 sm:p-8 sm:pt-32 md:p-16 md:pt-36" style={{ minHeight: "88vh" }}>
        <div className="max-w-2xl">
          {slides.length > 0 && (
            <>
              <h1 className="hero-title text-white mb-6 transition-all duration-500">
                {slides[current].title.split(/\n|<br\s*\/>/).map((line: string, idx: number) => (
                  <React.Fragment key={idx}>
                    {line}
                    <br />
                  </React.Fragment>
                ))}
                {slides[current].subtitle && (
                  <span className="block font-serif italic font-light" style={{ color: "#F0B830" }}>
                    {slides[current].subtitle}
                  </span>
                )}
              </h1>
              {slides[current].location && (
                <div className="flex items-center gap-2 mb-2 text-white text-lg font-semibold">
                  <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
                    <path stroke="currentColor" strokeWidth="2" d="M12 21c-4.418 0-8-5.373-8-10a8 8 0 1 1 16 0c0 4.627-3.582 10-8 10Z" />
                    <circle cx="12" cy="11" r="3" stroke="currentColor" strokeWidth="2" />
                  </svg>
                  {slides[current].location}
                </div>
              )}
              {slides[current].ctaText && (
                <a
                  href={slides[current].ctaLink || "#"}
                  className="inline-block bg-white/20 text-white px-6 py-3 rounded-full font-bold text-base hover:bg-white/30 transition-all mb-6"
                >
                  {slides[current].ctaText}
                </a>
              )}
              {slides[current].description && (
                <div className="text-white/80 text-base font-normal mb-4 max-w-xl">
                  {slides[current].description}
                </div>
              )}
            </>
          )}
        </div>

        {/* Bottom row */}
        <div className="mt-12 flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          {/* Scroll hint */}
          <div className="flex flex-col items-center gap-2">
            <div
              className="w-10 h-10 rounded-full border border-white/25 flex items-center justify-center text-white cursor-pointer hover:bg-white/10 transition-colors"
              onClick={handleServicesClick}
              role="button"
              tabIndex={0}
              aria-label="Scroll to services"
              onKeyDown={(e) => e.key === "Enter" && handleServicesClick()}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M8 3v10M4 9l4 4 4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <span className="text-white/40 text-[10px] font-bold uppercase tracking-widest hidden md:block">Explore</span>
          </div>

          {/* Overlapping stats card */}
          <div
            ref={cardRef}
            className="max-w-xs w-full rounded-4xl bg-white p-6 shadow-card-lg sm:p-8"
          >
            <div className="flex justify-between items-start mb-6">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-navy/40 mb-1">Trusted by</p>
                <p className="text-4xl font-bold text-navy tracking-tight">100+</p>
                <p className="text-sm font-semibold text-navy/60">Corporate Clients</p>
              </div>
              <div className="w-10 h-10 rounded-full border border-navy/10 flex items-center justify-center">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path d="M3 8h10M9 4l4 4-4 4" stroke="#0F1F3D" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </div>
            <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-navy/30">
              <div className="flex gap-3">
                <span className="text-navy/20">(Est. 2012)</span>
                <span className="text-navy">(Since)</span>
              </div>
              <span className="text-navy/40">14+ yrs</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}