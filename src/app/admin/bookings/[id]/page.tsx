'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { format } from 'date-fns';

interface BookingDetail {
  _id: string; destination: string; travelDate: string; returnDate: string; travelers: number; services: string[]; totalAmount: number;
  status: string; paymentStatus: string; razorpayOrderId: string; razorpayPaymentId: string; notes: string; createdAt: string;
  clientId?: { _id: string; name: string; email: string; phone: string; alternatePhone?: string; company: string };
  attachments?: Array<{ type: string; url: string; description?: string; name?: string }>;
}

interface PaymentAttempt {
  _id: string;
  amount: number;
  currency: string;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  status: string;
  createdAt: string;
}

export default function AdminBookingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [booking, setBooking] = useState<BookingDetail | null>(null);
  const [attempts, setAttempts] = useState<PaymentAttempt[]>([]);
  const [attemptsLoading, setAttemptsLoading] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch(`/api/bookings/${params.id}`).then(r => r.json()),
      fetch(`/api/admin/bookings/${params.id}/payments`).then(r => r.json()),
    ]).then(([bookingData, attemptsData]) => {
      if (bookingData._id) setBooking(bookingData); else router.push('/admin/bookings');
      if (Array.isArray(attemptsData)) setAttempts(attemptsData);
    }).catch(() => {
      toast.error('Failed to load booking details');
    }).finally(() => {
      setAttemptsLoading(false);
      setLoading(false);
    });
  }, [params.id, router]);

  const updateStatus = async (status: string) => {
    const res = await fetch(`/api/bookings/${params.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) });
    if (res.ok) { const d = await res.json(); setBooking(d); toast.success('Status updated'); } else { toast.error('Failed'); }
  };

  const statusColor = (s: string) => {
    switch (s) {
      case 'confirmed':
      case 'paid':
      case 'captured':
        return 'bg-green-100 text-green-700';
      case 'pending':
      case 'created':
        return 'bg-amber-100 text-amber-700';
      case 'cancelled':
      case 'failed':
      case 'refunded':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-blue-100 text-blue-700';
    }
  };

  if (loading) return <div className="flex items-center justify-center py-20"><svg className="animate-spin h-8 w-8 text-navy/20" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/></svg></div>;
  if (!booking) return null;

  return (
    <div className="max-w-3xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Link href="/admin/bookings" className="text-sm text-navy/40 hover:text-navy font-semibold mb-6 inline-block">← Back to Bookings</Link>

        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-navy">{booking.destination}</h2>
            <p className="text-navy/40 text-sm">Ref: {booking._id.slice(-8).toUpperCase()}</p>
          </div>
          <div className="flex gap-2">
            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${statusColor(booking.status)}`}>{booking.status}</span>
            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${statusColor(booking.paymentStatus)}`}>{booking.paymentStatus}</span>
          </div>
        </div>

        {/* Client Info */}
        {booking.clientId && (
          <div className="bg-white rounded-3xl p-6 shadow-card mb-5">
            <h3 className="font-bold text-navy mb-3 text-sm">Client Details</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><span className="text-navy/40">Name:</span> <span className="font-semibold text-navy ml-2">{booking.clientId.name}</span></div>
              <div><span className="text-navy/40">Email:</span> <span className="font-semibold text-navy ml-2">{booking.clientId.email}</span></div>
              {booking.clientId.phone && <div><span className="text-navy/40">Phone:</span> <span className="font-semibold text-navy ml-2">{booking.clientId.phone}</span></div>}
              {booking.clientId.alternatePhone && <div><span className="text-navy/40">Alternate:</span> <span className="font-semibold text-navy ml-2">{booking.clientId.alternatePhone}</span></div>}
              {booking.clientId.company && <div><span className="text-navy/40">Company:</span> <span className="font-semibold text-navy ml-2">{booking.clientId.company}</span></div>}
            </div>
          </div>
        )}

        {/* Trip Details */}
        <div className="bg-white rounded-3xl p-6 shadow-card mb-5">
          <h3 className="font-bold text-navy mb-4 text-sm">Trip Details</h3>
          <div className="space-y-3">
            {[
              { label: 'Travel Date', value: format(new Date(booking.travelDate), 'dd MMMM yyyy') },
              { label: 'Return Date', value: format(new Date(booking.returnDate), 'dd MMMM yyyy') },
              { label: 'Travelers', value: String(booking.travelers) },
              ...(booking.services.length > 0 ? [{ label: 'Services', value: booking.services.join(', ') }] : []),
              ...(booking.notes ? [{ label: 'Notes', value: booking.notes }] : []),
            ].map(r => (
              <div key={r.label} className="flex justify-between py-2 border-b text-sm" style={{ borderColor: 'rgba(15,31,61,0.06)' }}>
                <span className="text-navy/50">{r.label}</span>
                <span className="font-semibold text-navy text-right max-w-xs">{r.value}</span>
              </div>
            ))}
            <div className="flex justify-between pt-2">
              <span className="font-bold text-navy">Total Amount</span>
              <span className="text-2xl font-bold" style={{ color: '#2A7FD4' }}>₹{booking.totalAmount.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>

        {/* Uploaded Documents */}
        <div className="bg-white rounded-3xl p-6 shadow-card mb-5">
          <h3 className="font-bold text-navy mb-3 text-sm">Uploaded Documents</h3>
          {!booking.attachments || booking.attachments.length === 0 ? (
            <p className="text-sm text-navy/40">No documents uploaded.</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
              {booking.attachments.map((att, i) => {
                const url = att.url || '';
                const lowerUrl = url.toLowerCase();
                const isImage = /\.(png|jpe?g|gif|webp|bmp|svg)$/.test(lowerUrl);
                return (
                  <a
                    key={`${url}-${i}`}
                    href={url}
                    target="_blank"
                    rel="noopener"
                    className="block rounded-lg border border-navy/10 hover:border-sky-brand/40 transition overflow-hidden bg-bg"
                  >
                    <div className="px-2 py-1.5 border-b border-navy/10 bg-white">
                      <p className="text-[11px] font-bold uppercase tracking-wide text-navy/60">{att.type || 'Document'}</p>
                    </div>
                    <div className="h-20 flex items-center justify-center bg-white">
                      {isImage ? (
                        <img src={url} alt={att.name || att.type || 'Attachment'} className="max-h-full max-w-full object-cover" />
                      ) : (
                        <div className="text-center px-3">
                          <p className="text-2xl mb-1">📎</p>
                          <p className="text-xs font-semibold text-navy/70 break-all">{att.name || 'Open document'}</p>
                        </div>
                      )}
                    </div>
                    {att.description && (
                      <div className="px-2 py-1.5 text-[10px] text-navy/50 border-t border-navy/10 bg-white line-clamp-2">
                        {att.description}
                      </div>
                    )}
                  </a>
                );
              })}
            </div>
          )}
        </div>

        {/* Payment Info */}
        {(booking.razorpayOrderId || booking.razorpayPaymentId) && (
          <div className="bg-white rounded-3xl p-6 shadow-card mb-5">
            <h3 className="font-bold text-navy mb-3 text-sm">Payment Details</h3>
            <div className="space-y-2 text-sm">
              {booking.razorpayOrderId && <div><span className="text-navy/40">Order ID:</span> <span className="font-mono ml-2 text-navy">{booking.razorpayOrderId}</span></div>}
              {booking.razorpayPaymentId && <div><span className="text-navy/40">Payment ID:</span> <span className="font-mono ml-2 text-navy">{booking.razorpayPaymentId}</span></div>}
            </div>
          </div>
        )}

        {/* Payment Attempt History */}
        <div className="bg-white rounded-3xl p-6 shadow-card mb-5">
          <h3 className="font-bold text-navy mb-4 text-sm">Payment Attempt History</h3>
          {attemptsLoading ? (
            <p className="text-sm text-navy/40">Loading payment attempts...</p>
          ) : attempts.length === 0 ? (
            <p className="text-sm text-navy/40">No payment attempts yet.</p>
          ) : (
            <div className="space-y-3">
              {attempts.map((attempt, idx) => (
                <div
                  key={attempt._id}
                  className="rounded-2xl border p-4"
                  style={{ borderColor: 'rgba(15,31,61,0.08)' }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs font-bold text-navy/60 uppercase tracking-wide">
                      Attempt #{attempts.length - idx}
                    </p>
                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${statusColor(attempt.status)}`}>
                      {attempt.status}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                    <div><span className="text-navy/40">Date:</span> <span className="font-semibold text-navy ml-2">{format(new Date(attempt.createdAt), 'dd MMM yyyy, hh:mm a')}</span></div>
                    <div><span className="text-navy/40">Amount:</span> <span className="font-semibold text-navy ml-2">{attempt.currency} {attempt.amount.toLocaleString('en-IN')}</span></div>
                    <div><span className="text-navy/40">Order ID:</span> <span className="font-mono text-xs ml-2 text-navy">{attempt.razorpayOrderId || 'N/A'}</span></div>
                    <div><span className="text-navy/40">Payment ID:</span> <span className="font-mono text-xs ml-2 text-navy">{attempt.razorpayPaymentId || 'N/A'}</span></div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="bg-white rounded-3xl p-6 shadow-card">
          <h3 className="font-bold text-navy mb-4 text-sm">Update Status</h3>
          <div className="flex gap-2 flex-wrap">
            {(booking.paymentStatus === 'paid'
              ? ['confirmed', 'completed']
              : ['pending', 'confirmed', 'completed', 'cancelled']
            ).map(s => (
              <button key={s} onClick={() => updateStatus(s)} disabled={booking.status === s}
                className={`px-4 py-2 rounded-full text-xs font-bold capitalize transition-all ${booking.status === s ? 'bg-navy text-white' : 'border border-navy/10 text-navy/50 hover:bg-bg'}`}>
                {s}
              </button>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
