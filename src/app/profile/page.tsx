'use client';

import React, { useEffect, useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import AppLogo from '@/components/ui/AppLogo';
import { formatMoney, summarizeAmountsByCurrency } from '@/lib/currency';

interface ClientProfile {
  _id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  avatar: string;
  createdAt: string;
}

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
}

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [profile, setProfile] = useState<ClientProfile | null>(null);
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }
    if (status === 'authenticated' && session?.user?.role !== 'client') {
      router.push('/login');
      return;
    }

    if (status === 'authenticated') {
      Promise.all([
        fetch('/api/client/profile').then((r) => r.json()),
        fetch('/api/bookings').then((r) => r.json()),
      ])
        .then(([p, b]) => {
          setProfile(p);
          setBookings(Array.isArray(b) ? b : []);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [status, session, router]);

  if (loading || status === 'loading') {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <svg className="animate-spin h-8 w-8 text-navy/30" viewBox="0 0 24 24">
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
            fill="none"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
          />
        </svg>
      </div>
    );
  }

  const upcomingBookings = bookings.filter((b) => new Date(b.travelDate) > new Date());
  const totalSpent = bookings
    .filter((b) => b.paymentStatus === 'paid')
    .map((b) => ({ amount: b.totalAmount, currency: b.currency }));

  const statusColor = (s: string) => {
    switch (s) {
      case 'confirmed':
        return 'bg-green-100 text-green-700';
      case 'pending':
        return 'bg-amber-100 text-amber-700';
      case 'cancelled':
        return 'bg-red-100 text-red-700';
      case 'completed':
        return 'bg-blue-100 text-blue-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="min-h-screen bg-bg">
      {/* Top Bar */}
      <header
        className="bg-white border-b sticky top-0 z-30"
        style={{ borderColor: 'rgba(15,31,61,0.08)' }}
      >
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <AppLogo width={132} className="h-auto" />
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/book"
              className="hidden sm:inline-flex px-5 py-2 rounded-full text-white text-sm font-bold"
              style={{ backgroundColor: '#E8A020' }}
            >
              New Booking
            </Link>
            <button
              onClick={() => {
                signOut({ callbackUrl: '/' });
                toast.success('Signed out');
              }}
              className="text-sm font-semibold text-navy/50 hover:text-navy transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          {/* Profile Header */}
          <div className="bg-white rounded-4xl p-8 md:p-10 shadow-card mb-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center text-3xl font-bold text-white shrink-0"
                style={{ backgroundColor: '#0F1F3D' }}
              >
                {profile?.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-navy">{profile?.name}</h1>
                <p className="text-navy/50 text-sm">{profile?.email}</p>
                {profile?.company && <p className="text-navy/40 text-xs mt-1">{profile.company}</p>}
              </div>
              <div className="flex gap-3">
                <Link
                  href="/profile/edit"
                  className="px-5 py-2.5 rounded-full text-sm font-bold border border-navy/10 text-navy hover:bg-navy hover:text-white transition-all"
                >
                  Edit Profile
                </Link>
                <Link
                  href="/change-password"
                  className="px-5 py-2.5 rounded-full text-sm font-bold border border-navy/10 text-navy/50 hover:bg-navy hover:text-white transition-all"
                >
                  Change Password
                </Link>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-6">
            {[
              { stat: bookings.length.toString(), label: 'Total Trips', color: '#2A7FD4' },
              { stat: upcomingBookings.length.toString(), label: 'Upcoming', color: '#E8A020' },
              {
                stat: summarizeAmountsByCurrency(totalSpent),
                label: 'Total Spent',
                color: '#0F1F3D',
              },
            ].map((item) => (
              <div key={item.label} className="bg-white rounded-3xl p-6 shadow-card">
                <p className="text-3xl font-bold tracking-tight" style={{ color: item.color }}>
                  {item.stat}
                </p>
                <p className="text-xs font-semibold text-navy/40 uppercase tracking-wider mt-1">
                  {item.label}
                </p>
              </div>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
            <Link
              href="/book"
              className="bg-white rounded-3xl p-6 shadow-card hover:shadow-card-lg transition-shadow group"
            >
              <span className="text-2xl mb-3 block">✈️</span>
              <h3 className="font-bold text-navy group-hover:text-sky-brand transition-colors">
                New Booking
              </h3>
              <p className="text-xs text-navy/40 mt-1">Book your next trip</p>
            </Link>
            <Link
              href="/bookings"
              className="bg-white rounded-3xl p-6 shadow-card hover:shadow-card-lg transition-shadow group"
            >
              <span className="text-2xl mb-3 block">📋</span>
              <h3 className="font-bold text-navy group-hover:text-sky-brand transition-colors">
                My Bookings
              </h3>
              <p className="text-xs text-navy/40 mt-1">View all trip details</p>
            </Link>
            <Link
              href="/profile/edit"
              className="bg-white rounded-3xl p-6 shadow-card hover:shadow-card-lg transition-shadow group"
            >
              <span className="text-2xl mb-3 block">⚙️</span>
              <h3 className="font-bold text-navy group-hover:text-sky-brand transition-colors">
                Settings
              </h3>
              <p className="text-xs text-navy/40 mt-1">Update your profile</p>
            </Link>
          </div>

          {/* Recent Bookings */}
          {bookings.length > 0 && (
            <div className="bg-white rounded-4xl p-8 shadow-card">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-navy">Recent Bookings</h2>
                <Link
                  href="/bookings"
                  className="text-sm font-semibold"
                  style={{ color: '#2A7FD4' }}
                >
                  View All
                </Link>
              </div>
              <div className="space-y-3">
                {bookings.slice(0, 5).map((booking) => (
                  <Link
                    key={booking._id}
                    href={`/bookings/${booking._id}`}
                    className="flex items-center gap-4 p-4 rounded-2xl hover:bg-bg transition-colors"
                  >
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-lg"
                      style={{ backgroundColor: 'rgba(42,127,212,0.1)' }}
                    >
                      ✈️
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-navy text-sm truncate">{booking.destination}</p>
                      <p className="text-xs text-navy/40">
                        {format(new Date(booking.travelDate), 'dd MMM yyyy')} — {booking.travelers}{' '}
                        traveler(s)
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-navy text-sm">
                        {formatMoney(booking.totalAmount, booking.currency)}
                      </p>
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${statusColor(booking.status)}`}
                      >
                        {booking.status}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {bookings.length === 0 && (
            <div className="bg-white rounded-4xl p-12 shadow-card text-center">
              <span className="text-5xl mb-4 block">🌍</span>
              <h3 className="text-xl font-bold text-navy mb-2">No Bookings Yet</h3>
              <p className="text-navy/50 text-sm mb-6">
                Start planning your first corporate trip with us!
              </p>
              <Link
                href="/book"
                className="inline-block px-6 py-3 rounded-full text-white font-bold text-sm"
                style={{ backgroundColor: '#0F1F3D' }}
              >
                Book Now
              </Link>
            </div>
          )}

          {/* Member since */}
          {profile?.createdAt && (
            <p className="text-center text-xs text-navy/25 mt-8">
              Member since {format(new Date(profile.createdAt), 'MMMM yyyy')}
            </p>
          )}
        </motion.div>
      </div>
    </div>
  );
}
