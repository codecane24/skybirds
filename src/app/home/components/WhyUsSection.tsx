'use client';

import React, { useEffect, useRef } from 'react';
import AppImage from '@/components/ui/AppImage';
import Icon from '@/components/ui/AppIcon';

const differentiators = [
{
  icon: 'CurrencyRupeeIcon',
  title: 'Transparent Pricing',
  desc: 'Every quote is itemized. No hidden fees, no surprises at checkout. What you see is exactly what you pay.'
},
{
  icon: 'AdjustmentsHorizontalIcon',
  title: 'Fully Customized Itineraries',
  desc: "No one-size-fits-all packages. Your team's schedule, preferences, and budget — we build around you."
},
{
  icon: 'BriefcaseIcon', title: 'Corporate Account Management', desc: 'Dedicated relationship manager, consolidated invoicing, GST-compliant billing, and travel policy compliance.'
},
{
  icon: 'ShieldCheckIcon', title: 'Risk-Free Travel Planning', desc: 'Flexible cancellation, rebooking support, and travel insurance options — so disruptions don\'t derail your business.'
}];


export default function WhyUsSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const initGsap = async () => {
      const { gsap } = await import('gsap');
      const { ScrollTrigger } = await import('gsap/ScrollTrigger');
      gsap.registerPlugin(ScrollTrigger);

      gsap.fromTo(
        imageRef.current,
        { x: -50, opacity: 0 },
        {
          x: 0, opacity: 1, duration: 1.2, ease: 'power3.out',
          scrollTrigger: { trigger: imageRef.current, start: 'top 85%' }
        }
      );

      gsap.fromTo(
        statsRef.current,
        { scale: 0.8, opacity: 0 },
        {
          scale: 1, opacity: 1, duration: 1, ease: 'back.out(1.5)',
          scrollTrigger: { trigger: statsRef.current, start: 'top 85%' }
        }
      );

      const items = listRef.current?.querySelectorAll('.diff-item');
      items?.forEach((item, i) => {
        gsap.fromTo(
          item,
          { x: 40, opacity: 0 },
          {
            x: 0, opacity: 1, duration: 0.7, delay: i * 0.12, ease: 'power3.out',
            scrollTrigger: { trigger: item, start: 'top 90%' }
          }
        );
      });
    };
    initGsap();
  }, []);

  return (
    <section
      id="why-us"
      ref={sectionRef}
      className="max-w-7xl mx-auto w-full bg-white rounded-5xl shadow-card px-8 md:px-16 py-16 md:py-20">
      
      <div className="grid lg:grid-cols-2 gap-16 md:gap-20 items-center">
        {/* Left — Image with spinning border and floating card */}
        <div ref={imageRef} className="relative opacity-100">
          {/* Spinning dashed ring */}
          <div
            className="absolute animate-spin-slow rounded-full border-2 border-dashed pointer-events-none"
            style={{
              inset: '-20px',
              borderColor: 'rgba(232,160,32,0.35)'
            }} />
          

          {/* Circular image */}
          <div className="aspect-square rounded-full overflow-hidden border-8 border-white shadow-card-lg relative z-10">
            <AppImage
              src="https://img.rocket.new/generatedImages/rocket_gen_img_19c4bcb0c-1775666453379.png"
              alt="Professional corporate travel manager in suit reviewing itinerary on laptop, bright modern office, natural light, confident expression"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 90vw, 45vw" />
            
          </div>

          {/* Floating glass card */}
          <div
            ref={statsRef}
            className="absolute -bottom-8 -right-4 md:-right-10 glass-card p-6 rounded-3xl z-20 shadow-card-lg max-w-[200px] opacity-100 rounded-br-[100px] rounded-t-[100px] rounded-bl-[100px]">
            
            <p className="font-serif italic text-3xl mb-1" style={{ color: '#E8A020' }}>4.9★</p>
            <p className="text-xs font-bold text-navy leading-snug">Average client satisfaction across 500+ corporate accounts</p>
          </div>
        </div>

        {/* Right — Differentiators */}
        <div className="space-y-8">
          <div className="space-y-4">
            <span
              className="inline-block px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest text-white"
              style={{ backgroundColor: '#0F1F3D' }}>
              
              Why Sky Birds
            </span>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-navy leading-tight">
              More Than a<br />
              <span className="font-serif italic font-light" style={{ color: '#E8A020' }}>Travel Agent.</span>
            </h2>
            <p className="text-navy/55 text-base leading-relaxed font-medium">
              We act as your in-house travel desk — proactive, accountable, and always aligned with your business goals.
            </p>
          </div>

          <div ref={listRef} className="space-y-5">
            {differentiators.map((item) =>
            <div
              key={item.title}
              className="diff-item flex gap-5 items-start p-5 rounded-2xl hover:bg-bg-warm transition-colors duration-200 opacity-100">
              
                <div
                className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                style={{ backgroundColor: 'rgba(42,127,212,0.1)' }}>
                
                  <Icon name={item.icon as Parameters<typeof Icon>[0]['name']} size={20} variant="outline" style={{ color: '#2A7FD4' }} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-navy mb-1">{item.title}</h3>
                  <p className="text-sm text-navy/55 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>);

}