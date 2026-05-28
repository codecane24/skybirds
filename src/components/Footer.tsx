import React from 'react';
import Link from 'next/link';
import AppLogo from '@/components/ui/AppLogo';

export default function Footer() {
  return (
    <footer
      className="border-t border-navy/8 bg-bg py-16 px-4 md:px-6"
      style={{ borderColor: 'rgba(15,31,61,0.08)' }}
    >
      <div className="max-w-7xl mx-auto flex flex-col gap-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Logo + Brand */}
          <Link href="/" className="flex items-center" aria-label="Sky Birds home">
            <AppLogo width={144} className="h-auto" />
          </Link>

          {/* Links */}
          <nav
            className="flex items-center gap-6 flex-wrap justify-center"
            aria-label="Footer navigation"
          >
            {[
              { label: 'Services', href: '#services' },
              { label: 'Destinations', href: '#destinations' },
              { label: 'Why Us', href: '#why-us' },
              { label: 'Privacy', href: '/privacy-policy' },
              { label: 'Terms', href: '/terms' },
            ].map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-sm font-medium text-navy/50 hover:text-navy transition-colors duration-200 focus:outline-none focus:underline min-h-[44px] flex items-center"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Social + Copyright */}
          <div className="flex items-center gap-4">
          {/* Twitter/X */}
         { /* <a
            href="#"
            aria-label="Sky Birds on Twitter"
            className="w-9 h-9 rounded-full border flex items-center justify-center text-navy/40 hover:text-navy hover:border-navy/30 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-amber-brand"
            style={{ borderColor: 'rgba(15,31,61,0.12)' }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.747l7.73-8.835L1.254 2.25H8.08l4.253 5.622 5.911-5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
          </a> */}
          {/* LinkedIn */}
        { /*  <a
            href="#"
            aria-label="Sky Birds on LinkedIn"
            className="w-9 h-9 rounded-full border flex items-center justify-center text-navy/40 hover:text-navy hover:border-navy/30 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-amber-brand"
            style={{ borderColor: 'rgba(15,31,61,0.12)' }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
            </svg>
          </a> */}
            <span className="text-xs font-medium text-navy/35 ml-2">© 2026 Sky Birds</span>
          </div>
        </div>

        <div className="flex justify-center md:justify-end">
          <div className="inline-flex items-center gap-3 rounded-full border border-navy/10 bg-white/80 px-4 py-2 shadow-[0_10px_30px_rgba(15,31,61,0.06)] backdrop-blur-sm">
            <span className="rounded-full bg-navy px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.24em] text-white">Maintained By</span>
            <span className="text-sm font-semibold text-navy/55">Codecane</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
