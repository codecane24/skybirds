'use client';

import React, { useEffect, useRef, useState } from 'react';
import AppImage from '@/components/ui/AppImage';

interface Destination {
  city: string;
  country: string;
  tagline: string;
  accent: string;
  image: string;
  alt: string;
  tag: string;
}

const fallbackDestinations: Destination[] = [
  {
    city: 'Dubai', country: 'UAE',
    tagline: 'MICE, incentive travel, and luxury corporate retreats.',
    accent: 'text-amber-brand',
    image: 'https://images.unsplash.com/photo-1603632633851-561a1b08da15',
    alt: 'Dubai skyline', tag: 'Top Booked',
  },
  {
    city: 'Singapore', country: 'Asia-Pacific',
    tagline: 'Conference hubs, fintech corridors, and seamless transit.',
    accent: 'text-sky-brand',
    image: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd',
    alt: 'Singapore Marina Bay', tag: 'Business Hub',
  },
  {
    city: 'Mumbai', country: 'India',
    tagline: 'Financial capital — seamless domestic corporate travel.',
    accent: 'text-amber-light',
    image: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f',
    alt: 'Mumbai Marine Drive', tag: 'Domestic',
  },
  {
    city: 'London', country: 'United Kingdom',
    tagline: 'European business travel, conferences, and client meetings.',
    accent: 'text-white',
    image: 'https://images.unsplash.com/photo-1648476871040-47da9bfc67a4',
    alt: 'London skyline', tag: 'International',
  },
  {
    city: 'New York', country: 'USA',
    tagline: 'Wall Street meets Madison Avenue — premium corporate access.',
    accent: 'text-sky-brand',
    image: 'https://images.unsplash.com/photo-1485871981521-5b1fd3805eee',
    alt: 'New York City skyline', tag: 'International',
  },
  {
    city: 'Bangkok', country: 'Thailand',
    tagline: 'Southeast Asia gateway for incentive trips and MICE events.',
    accent: 'text-amber-brand',
    image: 'https://images.unsplash.com/photo-1508009603885-50cf7c579365',
    alt: 'Bangkok city view', tag: 'MICE',
  },
];

export default function DestinationsSection() {
  const [destinations, setDestinations] = useState<Destination[]>(fallbackDestinations);
  const [paused, setPaused] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch('/api/destinations')
      .then(r => r.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setDestinations(data.map((d: any) => {
            const fallback = fallbackDestinations.find(f =>
              (d.city || '').toLowerCase().startsWith(f.city.toLowerCase())
            );
            return {
              city: d.city,
              country: d.country,
              tagline: d.tagline,
              accent: 'text-amber-brand',
              image: (typeof d.imageUrl === 'string' && d.imageUrl.trim())
                || fallback?.image
                || '/assets/images/no_image.png',
              alt: `${d.city} photo`,
              tag: d.tag || fallback?.tag || '',
            };
          }));
        }
      })
      .catch(() => {});
  }, []);

  const handleContactClick = () => {
    document.querySelector('#contact')?.scrollIntoView({ behavior: 'smooth' });
  };

  // Duplicate for seamless loop
  const loop = [...destinations, ...destinations];

  return (
    <section id="destinations" className="max-w-7xl mx-auto w-full py-0">

      {/* Keyframes injected once */}
      <style>{`
        @keyframes dest-scroll {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .dest-track {
          animation: dest-scroll 28s linear infinite;
          will-change: transform;
        }
        .dest-track.paused {
          animation-play-state: paused;
        }
      `}</style>

      {/* Header */}
      <div className="bg-white rounded-5xl shadow-card px-8 md:px-16 pt-16 pb-10 mb-5">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-4">
            <span
              className="inline-block px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest text-white"
              style={{ backgroundColor: '#0F1F3D' }}>
              Popular Routes
            </span>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-navy leading-tight">
              Where Business<br />
              <span className="font-serif italic font-light" style={{ color: '#E8A020' }}>Takes You.</span>
            </h2>
          </div>
          <p className="text-sm text-navy/50 max-w-xs uppercase tracking-wider leading-relaxed font-semibold">
            Our most-booked corporate corridors — each with dedicated support and pre-negotiated rates.
          </p>
        </div>
      </div>

      {/* Infinite marquee */}
      <div
        className="overflow-hidden rounded-4xl"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        <div
          ref={trackRef}
          className={`dest-track flex gap-5${paused ? ' paused' : ''}`}
          style={{ width: 'max-content' }}
        >
          {loop.map((dest, idx) => (
            <div
              key={idx}
              className="relative overflow-hidden rounded-4xl shadow-card group cursor-pointer flex-shrink-0"
              style={{ width: 280, height: 380 }}
              onClick={handleContactClick}
              role="button"
              tabIndex={idx < destinations.length ? 0 : -1}
              aria-label={`Book ${dest.city} corporate travel`}
              onKeyDown={(e) => e.key === 'Enter' && handleContactClick()}
            >
              <AppImage
                src={dest.image}
                alt={dest.alt}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                sizes="280px"
              />

              {/* Scrim */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent
                              transition-opacity duration-300 group-hover:opacity-90" />

              {/* Tag */}
              <div className="absolute top-4 right-4 backdrop-blur-md bg-black/30 px-3 py-1 rounded-full border border-white/10">
                <span className="text-white text-[9px] font-bold uppercase tracking-widest">{dest.tag}</span>
              </div>

              {/* Content */}
              <div className="absolute bottom-0 left-0 right-0 p-6 translate-y-1 group-hover:translate-y-0 transition-transform duration-300">
                <p className={`font-serif italic text-2xl mb-0.5 ${dest.accent}`}>{dest.city}</p>
                <h3 className="text-lg font-bold text-white">{dest.country}</h3>
                <p className="text-xs text-white/70 leading-relaxed mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 max-h-0 group-hover:max-h-20 overflow-hidden">
                  {dest.tagline}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

    </section>
  );
}