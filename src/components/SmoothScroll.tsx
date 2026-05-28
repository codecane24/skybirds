'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Lenis from 'lenis';

const EXCLUDED_PREFIXES = ['/admin'];

export default function SmoothScroll() {
  const pathname = usePathname();

  useEffect(() => {
    const isFrontendPage = !EXCLUDED_PREFIXES.some((prefix) => pathname.startsWith(prefix));

    if (!isFrontendPage) {
      return;
    }

    const lenis = new Lenis({
      duration: 1.2,
      smoothWheel: true,
      smoothTouch: false,
      wheelMultiplier: 0.9,
      touchMultiplier: 1,
    });

    let frameId = 0;

    const raf = (time: number) => {
      lenis.raf(time);
      frameId = window.requestAnimationFrame(raf);
    };

    frameId = window.requestAnimationFrame(raf);

    return () => {
      window.cancelAnimationFrame(frameId);
      lenis.destroy();
    };
  }, [pathname]);

  return null;
}