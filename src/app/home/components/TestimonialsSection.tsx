'use client';

import React, { useEffect, useRef, useState } from 'react';
import AppImage from '@/components/ui/AppImage';

interface TeamMember {
  name: string;
  designation: string;
  bio: string;
  imageUrl: string;
  accentColor: string;
}


export default function OurTeamSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [team, setTeam] = useState<TeamMember[]>([]);

  useEffect(() => {
    fetch('/api/team').then(r => r.json()).then((data) => {
      if (Array.isArray(data) && data.length > 0) {
        setTeam(data.map((t: any) => ({
          name: t.name,
          designation: t.designation,
          bio: t.bio,
          imageUrl: t.imageUrl,
          accentColor: t.accentColor || '#2A7FD4',
        })));
      }
    }).catch(() => {});
  }, []);

  useEffect(() => {
    const initGsap = async () => {
      const { gsap } = await import('gsap');
      const { ScrollTrigger } = await import('gsap/ScrollTrigger');
      gsap.registerPlugin(ScrollTrigger);

      const cards = sectionRef.current?.querySelectorAll('.team-card');
      cards?.forEach((card, i) => {
        gsap.fromTo(
          card,
          { y: 40, opacity: 0 },
          {
            y: 0, opacity: 1, duration: 0.9, delay: i * 0.15, ease: 'power3.out',
            scrollTrigger: { trigger: card, start: 'top 90%' }
          }
        );
      });
    };
    initGsap();
  }, []);

  return (
    <section
      id="our-team"
      ref={sectionRef}
      className="max-w-7xl mx-auto w-full rounded-5xl overflow-hidden shadow-card"
      style={{ backgroundColor: '#0F1F3D' }}>
      <div className="px-8 md:px-16 py-16 md:py-20">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14">
          <div className="space-y-4">
            <span
              className="inline-block px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest"
              style={{ backgroundColor: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)' }}>
              Our Team
            </span>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-white leading-tight">
              Meet the People<br />
              <span className="font-serif italic font-light" style={{ color: '#E8A020' }}>
                Behind Sky Birds
              </span>
            </h2>
          </div>
          <p className="text-sm max-w-xs uppercase tracking-wider leading-relaxed font-semibold" style={{ color: 'rgba(255,255,255,0.35)' }}>
            Dedicated, experienced, and passionate about business travel.
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {team.map((member) => (
            <div
              key={member.name}
              className="team-card rounded-4xl p-8 space-y-6 opacity-100 transition-all duration-500 hover:scale-[1.02]"
              style={{ backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
              {/* Image */}
              <div className="aspect-square rounded-2xl overflow-hidden">
                <AppImage
                  src={member.imageUrl}
                  alt={member.name}
                  width={300}
                  height={300}
                  className="w-full h-full object-cover" />
              </div>
              {/* Name & Designation */}
              <div>
                <p className="font-bold text-white text-base">{member.name}</p>
                <p className="text-xs font-medium" style={{ color: member.accentColor }}>{member.designation}</p>
              </div>
              {/* Bio */}
              <p className="text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.7)' }}>
                {member.bio}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}