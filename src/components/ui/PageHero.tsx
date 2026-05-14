import React from 'react';
import AppImage from './AppImage';
import AppIcon from './AppIcon';

interface PageHeroProps {
  title: string;
  subtitle: string;
  imageSrc: string;
  imageAlt: string;
  eyebrow?: string;
}

export default function PageHero({
  title,
  subtitle,
  imageSrc,
  imageAlt,
  eyebrow = 'Sky Birds',
}: PageHeroProps) {
  return (
    <section className="relative w-full max-w-7xl mx-auto min-h-[58vh] md:min-h-[62vh] rounded-5xl overflow-hidden mb-10 isolate">
      <div className="absolute inset-0">
        <AppImage
          src={imageSrc}
          alt={imageAlt}
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
      </div>

      <div className="absolute inset-0 bg-gradient-to-br from-navy/85 via-navy/58 to-[#17376A]/62" />
      <div className="absolute inset-0 opacity-30" style={{ background: 'radial-gradient(circle at 18% 22%, rgba(232,160,32,0.35), transparent 38%), radial-gradient(circle at 78% 70%, rgba(42,127,212,0.32), transparent 40%)' }} />
      <div className="absolute inset-0 opacity-[0.12]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.35) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.35) 1px, transparent 1px)', backgroundSize: '42px 42px' }} />

      <div className="relative z-10 px-6 md:px-10 py-14 md:py-20 flex items-center min-h-[58vh] md:min-h-[62vh]">
        <div className="w-full max-w-3xl rounded-3xl border border-white/25 bg-white/[0.09] backdrop-blur-xl p-7 md:p-10 shadow-card-lg">
          <p className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-white/85 mb-5">
            <AppIcon name="SparklesIcon" size={14} className="text-amber-brand" />
            {eyebrow}
          </p>
          <h1 className="text-3xl md:text-5xl leading-tight font-bold text-white mb-4">{title}</h1>
          <p className="text-sm md:text-lg text-white/80 leading-relaxed max-w-2xl">{subtitle}</p>
        </div>
      </div>
    </section>
  );
}
