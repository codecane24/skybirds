'use client';

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { formatMoney } from '@/lib/currency';

interface BookingItem {
  _id: string;
  destination: string;
  travelDate: string;
  returnDate: string;
  travelers: number;
  totalAmount: number;
  currency?: string;
  status: string;
  paymentStatus: string;
  createdAt: string;
}

export default function BookingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    if (status === 'unauthenticated') { router.push('/login'); return; }
    if (status === 'authenticated' && session?.user?.role !== 'client') { router.push('/login'); return; }

    if (status === 'authenticated') {
      fetch('/api/bookings').then(r => r.json()).then((data) => {
        setBookings(Array.isArray(data) ? data : []);
        setLoading(false);
      }).catch(() => setLoading(false));
    }
  }, [status, session, router]);

  const filteredBookings = bookings.filter(b => {
    if (filter === 'all') return true;
    if (filter === 'upcoming') return new Date(b.travelDate) > new Date();
    if (filter === 'completed') return b.status === 'completed';
    if (filter === 'cancelled') return b.status === 'cancelled';
    return true;
  });

  const statusColor = (s: string) => {
    switch (s) {
      case 'confirmed': return 'bg-green-100 text-green-700';
      case 'pending': return 'bg-amber-100 text-amber-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
      case 'completed': return 'bg-blue-100 text-blue-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <svg className="animate-spin h-8 w-8 text-navy/30" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/></svg>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg">
      <header className="bg-white border-b sticky top-0 z-30" style={{ borderColor: 'rgba(15,31,61,0.08)' }}>
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/profile" className="text-sm font-semibold text-navy/50 hover:text-navy transition-colors">← Back to Profile</Link>
          <Link href="/book" className="px-5 py-2 rounded-full text-white text-sm font-bold" style={{ backgroundColor: '#E8A020' }}>New Booking</Link>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold text-navy mb-8">My Bookings</h1>

          {/* Filter Tabs */}
          <div className="flex gap-2 mb-8 flex-wrap">
            {['all', 'upcoming', 'completed', 'cancelled'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-5 py-2 rounded-full text-sm font-bold transition-all capitalize ${filter === f ? 'bg-navy text-white' : 'bg-white text-navy/50 border border-navy/10 hover:bg-navy/5'}`}
              >
                {f}
              </button>
            ))}
          </div>

          {filteredBookings.length === 0 ? (
            <div className="bg-white rounded-4xl p-12 shadow-card text-center">
              <span className="text-5xl mb-4 block">📭</span>
              <h3 className="text-xl font-bold text-navy mb-2">No Bookings Found</h3>
              <p className="text-navy/50 text-sm mb-6">{filter === 'all' ? "You haven't made any bookings yet." : `No ${filter} bookings.`}</p>
              <Link href="/book" className="inline-block px-6 py-3 rounded-full text-white font-bold text-sm" style={{ backgroundColor: '#0F1F3D' }}>Book Now</Link>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredBookings.map((booking) => (
                <Link key={booking._id} href={`/bookings/${booking._id}`} className="block bg-white rounded-3xl p-6 shadow-card hover:shadow-card-lg transition-shadow">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-xl shrink-0" style={{ backgroundColor: 'rgba(42,127,212,0.1)' }}>✈️</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 flex-wrap">
                        <h3 className="font-bold text-navy">{booking.destination}</h3>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${statusColor(booking.status)}`}>{booking.status}</span>
                      </div>
                      <p className="text-sm text-navy/40 mt-1">
                        {format(new Date(booking.travelDate), 'dd MMM yyyy')} → {format(new Date(booking.returnDate), 'dd MMM yyyy')}
                        <span className="mx-2">·</span>{booking.travelers} traveler(s)
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold" style={{ color: '#2A7FD4' }}>{formatMoney(booking.totalAmount, booking.currency)}</p>
                      <p className="text-xs text-navy/30">{format(new Date(booking.createdAt), 'dd MMM yyyy')}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
