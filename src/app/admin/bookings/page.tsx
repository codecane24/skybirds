'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { formatMoney } from '@/lib/currency';

interface Booking {
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
  clientId?: { name: string; email: string; phone?: string; alternatePhone?: string };
  lastPaymentAttempt?: {
    status: string;
    createdAt: string;
    razorpayOrderId?: string;
    razorpayPaymentId?: string;
  } | null;
}

export default function AdminBookingsPage() {
  const [items, setItems] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const fetchItems = async () => {
    const res = await fetch('/api/bookings');
    const data = await res.json();
    setItems(Array.isArray(data) ? data : []);
    setLoading(false);
  };

  useEffect(() => { fetchItems(); }, []);

  const filtered = items.filter(b => {
    if (filter === 'all') return true;
    if (filter === 'confirmed') return b.status === 'confirmed';
    if (filter === 'pending') return b.status === 'pending';
    if (filter === 'cancelled') return b.status === 'cancelled';
    return true;
  }).filter((b) => {
    if (!fromDate && !toDate) return true;
    const bookingDate = new Date(b.createdAt);

    if (fromDate) {
      const from = new Date(fromDate);
      from.setHours(0, 0, 0, 0);
      if (bookingDate < from) return false;
    }

    if (toDate) {
      const to = new Date(toDate);
      to.setHours(23, 59, 59, 999);
      if (bookingDate > to) return false;
    }

    return true;
  });

  const updateStatus = async (id: string, status: string) => {
    const res = await fetch(`/api/bookings/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) });
    if (res.ok) { toast.success('Status updated'); fetchItems(); } else { toast.error('Failed'); }
  };

  const statusColor = (s: string) => {
    switch (s) {
      case 'confirmed': return 'bg-green-100 text-green-700';
      case 'pending': return 'bg-amber-100 text-amber-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
      case 'completed': return 'bg-blue-100 text-blue-700';
      case 'paid': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  if (loading) return <div className="flex items-center justify-center py-20"><svg className="animate-spin h-8 w-8 text-navy/20" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/></svg></div>;

  return (
    <div className="max-w-6xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-navy">All Bookings</h2>
          <div className="flex items-center gap-3">
            <span className="text-sm text-navy/40 font-semibold">{items.length} total</span>
            <Link href="/admin/bookings/new" className="px-4 py-2 rounded-full bg-navy text-white font-bold text-sm shadow hover:bg-navy/90 transition-all">+ Booking Form</Link>
          </div>
        </div>

        <div className="flex gap-2 mb-6 flex-wrap">
          {['all', 'pending', 'confirmed', 'cancelled'].map(f => (
            <button key={f} onClick={() => setFilter(f)} className={`px-4 py-2 rounded-full text-sm font-bold transition-all capitalize ${filter === f ? 'bg-navy text-white' : 'bg-white text-navy/50 border border-navy/10'}`}>{f}</button>
          ))}
        </div>

        <div className="bg-white rounded-2xl p-4 border border-navy/10 mb-6">
          <div className="flex flex-col md:flex-row md:items-end gap-3">
            <div>
              <label className="block text-xs font-semibold text-navy/50 mb-1">From Date</label>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="px-3 py-2 rounded-lg border border-navy/10 text-sm text-navy bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-navy/50 mb-1">To Date</label>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="px-3 py-2 rounded-lg border border-navy/10 text-sm text-navy bg-white"
              />
            </div>
            <button
              onClick={() => {
                setFromDate('');
                setToDate('');
              }}
              className="px-4 py-2 rounded-lg text-sm font-bold bg-navy/5 text-navy hover:bg-navy/10 transition"
            >
              Clear Date Filter
            </button>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 shadow-card text-center"><p className="text-navy/40">No bookings found.</p></div>
        ) : (
          <div className="space-y-3">
            {filtered.map((b) => (
              <div key={b._id} className="bg-white rounded-2xl p-5 shadow-card">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h3 className="font-bold text-navy text-sm">{b.destination}</h3>
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${statusColor(b.status)}`}>{b.status}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${statusColor(b.paymentStatus)}`}>Pay: {b.paymentStatus}</span>
                    </div>
                    {b.clientId && (
                      <div className="text-xs text-navy/40 space-y-1">
                        <p>{b.clientId.name} · {b.clientId.email}</p>
                        {(b.clientId.phone || b.clientId.alternatePhone) && (
                          <p>
                            {b.clientId.phone ? `Contact: ${b.clientId.phone}` : ''}
                            {b.clientId.phone && b.clientId.alternatePhone ? ' · ' : ''}
                            {b.clientId.alternatePhone ? `Alt: ${b.clientId.alternatePhone}` : ''}
                          </p>
                        )}
                      </div>
                    )}
                    <p className="text-xs text-navy/30 mt-1">
                      {format(new Date(b.travelDate), 'dd MMM')} → {format(new Date(b.returnDate), 'dd MMM yyyy')} · {b.travelers} travelers
                    </p>
                  </div>
                  <div className="flex flex-col items-start sm:items-end gap-2 w-full sm:w-auto">
                    <p className="text-lg font-bold" style={{ color: '#2A7FD4' }}>{formatMoney(b.totalAmount, b.currency)}</p>
                    <div className="flex items-center gap-2 flex-wrap">
                      <select
                        value={b.status}
                        onChange={(e) => updateStatus(b._id, e.target.value)}
                        className="text-xs font-bold border border-navy/10 rounded-lg px-2 py-1.5 bg-transparent text-navy"
                      >
                        {b.paymentStatus !== 'paid' && <option value="pending">Pending</option>}
                        <option value="confirmed">Confirmed</option>
                        <option value="completed">Completed</option>
                        {b.paymentStatus !== 'paid' && <option value="cancelled">Cancelled</option>}
                      </select>
                      <Link href={`/admin/bookings/${b._id}`} className="px-3 py-1.5 rounded-lg text-xs font-bold bg-sky-brand/10 text-sky-brand">View</Link>
                      {b.status === 'pending' && (
                        <Link href={`/admin/bookings/${b._id}/edit`} className="px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-400/10 text-amber-600 border border-amber-400/20 hover:bg-amber-400/20 transition">Edit</Link>
                      )}
                      {b.paymentStatus !== 'paid' ? (
                        <button
                          className="px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-brand/10 text-amber-brand border border-amber-brand/20 hover:bg-amber-brand/20 transition"
                          onClick={() => {
                            const url = `${window.location.origin}/pay/${b._id}`;
                            navigator.clipboard.writeText(url);
                            toast.success('Payment link copied!');
                          }}
                        >
                          Send Payment Link
                        </button>
                      ) : (
                        <span className="px-3 py-1.5 rounded-lg text-xs font-bold bg-green-100 text-green-700">
                          Payment: Paid
                        </span>
                      )}
                    </div>

                    {b.paymentStatus !== 'paid' && (
                      <p className="text-[11px] text-navy/50">
                        Last payment status:{' '}
                        <b className="uppercase">{b.lastPaymentAttempt?.status || 'not attempted'}</b>
                        {b.lastPaymentAttempt?.createdAt ? ` • ${format(new Date(b.lastPaymentAttempt.createdAt), 'dd MMM yyyy, hh:mm a')}` : ''}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
