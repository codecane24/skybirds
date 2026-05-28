'use client';

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import AppLogo from '@/components/ui/AppLogo';
import { formatPhoneNumber, PHONE_COUNTRY_OPTIONS, sanitizePhoneNumber } from '@/lib/phone';

interface DestinationOption {
  _id: string;
  city: string;
  country: string;
  tagline: string;
  imageUrl: string;
}
interface ServiceOption {
  _id: string;
  title: string;
  description: string;
  tag: string;
}

interface ClientProfile {
  phone?: string;
  countryCode?: string;
}

const basePrices: Record<string, number> = {
  Dubai: 45000,
  Singapore: 55000,
  Mumbai: 15000,
  London: 85000,
};

export default function BookPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [destinations, setDestinations] = useState<DestinationOption[]>([]);
  const [services, setServices] = useState<ServiceOption[]>([]);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    destination: '',
    travelDate: '',
    returnDate: '',
    travelers: 1,
    countryCode: '+91',
    phone: '',
    selectedServices: [] as string[],
    notes: '',
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }
    if (status === 'authenticated' && session?.user?.role !== 'client') {
      router.push('/login');
      return;
    }

    Promise.all([
      fetch('/api/destinations').then((r) => r.json()),
      fetch('/api/services').then((r) => r.json()),
      fetch('/api/client/profile').then((r) => r.json()),
    ]).then(([d, s, profile]) => {
      setDestinations(Array.isArray(d) ? d : []);
      setServices(Array.isArray(s) ? s : []);

      const clientProfile = profile as ClientProfile;
      if (clientProfile?.phone) {
        setForm((current) => ({
          ...current,
          phone: sanitizePhoneNumber(clientProfile.phone),
          countryCode: clientProfile.countryCode || current.countryCode,
        }));
      }
    });
  }, [status, session, router]);

  const basePrice = basePrices[form.destination] || 30000;
  const serviceCharges = form.selectedServices.length * 5000;
  const totalAmount = (basePrice + serviceCharges) * form.travelers;

  const toggleService = (title: string) => {
    setForm((f) => ({
      ...f,
      selectedServices: f.selectedServices.includes(title)
        ? f.selectedServices.filter((s) => s !== title)
        : [...f.selectedServices, title],
    }));
  };

  const handleSubmit = async () => {
    if (!form.destination || !form.travelDate || !form.returnDate) {
      toast.error('Please fill all required fields');
      return;
    }

    if (!form.phone.trim()) {
      toast.error('Please enter your contact number');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          destination: form.destination,
          travelDate: form.travelDate,
          returnDate: form.returnDate,
          travelers: form.travelers,
          phone: form.phone,
          countryCode: form.countryCode,
          services: form.selectedServices,
          totalAmount,
          notes: form.notes,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || 'Booking failed');
        setLoading(false);
        return;
      }

      // Create Razorpay order
      const orderRes = await fetch('/api/payments/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId: data._id }),
      });
      const orderData = await orderRes.json();

      if (!orderRes.ok) {
        toast.error('Payment order creation failed');
        setLoading(false);
        return;
      }

      // Open Razorpay
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'Sky Birds',
        description: `Booking: ${form.destination}`,
        order_id: orderData.orderId,
        handler: async (response: {
          razorpay_order_id: string;
          razorpay_payment_id: string;
          razorpay_signature: string;
        }) => {
          const verifyRes = await fetch('/api/payments/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(response),
          });
          const verifyData = await verifyRes.json();

          if (verifyRes.ok) {
            toast.success('Payment successful!');
            router.push(`/booking-success?id=${verifyData.bookingId}`);
          } else {
            toast.error('Payment verification failed');
          }
        },
        prefill: {
          name: session?.user?.name,
          email: session?.user?.email,
          contact: formatPhoneNumber(form.phone, form.countryCode),
        },
        theme: { color: '#0F1F3D' },
      };

      const rzp = new (
        window as unknown as { Razorpay: new (options: object) => { open: () => void } }
      ).Razorpay(options);
      rzp.open();
    } catch {
      toast.error('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg">
      {/* Razorpay Script */}
      <script src="https://checkout.razorpay.com/v1/checkout.js" async />

      <header
        className="bg-white border-b sticky top-0 z-30"
        style={{ borderColor: 'rgba(15,31,61,0.08)' }}
      >
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link
            href="/profile"
            className="text-sm font-semibold text-navy/50 hover:text-navy transition-colors"
          >
            ← Back
          </Link>
          <AppLogo width={128} className="h-auto" />
          <div className="w-16" />
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-10">
        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-3 mb-10">
          {[1, 2, 3].map((s) => (
            <React.Fragment key={s}>
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all ${step >= s ? 'text-white' : 'text-navy/30 bg-white border border-navy/10'}`}
                style={step >= s ? { backgroundColor: '#0F1F3D' } : {}}
              >
                {s}
              </div>
              {s < 3 && (
                <div
                  className={`w-16 h-0.5 rounded-full transition-all ${step > s ? 'bg-navy' : 'bg-navy/10'}`}
                />
              )}
            </React.Fragment>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* Step 1 — Select Destination & Dates */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <h2 className="text-3xl font-bold text-navy mb-2">Where are you going?</h2>
              <p className="text-navy/50 text-sm mb-8">Select your destination and travel dates.</p>

              {/* Destination Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {(destinations.length > 0
                  ? destinations
                  : [
                      {
                        _id: '1',
                        city: 'Dubai',
                        country: 'UAE',
                        tagline: 'MICE & corporate retreats',
                        imageUrl: '',
                      },
                      {
                        _id: '2',
                        city: 'Singapore',
                        country: 'Asia-Pacific',
                        tagline: 'Conference hubs',
                        imageUrl: '',
                      },
                      {
                        _id: '3',
                        city: 'Mumbai',
                        country: 'India',
                        tagline: 'Domestic corporate travel',
                        imageUrl: '',
                      },
                      {
                        _id: '4',
                        city: 'London',
                        country: 'United Kingdom',
                        tagline: 'European business travel',
                        imageUrl: '',
                      },
                    ]
                ).map((dest) => (
                  <button
                    key={dest._id}
                    onClick={() => setForm({ ...form, destination: dest.city })}
                    className={`p-5 rounded-3xl text-left transition-all border-2 ${form.destination === dest.city ? 'border-sky-brand bg-blue-50 shadow-card' : 'border-transparent bg-white shadow-card hover:shadow-card-lg'}`}
                  >
                    <span className="text-2xl mb-2 block">✈️</span>
                    <p className="font-bold text-navy text-sm">{dest.city}</p>
                    <p className="text-[11px] text-navy/40">{dest.country}</p>
                  </button>
                ))}
              </div>

              {/* Dates & Travelers */}
              <div className="bg-white rounded-4xl p-8 shadow-card">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-navy/50">
                      Travel Date *
                    </label>
                    <input
                      type="date"
                      value={form.travelDate}
                      onChange={(e) => setForm({ ...form, travelDate: e.target.value })}
                      className="form-input"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-navy/50">
                      Return Date *
                    </label>
                    <input
                      type="date"
                      value={form.returnDate}
                      onChange={(e) => setForm({ ...form, returnDate: e.target.value })}
                      className="form-input"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-navy/50">
                      Travelers
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={100}
                      value={form.travelers}
                      onChange={(e) =>
                        setForm({ ...form, travelers: parseInt(e.target.value) || 1 })
                      }
                      className="form-input"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end mt-8">
                <button
                  onClick={() => {
                    if (!form.destination || !form.travelDate || !form.returnDate) {
                      toast.error('Please select destination and dates');
                      return;
                    }
                    setStep(2);
                  }}
                  className="px-8 py-3.5 rounded-full text-white font-bold text-sm transition-all hover:shadow-card-lg"
                  style={{ backgroundColor: '#0F1F3D' }}
                >
                  Continue →
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 2 — Select Services */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <h2 className="text-3xl font-bold text-navy mb-2">Add Services</h2>
              <p className="text-navy/50 text-sm mb-8">
                Select additional services for your trip (optional).
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                {(services.length > 0
                  ? services
                  : [
                      {
                        _id: '1',
                        title: 'Flight Ticketing',
                        description: 'Domestic & international bookings',
                        tag: 'Air Travel',
                      },
                      {
                        _id: '2',
                        title: 'Hotel Booking',
                        description: 'Curated stays at corporate rates',
                        tag: 'Accommodation',
                      },
                      {
                        _id: '3',
                        title: 'Local Transport',
                        description: 'Airport transfers & cabs',
                        tag: 'Ground',
                      },
                      {
                        _id: '4',
                        title: 'Sightseeing',
                        description: 'Guided tours & experiences',
                        tag: 'Leisure',
                      },
                      {
                        _id: '5',
                        title: 'Visa Assistance',
                        description: 'Documentation support',
                        tag: 'Docs',
                      },
                      {
                        _id: '6',
                        title: '24/7 Support',
                        description: 'Dedicated travel desk',
                        tag: 'Support',
                      },
                    ]
                ).map((svc) => (
                  <button
                    key={svc._id}
                    onClick={() => toggleService(svc.title)}
                    className={`p-6 rounded-3xl text-left transition-all border-2 ${form.selectedServices.includes(svc.title) ? 'border-sky-brand bg-blue-50 shadow-card' : 'border-transparent bg-white shadow-card hover:shadow-card-lg'}`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-bold text-navy text-sm">{svc.title}</p>
                        <p className="text-xs text-navy/40 mt-1">{svc.description}</p>
                      </div>
                      <div
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${form.selectedServices.includes(svc.title) ? 'border-sky-brand bg-sky-brand' : 'border-navy/20'}`}
                      >
                        {form.selectedServices.includes(svc.title) && (
                          <svg
                            className="w-3 h-3 text-white"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={3}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        )}
                      </div>
                    </div>
                    <span className="inline-block mt-3 px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest bg-navy/5 text-navy/40">
                      {svc.tag}
                    </span>
                  </button>
                ))}
              </div>

              {/* Notes */}
              <div className="bg-white rounded-4xl p-8 shadow-card mb-8">
                <label className="text-[10px] font-bold uppercase tracking-widest text-navy/50 mb-2 block">
                  Special Requirements
                </label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  placeholder="Any special requirements for your trip..."
                  className="form-input min-h-[80px] resize-none"
                />
              </div>

              <div className="flex justify-between">
                <button
                  onClick={() => setStep(1)}
                  className="px-6 py-3.5 rounded-full text-sm font-bold text-navy/50 border border-navy/10 hover:bg-white transition-all"
                >
                  ← Back
                </button>
                <button
                  onClick={() => setStep(3)}
                  className="px-8 py-3.5 rounded-full text-white font-bold text-sm transition-all hover:shadow-card-lg"
                  style={{ backgroundColor: '#0F1F3D' }}
                >
                  Review Booking →
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 3 — Review & Pay */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <h2 className="text-3xl font-bold text-navy mb-2">Review & Pay</h2>
              <p className="text-navy/50 text-sm mb-8">
                Confirm your booking details before payment.
              </p>

              <div className="bg-white rounded-4xl p-8 shadow-card mb-6">
                <h3 className="font-bold text-navy mb-6 text-lg">Trip Summary</h3>
                <div className="space-y-4">
                  <div
                    className="flex justify-between py-3 border-b"
                    style={{ borderColor: 'rgba(15,31,61,0.06)' }}
                  >
                    <span className="text-navy/50 text-sm">Contact Number</span>
                    <span className="font-bold text-navy text-sm">{formatPhoneNumber(form.phone, form.countryCode) || 'Not added'}</span>
                  </div>
                  <div
                    className="flex justify-between py-3 border-b"
                    style={{ borderColor: 'rgba(15,31,61,0.06)' }}
                  >
                    <span className="text-navy/50 text-sm">Destination</span>
                    <span className="font-bold text-navy text-sm">{form.destination}</span>
                  </div>
                  <div
                    className="flex justify-between py-3 border-b"
                    style={{ borderColor: 'rgba(15,31,61,0.06)' }}
                  >
                    <span className="text-navy/50 text-sm">Travel Date</span>
                    <span className="font-bold text-navy text-sm">{form.travelDate}</span>
                  </div>
                  <div
                    className="flex justify-between py-3 border-b"
                    style={{ borderColor: 'rgba(15,31,61,0.06)' }}
                  >
                    <span className="text-navy/50 text-sm">Return Date</span>
                    <span className="font-bold text-navy text-sm">{form.returnDate}</span>
                  </div>
                  <div
                    className="flex justify-between py-3 border-b"
                    style={{ borderColor: 'rgba(15,31,61,0.06)' }}
                  >
                    <span className="text-navy/50 text-sm">Travelers</span>
                    <span className="font-bold text-navy text-sm">{form.travelers}</span>
                  </div>
                  {form.selectedServices.length > 0 && (
                    <div
                      className="flex justify-between py-3 border-b"
                      style={{ borderColor: 'rgba(15,31,61,0.06)' }}
                    >
                      <span className="text-navy/50 text-sm">Services</span>
                      <span className="font-bold text-navy text-sm text-right">
                        {form.selectedServices.join(', ')}
                      </span>
                    </div>
                  )}
                  {form.notes && (
                    <div
                      className="flex justify-between py-3 border-b"
                      style={{ borderColor: 'rgba(15,31,61,0.06)' }}
                    >
                      <span className="text-navy/50 text-sm">Notes</span>
                      <span className="text-navy/70 text-sm text-right max-w-xs">{form.notes}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-white rounded-4xl p-8 shadow-card mb-6">
                <h3 className="font-bold text-navy mb-5 text-lg">Contact for Updates</h3>
                <div className="grid grid-cols-1 sm:grid-cols-[180px_minmax(0,1fr)] gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-navy/50">
                      Country Code
                    </label>
                    <select
                      value={form.countryCode}
                      onChange={(e) => setForm({ ...form, countryCode: e.target.value })}
                      className="form-input"
                    >
                      {PHONE_COUNTRY_OPTIONS.map((option) => (
                        <option key={`${option.code}-${option.label}`} value={option.code}>{option.label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-navy/50">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: sanitizePhoneNumber(e.target.value) })}
                      className="form-input"
                      placeholder="9876543210"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="bg-white rounded-4xl p-8 shadow-card mb-8">
                <h3 className="font-bold text-navy mb-4">Price Breakdown</h3>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-navy/50">Base Price ({form.destination})</span>
                    <span className="text-navy">
                      ₹{basePrice.toLocaleString('en-IN')} × {form.travelers}
                    </span>
                  </div>
                  {form.selectedServices.length > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-navy/50">
                        Service Charges ({form.selectedServices.length} services)
                      </span>
                      <span className="text-navy">
                        ₹{(serviceCharges * form.travelers).toLocaleString('en-IN')}
                      </span>
                    </div>
                  )}
                  <div
                    className="border-t pt-3 mt-3 flex justify-between"
                    style={{ borderColor: 'rgba(15,31,61,0.06)' }}
                  >
                    <span className="font-bold text-navy">Total Amount</span>
                    <span className="text-2xl font-bold" style={{ color: '#2A7FD4' }}>
                      ₹{totalAmount.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex justify-between">
                <button
                  onClick={() => setStep(2)}
                  className="px-6 py-3.5 rounded-full text-sm font-bold text-navy/50 border border-navy/10 hover:bg-white transition-all"
                >
                  ← Back
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="px-8 py-3.5 rounded-full text-white font-bold text-sm transition-all hover:shadow-amber disabled:opacity-50"
                  style={{ backgroundColor: '#E8A020' }}
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
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
                      Processing...
                    </span>
                  ) : (
                    `Pay ₹${totalAmount.toLocaleString('en-IN')}`
                  )}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
