'use client';

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { DEFAULT_CURRENCY, formatMoney } from '@/lib/currency';

interface BookingDetail {
  _id: string;
  destination: string;
  travelDate: string;
  returnDate: string;
  travelers: number;
  services: string[];
  totalAmount: number;
  currency?: string;
  conversionRate?: number;
  status: string;
  paymentStatus: string;
  razorpayPaymentId: string;
  notes: string;
  createdAt: string;
}

export default function BookingDetailPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const [booking, setBooking] = useState<BookingDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') { router.push('/login'); return; }
    if (status === 'authenticated') {
      fetch(`/api/bookings/${params.id}`).then(r => r.json()).then((data) => {
        if (data.error) { router.push('/bookings'); return; }
        setBooking(data);
        setLoading(false);
      }).catch(() => { router.push('/bookings'); });
    }
  }, [status, session, router, params.id]);

  const statusColor = (s: string) => {
    switch (s) {
      case 'confirmed': return 'bg-green-100 text-green-700';
      case 'pending': return 'bg-amber-100 text-amber-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
      case 'completed': return 'bg-blue-100 text-blue-700';
      case 'paid': return 'bg-green-100 text-green-700';
      case 'failed': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-bg flex items-center justify-center">
      <svg className="animate-spin h-8 w-8 text-navy/30" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/></svg>
    </div>;
  }

  if (!booking) return null;

  return (
    <div className="min-h-screen bg-bg">
      <header className="bg-white border-b sticky top-0 z-30" style={{ borderColor: 'rgba(15,31,61,0.08)' }}>
        <div className="max-w-6xl mx-auto px-6 py-4">
          <Link href="/bookings" className="text-sm font-semibold text-navy/50 hover:text-navy transition-colors">← Back to Bookings</Link>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-6 py-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          {/* Header */}
          <div className="flex items-start justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-navy">{booking.destination}</h1>
              <p className="text-navy/40 text-sm mt-1">Booked on {format(new Date(booking.createdAt), 'dd MMMM yyyy')}</p>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${statusColor(booking.status)}`}>{booking.status}</span>
          </div>

          {/* Reference */}
          <div className="bg-white rounded-3xl p-6 shadow-card mb-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-navy/40 uppercase tracking-widest">Booking Reference</p>
                <p className="text-xl font-bold text-navy tracking-wider mt-1">{booking._id.slice(-8).toUpperCase()}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${statusColor(booking.paymentStatus)}`}>
                {booking.paymentStatus}
              </span>
            </div>
          </div>

          {/* Details */}
          <div className="bg-white rounded-4xl p-8 shadow-card mb-5">
            <h3 className="font-bold text-navy mb-5">Trip Details</h3>
            <div className="space-y-4">
              {[
                { label: 'Destination', value: booking.destination },
                { label: 'Travel Date', value: format(new Date(booking.travelDate), 'dd MMMM yyyy') },
                { label: 'Return Date', value: format(new Date(booking.returnDate), 'dd MMMM yyyy') },
                { label: 'Travelers', value: booking.travelers.toString() },
                ...(booking.currency && booking.currency !== DEFAULT_CURRENCY
                  ? [{ label: 'INR Conversion Rate', value: booking.conversionRate?.toLocaleString('en-IN', { maximumFractionDigits: 6 }) || 'N/A' }]
                  : []),
                ...(booking.services.length > 0 ? [{ label: 'Services', value: booking.services.join(', ') }] : []),
                ...(booking.notes ? [{ label: 'Notes', value: booking.notes }] : []),
              ].map((item) => (
                <div key={item.label} className="flex justify-between py-3 border-b" style={{ borderColor: 'rgba(15,31,61,0.06)' }}>
                  <span className="text-navy/50 text-sm">{item.label}</span>
                  <span className="font-semibold text-navy text-sm text-right max-w-xs">{item.value}</span>
                </div>
              ))}
              <div className="flex justify-between pt-2">
                <span className="font-bold text-navy">Total Amount</span>
                <span className="text-2xl font-bold" style={{ color: '#2A7FD4' }}>{formatMoney(booking.totalAmount, booking.currency)}</span>
              </div>
            </div>
          </div>

          {/* Payment Info */}
          {booking.razorpayPaymentId && (
            <div className="bg-white rounded-3xl p-6 shadow-card">
              <p className="text-xs text-navy/40 uppercase tracking-widest mb-1">Payment ID</p>
              <p className="font-mono text-sm text-navy">{booking.razorpayPaymentId}</p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
