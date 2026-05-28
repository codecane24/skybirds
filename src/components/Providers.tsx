'use client';

import { SessionProvider } from 'next-auth/react';
import { Toaster } from 'react-hot-toast';
import SmoothScroll from '@/components/SmoothScroll';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <SmoothScroll />
      {children}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#0F1F3D',
            color: '#fff',
            borderRadius: '12px',
            fontSize: '14px',
            fontFamily: 'Plus Jakarta Sans, sans-serif',
          },
          success: { iconTheme: { primary: '#2A7FD4', secondary: '#fff' } },
          error: { iconTheme: { primary: '#E8A020', secondary: '#fff' } },
        }}
      />
    </SessionProvider>
  );
}
