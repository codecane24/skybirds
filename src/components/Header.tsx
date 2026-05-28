'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import AppLogo from '@/components/ui/AppLogo';

const navLinks = [
  { label: 'Services', href: '#services' },
  { label: 'Why Us', href: '#why-us' },
  { label: 'Destinations', href: '#destinations' },
  { label: 'Our Team', href: '#our-team' },
];

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  const handleNavClick = (href: string) => {
    setMenuOpen(false);
    const el = document.querySelector(href);
    if (el) {
      setTimeout(() => {
        el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled ? 'py-3 px-4 md:px-6' : 'py-4 px-4 md:px-6'
        }`}
      >
        <div
          className={`max-w-7xl mx-auto flex items-center justify-between px-6 md:px-8 py-3 rounded-full transition-all duration-500 ${
            scrolled
              ? 'bg-white/85 backdrop-blur-xl shadow-card border border-white/60'
              : 'bg-white/60 backdrop-blur-md border border-white/40'
          }`}
        >
          {/* Logo */}
          <Link href="/" className="flex items-center group" aria-label="Sky Birds home">
            <AppLogo width={168} className="h-auto" />
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8" aria-label="Primary navigation">
            {navLinks.map((link) => (
              <button
                key={link.href}
                onClick={() => handleNavClick(link.href)}
                className="text-sm font-semibold text-navy/70 hover:text-navy transition-colors duration-200 focus:outline-none focus:underline"
              >
                {link.label}
              </button>
            ))}
          </nav>

          {/* CTA */}
          <div className="flex items-center gap-3">
            {/* Login button temporarily hidden
            <Link
              href="/login"
              className="hidden sm:flex items-center text-sm font-semibold text-navy/70 hover:text-navy transition-colors duration-200"
            >
              Login
            </Link>
            */}
            <button
              onClick={() => handleNavClick('#contact')}
              className="hidden sm:flex items-center gap-2 bg-navy text-white px-5 py-2.5 rounded-full text-sm font-bold hover:bg-navy-mid transition-colors duration-200 shadow-sm"
            >
              Contact Us
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <path
                  d="M2 7h10M8 3l4 4-4 4"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>

            {/* Hamburger */}
            <button
              className="md:hidden flex flex-col justify-center items-center w-10 h-10 rounded-full border border-navy/10 bg-white/60 gap-1.5 focus:outline-none focus:ring-2 focus:ring-amber-brand"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={menuOpen}
            >
              <span
                className={`block w-5 h-0.5 bg-navy transition-all duration-300 ${menuOpen ? 'rotate-45 translate-y-2' : ''}`}
              />
              <span
                className={`block w-5 h-0.5 bg-navy transition-all duration-300 ${menuOpen ? 'opacity-0' : ''}`}
              />
              <span
                className={`block w-5 h-0.5 bg-navy transition-all duration-300 ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`}
              />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <div
        className={`fixed inset-0 z-40 md:hidden transition-all duration-400 ${
          menuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        style={{ backdropFilter: 'blur(20px)', background: 'rgba(15,31,61,0.92)' }}
        onClick={() => setMenuOpen(false)}
      >
        <div
          className="flex flex-col items-center justify-center h-full gap-8"
          onClick={(e) => e.stopPropagation()}
        >
          {navLinks.map((link) => (
            <button
              key={link.href}
              onClick={() => handleNavClick(link.href)}
              className="text-2xl font-bold text-white hover:text-amber-brand transition-colors duration-200 focus:outline-none min-h-[44px] flex items-center"
            >
              {link.label}
            </button>
          ))}
          <button
            onClick={() => handleNavClick('#contact')}
            className="mt-4 bg-amber-brand text-navy px-8 py-4 rounded-full text-lg font-bold hover:bg-amber-light transition-colors duration-200 min-h-[52px]"
          >
            Contact Us
          </button>
          {/* Login button temporarily hidden
          <Link
            href="/login"
            onClick={() => setMenuOpen(false)}
            className="text-lg font-semibold text-white/60 hover:text-white transition-colors min-h-[44px] flex items-center"
          >
            Login / Register
          </Link>
          */}
        </div>
      </div>
    </>
  );
}
