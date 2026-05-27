'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { formatMoney } from '@/lib/currency';

interface DashboardStats {
  totalTestimonials: number;
  totalDestinations: number;
  totalServices: number;
  totalContacts: number;
  totalBookings: number;
  totalClients: number;
  totalRevenue: number;
  recentContacts: { _id: string; fullName: string; email: string; createdAt: string }[];
  recentBookings: { _id: string; destination: string; totalAmount: number; currency?: string; status: string; createdAt: string }[];
}

const statCards = [
  { key: 'totalBookings', label: 'Bookings', icon: '✈️', color: '#2A7FD4' },
  { key: 'totalClients', label: 'Clients', icon: '👥', color: '#0F1F3D' },
  { key: 'totalRevenue', label: 'Revenue', icon: '💰', color: '#E8A020', isMoney: true },
  { key: 'totalContacts', label: 'Inquiries', icon: '📧', color: '#6366f1' },
  { key: 'totalTestimonials', label: 'Testimonials', icon: '💬', color: '#059669' },
  { key: 'totalDestinations', label: 'Destinations', icon: '🌍', color: '#dc2626' },
];

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/dashboard/stats').then(r => r.json()).then((data) => {
      setStats(data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center py-20">
      <svg className="animate-spin h-8 w-8 text-navy/20" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/></svg>
    </div>;
  }

  return (
    <div className="max-w-7xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className="text-2xl font-bold text-navy mb-6">Overview</h2>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          {statCards.map((card) => {
            const rawValue = stats?.[card.key as keyof DashboardStats];
            const numericValue = typeof rawValue === 'number' ? rawValue : 0;

            return (
              <div key={card.key} className="bg-white rounded-2xl p-5 shadow-card">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-lg">{card.icon}</span>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-navy/40">{card.label}</span>
                </div>
                <p className="text-2xl font-bold text-navy">
                  {card.isMoney ? `INR ${numericValue.toLocaleString('en-IN')}` : String(numericValue)}
                </p>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Bookings */}
          <div className="bg-white rounded-3xl p-6 shadow-card">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-navy">Recent Bookings</h3>
              <Link href="/admin/bookings" className="text-xs font-semibold text-sky-brand hover:underline">View All</Link>
            </div>
            {stats?.recentBookings && stats.recentBookings.length > 0 ? (
              <div className="space-y-3">
                {stats.recentBookings.map((b) => (
                  <Link key={b._id} href={`/admin/bookings/${b._id}`} className="flex items-center justify-between p-3 rounded-xl hover:bg-bg transition-colors">
                    <div>
                      <p className="font-semibold text-navy text-sm">{b.destination}</p>
                      <p className="text-xs text-navy/30">{format(new Date(b.createdAt), 'dd MMM yyyy')}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-sm" style={{ color: '#2A7FD4' }}>{formatMoney(b.totalAmount, b.currency)}</p>
                      <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${b.status === 'confirmed' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                        {b.status}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : <p className="text-navy/30 text-sm">No bookings yet.</p>}
          </div>

          {/* Recent Contacts */}
          <div className="bg-white rounded-3xl p-6 shadow-card">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-navy">Recent Inquiries</h3>
              <Link href="/admin/contacts" className="text-xs font-semibold text-sky-brand hover:underline">View All</Link>
            </div>
            {stats?.recentContacts && stats.recentContacts.length > 0 ? (
              <div className="space-y-3">
                {stats.recentContacts.map((c) => (
                  <Link key={c._id} href={`/admin/contacts/${c._id}`} className="flex items-center justify-between p-3 rounded-xl hover:bg-bg transition-colors">
                    <div>
                      <p className="font-semibold text-navy text-sm">{c.fullName}</p>
                      <p className="text-xs text-navy/30">{c.email}</p>
                    </div>
                    <p className="text-xs text-navy/30">{format(new Date(c.createdAt), 'dd MMM')}</p>
                  </Link>
                ))}
              </div>
            ) : <p className="text-navy/30 text-sm">No inquiries yet.</p>}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8">
          <h3 className="font-bold text-navy mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Add Testimonial', href: '/admin/testimonials/new', icon: '💬' },
              { label: 'Add Destination', href: '/admin/destinations/new', icon: '🌍' },
              { label: 'Add Service', href: '/admin/services/new', icon: '⚙️' },
              { label: 'View All Bookings', href: '/admin/bookings', icon: '✈️' },
            ].map(a => (
              <Link key={a.href} href={a.href} className="bg-white rounded-2xl p-5 shadow-card hover:shadow-card-lg transition-shadow text-center">
                <span className="text-2xl block mb-2">{a.icon}</span>
                <span className="text-sm font-semibold text-navy">{a.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
