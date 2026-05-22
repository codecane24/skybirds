'use client';

import React, { useEffect, useRef, useState } from 'react';
import Icon from '@/components/ui/AppIcon';

interface ServiceCard {
  id: string;
  icon: string;
  title: string;
  desc: string;
  tag: string;
  colSpan: string;
}

const fallbackServices: ServiceCard[] = [
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
    desc: 'Curated stays from business hotels to luxury resorts - pre-negotiated corporate rates across 80+ cities.',
    tag: 'Accommodation',
    colSpan: 'lg:col-span-1',
  },
  {
    id: 'transport',
    icon: 'TruckIcon',
    title: 'Local Transport',
    desc: 'Airport transfers, inter-city cabs, chauffeur services, and coach hire - coordinated seamlessly with your itinerary.',
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
    desc: 'Dedicated travel desk reachable around the clock. Real humans, not bots - because corporate travel never sleeps.',
    tag: 'Always On',
    colSpan: 'lg:col-span-1',
  },
];

const colSpanMap: Record<number, string> = { 1: 'lg:col-span-1', 2: 'lg:col-span-2' };
const serviceNumbers = ['01', '02', '03', '04', '05', '06'];
const serviceHighlights = ['Flights', 'Visas', 'Hotels', 'Transfers','Travel Insurance'];

export default function ServicesSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [services, setServices] = useState<ServiceCard[]>(fallbackServices);
  const [activeCard, setActiveCard] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/services')
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setServices(
            data.map(
              (s: {
                _id: string;
                icon: string;
                title: string;
                description: string;
                tag: string;
                colSpan?: number;
              }) => ({
                id: s._id,
                icon: s.icon || 'CogIcon',
                title: s.title,
                desc: s.description,
                tag: s.tag || '',
                colSpan: colSpanMap[s.colSpan || 1] || 'lg:col-span-1',
              })
            )
          );
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const initGsap = async () => {
      const { gsap } = await import('gsap');
      const { ScrollTrigger } = await import('gsap/ScrollTrigger');
      gsap.registerPlugin(ScrollTrigger);

      if (!sectionRef.current) return;

      gsap.fromTo(
        sectionRef.current.querySelector('.svc-badge'),
        { y: 20, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.6,
          ease: 'power3.out',
          scrollTrigger: { trigger: sectionRef.current, start: 'top 80%' },
        }
      );

      gsap.fromTo(
        sectionRef.current.querySelector('.svc-heading'),
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          delay: 0.1,
          ease: 'power3.out',
          scrollTrigger: { trigger: sectionRef.current, start: 'top 80%' },
        }
      );

      gsap.fromTo(
        sectionRef.current.querySelector('.svc-subtext'),
        { y: 20, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.7,
          delay: 0.2,
          ease: 'power3.out',
          scrollTrigger: { trigger: sectionRef.current, start: 'top 80%' },
        }
      );

      gsap.fromTo(
        sectionRef.current.querySelector('.svc-line'),
        { scaleX: 0 },
        {
          scaleX: 1,
          duration: 1,
          delay: 0.3,
          ease: 'power3.inOut',
          scrollTrigger: { trigger: sectionRef.current, start: 'top 75%' },
        }
      );

      const cards = sectionRef.current.querySelectorAll('.svc-card');
      cards.forEach((card, i) => {
        const isEven = i % 2 === 0;
        gsap.fromTo(
          card,
          { y: isEven ? 60 : 40, x: isEven ? -20 : 20, opacity: 0, scale: 0.95 },
          {
            y: 0,
            x: 0,
            opacity: 1,
            scale: 1,
            duration: 0.9,
            delay: i * 0.12,
            ease: 'power3.out',
            scrollTrigger: { trigger: card, start: 'top 90%' },
          }
        );
      });

      gsap.fromTo(
        sectionRef.current.querySelector('.svc-counter'),
        { scale: 0.96, opacity: 0 },
        {
          scale: 1,
          opacity: 1,
          duration: 0.7,
          delay: 0.45,
          ease: 'power3.out',
          scrollTrigger: { trigger: sectionRef.current, start: 'top 75%' },
        }
      );

      gsap.fromTo(
        sectionRef.current.querySelector('.svc-cta'),
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.7,
          delay: 0.4,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: sectionRef.current.querySelector('.svc-cta'),
            start: 'top 92%',
          },
        }
      );
    };

    initGsap();
  }, [services]);

  return (
    <section
      id="services"
      ref={sectionRef}
      className="relative mx-auto w-full max-w-7xl overflow-hidden rounded-5xl bg-white shadow-card"
    >
      <div className="pointer-events-none absolute inset-0">
        <div
          className="absolute right-0 top-0 h-[420px] w-[420px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(42,127,212,0.12) 0%, transparent 72%)',
          }}
        />
        <div
          className="absolute bottom-0 left-0 h-[360px] w-[360px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(232,160,32,0.12) 0%, transparent 70%)',
          }}
        />
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(15,31,61,0.18) 1px, transparent 1px), linear-gradient(90deg, rgba(15,31,61,0.18) 1px, transparent 1px)',
            backgroundSize: '64px 64px',
          }}
        />
      </div>

      <div className="relative px-8 py-16 md:px-16 md:py-24">
        <div className="mb-14 grid gap-8 lg:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.85fr)] lg:items-end">
          <div className="space-y-6">
            <span className="svc-badge inline-flex items-center gap-2 rounded-full border border-amber-brand/20 bg-amber-brand/10 px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest text-amber-brand opacity-0">
              <span className="h-1.5 w-1.5 rounded-full pulse-amber bg-amber-brand" />
              What We Do
            </span>
            <div className="space-y-5">
              <h2 className="svc-heading text-4xl font-bold leading-[1.02] tracking-tight text-navy opacity-0 md:text-5xl lg:text-6xl">
                Your World, Simplified.
                <br />
                <span className="font-serif text-amber-brand italic font-light">One Partner For Every Destination.</span>
              </h2>

              <p className="svc-subtext max-w-2xl text-base font-medium leading-relaxed text-navy/60 opacity-0 md:text-lg">
                From the moment you plan to the moment you return, we manage your entire travel ecosystem. No multiple logins, no fragmented support—just one dedicated team ensuring your journey is seamless from start to finish.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              {serviceHighlights.map((item) => (
                <span
                  key={item}
                  className="rounded-full border border-navy/10 bg-white/80 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.2em] text-navy/55 shadow-sm backdrop-blur-sm"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>

          <div className="svc-counter relative overflow-hidden rounded-[32px] border border-navy/10 bg-white/85 p-6 shadow-card-lg backdrop-blur-sm opacity-0 md:p-7">
            <div
              className="absolute right-0 top-0 h-28 w-28 rounded-full"
              style={{
                background: 'radial-gradient(circle, rgba(232,160,32,0.18) 0%, transparent 72%)',
              }}
            />

            <div className="relative flex items-start justify-between gap-4">
              <div className="space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-navy/35">
                  Corporate Travel Desk
                </p>
                <p className="text-2xl font-bold leading-tight text-navy md:text-[28px]">
                  Every moving part, handled under one roof.
                </p>
              </div>

              <div className="rounded-[24px] border border-amber-brand/20 bg-amber-brand/10 px-4 py-3 text-center">
                <div className="text-3xl font-bold text-amber-brand">{services.length}</div>
                <div className="text-[9px] font-bold uppercase tracking-[0.24em] text-amber-brand/70">
                  Services
                </div>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-navy/8 bg-bg/80 p-4">
                <p className="text-xl font-bold text-navy">24/7</p>
                <p className="mt-1 text-xs font-medium leading-relaxed text-navy/55">
                  Live support for schedule changes and urgent reroutes.
                </p>
              </div>
              <div className="rounded-2xl border border-navy/8 bg-bg/80 p-4">
                <p className="text-xl font-bold text-navy">Single POV</p>
                <p className="mt-1 text-xs font-medium leading-relaxed text-navy/55">
                  One partner coordinating air, stay, local movement, and docs.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div
          className="svc-line mb-12 h-px w-full origin-left"
          style={{
            background:
              'linear-gradient(90deg, rgba(15,31,61,0.18) 0%, rgba(15,31,61,0.08) 42%, rgba(15,31,61,0) 100%)',
          }}
        />

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-5 lg:grid-cols-4">
          {services.map((svc, i) => {
            const isActive = activeCard === svc.id;
            const num = serviceNumbers[i] || String(i + 1).padStart(2, '0');

            return (
              <div
                key={svc.id}
                className={`svc-card group relative cursor-default overflow-hidden rounded-[30px] p-7 opacity-0 transition-all duration-500 md:p-8 ${svc.colSpan}`}
                style={{
                  background: isActive
                    ? 'linear-gradient(160deg, #0F1F3D 0%, #091328 100%)'
                    : 'linear-gradient(160deg, #0F1F3D 0%, #0c1838 100%)',
                  border: `1px solid ${isActive ? 'rgba(232,160,32,0.4)' : 'rgba(255,255,255,0.08)'}`,
                  boxShadow: isActive
                    ? '0 20px 45px rgba(0,0,0,0.4), 0 0 0 1px rgba(232,160,32,0.15)'
                    : '0 10px 30px rgba(0,0,0,0.25)',
                  transform: isActive ? 'translateY(-6px)' : 'translateY(0px)',
                }}
                onMouseEnter={() => setActiveCard(svc.id)}
                onMouseLeave={() => setActiveCard(null)}
              >
                <div
                  className="absolute inset-x-0 top-0 h-1"
                  style={{
                    background: isActive
                      ? 'linear-gradient(90deg, #E8A020 0%, #2A7FD4 100%)'
                      : 'linear-gradient(90deg, rgba(232,160,32,0.75) 0%, rgba(42,127,212,0.35) 100%)',
                  }}
                />
                <div
                  className="absolute -right-10 -top-10 h-32 w-32 rounded-full transition-all duration-500"
                  style={{ background: isActive ? 'rgba(232,160,32,0.12)' : 'rgba(232,160,32,0.04)' }}
                />

                <span
                  className="pointer-events-none absolute right-6 top-5 select-none text-[62px] font-bold leading-none transition-all duration-500"
                  style={{ color: isActive ? 'rgba(232,160,32,0.18)' : 'rgba(255,255,255,0.06)' }}
                >
                  {num}
                </span>

                <div className="relative mb-7 h-14 w-14">
                  <div
                    className="absolute inset-0 rounded-2xl transition-all duration-500"
                    style={{
                      backgroundColor: isActive ? 'rgba(232,160,32,0.28)' : 'rgba(255,255,255,0.07)',
                      transform: isActive ? 'rotate(6deg) scale(1.05)' : 'rotate(0deg) scale(1)',
                    }}
                  />
                  <div
                    className="relative flex h-full w-full items-center justify-center rounded-2xl transition-all duration-500"
                    style={{
                      backgroundColor: isActive
                        ? 'rgba(255,255,255,0.14)'
                        : 'rgba(255,255,255,0.09)',
                    }}
                  >
                    <Icon
                      name={svc.icon as Parameters<typeof Icon>[0]['name']}
                      size={24}
                      variant="outline"
                      className="transition-colors duration-500"
                      style={{ color: isActive ? '#E8A020' : 'rgba(255,255,255,0.75)' }}
                    />
                  </div>
                </div>

                <span
                  className="mb-4 inline-block rounded-full px-3 py-1 text-[9px] font-bold uppercase tracking-widest transition-all duration-500"
                  style={{
                    backgroundColor: isActive ? 'rgba(232,160,32,0.18)' : 'rgba(255,255,255,0.08)',
                    color: isActive ? '#E8A020' : 'rgba(255,255,255,0.5)',
                  }}
                >
                  {svc.tag}
                </span>

                <h3 className="mb-3 text-lg font-bold" style={{ color: '#E8A020' }}>{svc.title}</h3>

                <p
                  className="text-[13px] font-medium leading-relaxed transition-all duration-500"
                  style={{ color: isActive ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.6)' }}
                >
                  {svc.desc}
                </p>

                <div
                  className="mt-6 flex items-center gap-2 transition-all duration-500"
                  style={{
                    opacity: isActive ? 1 : 0.55,
                    transform: isActive ? 'translateX(0)' : 'translateX(-6px)',
                  }}
                >
                  <div className="h-px w-8 bg-amber-brand" />
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 14 14"
                    fill="none"
                    className="text-amber-brand"
                  >
                    <path
                      d="M2 7h10M8 3l4 4-4 4"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>

                <div
                  className="pointer-events-none absolute inset-0 rounded-[30px] transition-opacity duration-500"
                  style={{
                    opacity: isActive ? 1 : 0,
                    boxShadow: '0 0 80px rgba(232,160,32,0.1) inset',
                  }}
                />
              </div>
            );
          })}
        </div>

        <div className="svc-cta mt-14 flex flex-col items-start justify-between gap-6 rounded-[32px] border border-navy/10 bg-bg/80 p-6 opacity-0 md:flex-row md:items-center md:p-8">
          <div className="flex items-center gap-5">
            <div className="relative flex h-12 w-12 items-center justify-center">
              <div className="absolute h-12 w-12 rounded-full animate-ping bg-amber-brand/10" />
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-brand/15">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#E8A020"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </div>
            </div>
            <div>
              <p className="text-base font-bold text-navy">Need a custom travel solution?</p>
              <p className="text-xs font-medium text-navy/50">
                Our experts shape bespoke itineraries, policy-friendly rates, and operational
                support for teams of any size.
              </p>
            </div>
          </div>

          <button
            onClick={() =>
              document.querySelector('#contact')?.scrollIntoView({ behavior: 'smooth' })
            }
            className="group/btn flex shrink-0 items-center gap-2 rounded-full bg-navy px-7 py-3.5 text-sm font-bold text-white transition-all duration-300 hover:shadow-card-lg"
          >
            Get in Touch
            <svg
              width="14"
              height="14"
              viewBox="0 0 14 14"
              fill="none"
              className="transition-transform duration-300 group-hover/btn:translate-x-1"
            >
              <path
                d="M2 7h10M8 3l4 4-4 4"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
}
