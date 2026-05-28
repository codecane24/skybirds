'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AppImage from '@/components/ui/AppImage';

interface TeamMember {
  _id: string;
  name: string;
  designation: string;
  bio: string;
  imageUrl: string;
  accentColor: string;
}

const contentVariants = {
  enter: (dir: number) => ({ opacity: 0, y: dir > 0 ? 28 : -28 }),
  center: { opacity: 1, y: 0 },
  exit:  (dir: number) => ({ opacity: 0, y: dir > 0 ? -28 : 28 }),
};

export default function OurTeamSection() {
  const [team, setTeam]          = useState<TeamMember[]>([]);
  const [activeIndex, setActive] = useState(0);
  const [direction, setDir]      = useState<1 | -1>(1);
  const [hovered, setHovered]    = useState(false);
  const autoRef                  = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    fetch('/api/team')
      .then(r => r.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setTeam(data.map((t: any) => ({
            _id: t._id,
            name: t.name,
            designation: t.designation,
            bio: t.bio,
            imageUrl: t.imageUrl,
            accentColor: t.accentColor || '#2A7FD4',
          })));
        }
      })
      .catch(() => {});
  }, []);

  const goNext = useCallback(() => {
    setDir(1);
    setActive(prev => (prev + 1) % team.length);
  }, [team.length]);

  const goPrev = useCallback(() => {
    setDir(-1);
    setActive(prev => (prev - 1 + team.length) % team.length);
  }, [team.length]);

  useEffect(() => {
    if (team.length <= 1 || hovered) return;
    if (autoRef.current) clearTimeout(autoRef.current);
    autoRef.current = setTimeout(goNext, 5000);
    return () => { if (autoRef.current) clearTimeout(autoRef.current); };
  }, [activeIndex, team.length, hovered, goNext]);

  if (team.length === 0) return null;

  const slots = ([-1, 0, 1] as const).map(offset => {
    const idx = (activeIndex + offset + team.length) % team.length;
    return { member: team[idx], idx, isActive: offset === 0 };
  });

  return (
    <section
      id="our-team"
      className="max-w-7xl xl:max-w-[96rem] mx-auto w-full rounded-5xl overflow-hidden shadow-card"
      style={{ backgroundColor: '#0F1F3D' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="px-8 md:px-16 py-16 md:py-20">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14">
          <div className="space-y-4">
            <span
              className="inline-block px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest"
              style={{ backgroundColor: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)' }}>
              Our Team
            </span>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-white leading-tight">
              Meet the People<br />
              <span className="font-serif italic font-light" style={{ color: '#E8A020' }}>Behind Sky Birds</span>
            </h2>
          </div>
          <p className="text-sm max-w-xs uppercase tracking-wider leading-relaxed font-semibold"
            style={{ color: 'rgba(255,255,255,0.35)' }}>
            Dedicated, experienced, and passionate about business travel.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
          {slots.map(({ member, idx, isActive }, slotPos) => (
            <div
              key={`slot-${slotPos}`}
              className={`${isActive ? 'flex' : 'hidden md:flex'} rounded-4xl p-6 md:p-8 flex-col gap-6 transition-all duration-500`}
              style={{
                backgroundColor: 'rgba(255,255,255,0.05)',
                border: `1px solid ${isActive ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.07)'}`,
                opacity: isActive ? 1 : 0.48,
                transform: isActive ? 'scale(1)' : 'scale(0.93)',
                boxShadow: isActive ? '0 0 40px rgba(232,160,32,0.08)' : 'none',
              }}
            >
              <AnimatePresence mode="popLayout" custom={direction}>
                <motion.div
                  key={`img-${idx}`}
                  custom={direction}
                  variants={contentVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.42, ease: [0.4, 0, 0.2, 1] }}
                  className="aspect-square rounded-2xl overflow-hidden transition-all duration-500"
                  style={{ filter: isActive ? 'none' : 'grayscale(100%)' }}
                >
                  <AppImage
                    src={member.imageUrl || '/assets/images/no_image.png'}
                    alt={member.name}
                    width={300}
                    height={300}
                    className="w-full h-full object-cover"
                  />
                </motion.div>
              </AnimatePresence>

              <AnimatePresence mode="popLayout" custom={direction}>
                <motion.div
                  key={`meta-${idx}`}
                  custom={direction}
                  variants={contentVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.42, ease: [0.4, 0, 0.2, 1], delay: 0.05 }}
                >
                  <p className="font-bold text-white text-base">{member.name}</p>
                  <p className="text-xs font-medium mt-0.5" style={{ color: member.accentColor }}>{member.designation}</p>
                </motion.div>
              </AnimatePresence>

              <AnimatePresence mode="popLayout" custom={direction}>
                <motion.p
                  key={`bio-${idx}`}
                  custom={direction}
                  variants={contentVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.42, ease: [0.4, 0, 0.2, 1], delay: 0.1 }}
                  className="text-xs leading-relaxed flex-1"
                  style={{ color: 'rgba(255,255,255,0.65)' }}
                >
                  {member.bio}
                </motion.p>
              </AnimatePresence>
            </div>
          ))}
        </div>

        {team.length > 1 && (
          <div className="flex items-center justify-center gap-5 mt-10">
            <button
              onClick={goPrev}
              aria-label="Previous member"
              className="w-10 h-10 rounded-full flex items-center justify-center text-white text-lg transition-all duration-200 hover:scale-110 active:scale-95"
              style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
            >&#8592;</button>
            <div className="flex gap-2 items-center">
              {team.map((_, i) => (
                <button
                  key={i}
                  aria-label={`Member ${i + 1}`}
                  onClick={() => { setDir(i > activeIndex ? 1 : -1); setActive(i); }}
                  className="rounded-full transition-all duration-300"
                  style={{
                    width:  i === activeIndex ? 24 : 8,
                    height: 8,
                    backgroundColor: i === activeIndex ? '#E8A020' : 'rgba(255,255,255,0.25)',
                  }}
                />
              ))}
            </div>
            <button
              onClick={goNext}
              aria-label="Next member"
              className="w-10 h-10 rounded-full flex items-center justify-center text-white text-lg transition-all duration-200 hover:scale-110 active:scale-95"
              style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
            >&#8594;</button>
          </div>
        )}
      </div>
    </section>
  );
}