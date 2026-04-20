'use client';

import React, { useEffect, useRef } from 'react';
import Icon from '@/components/ui/AppIcon';

interface ServiceCard {
  id: string;
  icon: string;
  title: string;
  desc: string;
  tag: string;
  colSpan: string;
}

const services: ServiceCard[] = [
  {
    id: 'ticketing',
    icon: 'TicketIcon',
    title: 'Flight Ticketing',
    desc: 'Domestic and international bookings at competitive fares. Multi-city, open-jaw, and corporate account rates available.',
    tag: 'Air Travel',
    colSpan: 'lg:col-span-1',
  },
  {
    id: 'hotels',
    icon: 'BuildingOffice2Icon',
    title: 'Hotel Booking',
    desc: 'Curated stays from business hotels to luxury resorts — pre-negotiated corporate rates across 80+ cities.',
    tag: 'Accommodation',
    colSpan: 'lg:col-span-1',
  },
  {
    id: 'transport',
    icon: 'TruckIcon',
    title: 'Local Transport',
    desc: 'Airport transfers, inter-city cabs, chauffeur services, and coach hire — coordinated seamlessly with your itinerary.',
    tag: 'Ground Mobility',
    colSpan: 'lg:col-span-2',
  },
  {
    id: 'sightseeing',
    icon: 'MapIcon',
    title: 'Sightseeing & Tours',
    desc: 'Guided excursions, cultural experiences, and leisure extensions built around your business schedule.',
    tag: 'Experiences',
    colSpan: 'lg:col-span-2',
  },
  {
    id: 'visa',
    icon: 'DocumentCheckIcon',
    title: 'Visa Assistance',
    desc: 'End-to-end visa documentation support for 50+ countries. Express processing for urgent corporate travel.',
    tag: 'Documentation',
    colSpan: 'lg:col-span-1',
  },
  {
    id: 'support',
    icon: 'PhoneArrowUpRightIcon',
    title: '24/7 Support',
    desc: 'Dedicated travel desk reachable around the clock. Real humans, not bots — because corporate travel never sleeps.',
    tag: 'Always On',
    colSpan: 'lg:col-span-1',
  },
];

export default function ServicesSection() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const initGsap = async () => {
      const { gsap } = await import('gsap');
      const { ScrollTrigger } = await import('gsap/ScrollTrigger');
      gsap.registerPlugin(ScrollTrigger);

      const cards = sectionRef.current?.querySelectorAll('.service-card');
      if (!cards) return;

      cards.forEach((card, i) => {
        gsap.fromTo(
          card,
          { y: 40, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.8,
            delay: i * 0.1,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: card,
              start: 'top 88%',
              toggleActions: 'play none none none',
            },
          }
        );
      });
    };
    initGsap();
  }, []);

  return (
    <section
      id="services"
      ref={sectionRef}
      className="max-w-7xl mx-auto w-full rounded-5xl shadow-card px-8 md:px-16 py-16 md:py-20"
      style={{ backgroundColor: '#0F1F3D' }}
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14">
        <div className="space-y-4">
          <span
            className="inline-block px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest text-navy"
            style={{ backgroundColor: '#E8A020' }}
          >
            What We Do
          </span>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-white leading-tight">
            End-to-End Travel,<br />
            <span className="font-serif italic font-light" style={{ color: '#E8A020' }}>
              One Partner.
            </span>
          </h2>
        </div>
        <p className="text-sm text-white/60 max-w-xs uppercase tracking-wider leading-relaxed font-semibold">
          From first flight to final transfer — every detail handled, nothing outsourced.
        </p>
      </div>

      {/* Bento Grid — 4 columns
          Row 1: ticketing(1) + hotels(1) + transport(2) = 4 ✓
          Row 2: sightseeing(2) + visa(1) + support(1) = 4 ✓
      */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {services.map((svc) => (
          <div
            key={svc.id}
            className={`service-card group p-8 md:p-10 rounded-4xl space-y-6 cursor-default opacity-100 border border-white/10 hover:border-amber-400/40 transition-all duration-300 ${svc.colSpan}`}
            style={{ backgroundColor: 'rgba(255,255,255,0.06)' }}
          >
            <div
              className="card-icon-wrap w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm transition-all duration-300 group-hover:scale-110"
              style={{ backgroundColor: 'rgba(232,160,32,0.18)' }}
            >
              <Icon name={svc.icon as Parameters<typeof Icon>[0]['name']} size={22} variant="outline" style={{ color: '#E8A020' }} />
            </div>
            <div className="space-y-3">
              <h3 className="text-lg font-bold text-white">{svc.title}</h3>
              <p className="card-desc text-xs leading-relaxed text-white/65 font-medium">{svc.desc}</p>
            </div>
            <span
              className="card-tag inline-block px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest transition-all duration-300"
              style={{ backgroundColor: 'rgba(232,160,32,0.15)', color: '#E8A020' }}
            >
              {svc.tag}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}