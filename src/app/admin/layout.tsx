'use client';

import React, { useEffect, useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';

const navItems = [
  { label: 'Dashboard', href: '/admin', icon: '📊' },
  { label: 'Testimonials', href: '/admin/testimonials', icon: '💬' },
  { label: 'Our Team', href: '/admin/team', icon: '🧑‍🤝‍🧑' },
  { label: 'Destinations', href: '/admin/destinations', icon: '🌍' },
  { label: 'Services', href: '/admin/services', icon: '⚙️' },
  { label: 'Contacts', href: '/admin/contacts', icon: '📧' },
  { label: 'Bookings', href: '/admin/bookings', icon: '✈️' },
  { label: 'Clients', href: '/admin/clients', icon: '👥' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isLoginPage = pathname === '/admin/login';

  useEffect(() => {
    if (isLoginPage) return;
    if (status === 'unauthenticated') { router.push('/admin/login'); }
    if (status === 'authenticated' && !['admin', 'superadmin'].includes(session?.user?.role || '')) {
      router.push('/admin/login');
    }
  }, [status, session, router, isLoginPage]);

  // Let login page render without auth guard
  if (isLoginPage) return <>{children}</>;

  if (status === 'loading' || status === 'unauthenticated') {
    return <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#0F1F3D' }}>
      <svg className="animate-spin h-8 w-8 text-white/30" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/></svg>
    </div>;
  }

  return (
    <div className="min-h-screen bg-bg flex">
      {/* Mobile Overlay */}
      {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`} style={{ backgroundColor: '#0F1F3D' }}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="px-6 py-6 border-b border-white/8">
            <Link href="/admin" className="flex items-center gap-2">
              <span className="font-sans text-xl tracking-tight text-white" style={{ fontWeight: 800 }}>Sky<span style={{ color: '#E8A020' }}>Birds</span></span>
            </Link>
            <p className="text-white/25 text-[10px] uppercase tracking-widest mt-1 font-semibold">Admin Panel</p>
          </div>

          {/* Nav */}
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${isActive ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white/70 hover:bg-white/5'}`}
                >
                  <span className="text-base">{item.icon}</span>
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* User */}
          <div className="px-4 py-4 border-t border-white/8">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white" style={{ backgroundColor: 'rgba(232,160,32,0.3)' }}>
                {session?.user?.name?.charAt(0)?.toUpperCase() || 'A'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-semibold truncate">{session?.user?.name}</p>
                <p className="text-white/30 text-xs truncate">{session?.user?.email}</p>
              </div>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: '/admin/login' })}
              className="w-full py-2 rounded-lg text-xs font-semibold text-white/40 hover:text-white hover:bg-white/5 transition-all"
            >
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="bg-white border-b sticky top-0 z-30 px-6 py-4 flex items-center justify-between" style={{ borderColor: 'rgba(15,31,61,0.08)' }}>
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden w-10 h-10 rounded-xl flex items-center justify-center hover:bg-bg transition-colors"
          >
            <svg className="w-5 h-5 text-navy" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
          </button>
          <h1 className="text-lg font-bold text-navy capitalize">
            {pathname === '/admin' ? 'Dashboard' : pathname.split('/').pop()?.replace(/-/g, ' ')}
          </h1>
          <Link href="/" target="_blank" className="text-sm text-navy/40 hover:text-navy transition-colors font-semibold">
            View Site ↗
          </Link>
        </header>

        {/* Content */}
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
