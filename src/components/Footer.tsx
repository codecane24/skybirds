import React from 'react';
import Link from 'next/link';
import AppLogo from '@/components/ui/AppLogo';

export default function Footer() {
  return (
    <footer
      className="border-t border-navy/8 bg-bg px-4 py-10 md:px-6 md:py-12"
      style={{ borderColor: 'rgba(15,31,61,0.08)' }}
    >
      <div className="max-w-7xl mx-auto flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col items-center gap-5 lg:flex-row lg:gap-8">
        {/* Logo + Brand */}
          <Link href="/" className="flex items-center" aria-label="Sky Birds home">
            <AppLogo width={144} className="h-auto" />
          </Link>

          {/* Links */}
          <nav
            className="flex items-center gap-5 flex-wrap justify-center lg:justify-start"
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
                className="flex min-h-[44px] items-center text-sm font-medium text-navy/50 transition-colors duration-200 hover:text-navy focus:outline-none focus:underline"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex flex-col items-center gap-3 lg:items-end">
          <span className="text-xs font-medium text-navy/35">© 2026 Sky Birds</span>
          <a
            href="https://www.techtycoons.in/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 rounded-full border border-navy/10 bg-white/80 px-4 py-2 shadow-[0_10px_30px_rgba(15,31,61,0.06)] backdrop-blur-sm transition hover:border-navy/20 hover:bg-white"
            aria-label="Maintained by Techtycoons"
          >
            <span className="text-[10px] font-bold uppercase tracking-[0.24em] text-navy/45">Maintained By</span>
            <span className="rounded-full bg-navy px-3 py-1 text-sm font-semibold text-white">Techtycoons</span>
          </a>
        </div>
      </div>
    </footer>
  );
}
