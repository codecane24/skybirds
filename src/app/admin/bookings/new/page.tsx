"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { format } from "date-fns";
import AppIcon from "@/components/ui/AppIcon";
import { DEFAULT_CURRENCY, formatMoney, RAZORPAY_SUPPORTED_CURRENCIES } from "@/lib/currency";
import { formatPhoneNumber, PHONE_COUNTRY_OPTIONS, sanitizePhoneNumber } from "@/lib/phone";

interface BookingFormState {
  name: string;
  email: string;
  countryCode: string;
  phone: string;
  alternatePhone: string;
  members: number;
  destination: string;
  description: string;
  bookingTypes: string[];
  uploads: Record<string, File | undefined>;
  bookingAmount: string;
  currency: string;
  typeDescriptions: Record<string, string>;
}

const bookingTypes = [
  { label: "Ticket", value: "ticket" },
  { label: "Hotel", value: "hotel" },
  { label: "Other", value: "other" },
];

const bookingTypeIcons: Record<string, string> = {
  ticket: "TicketIcon",
  hotel: "BuildingOffice2Icon",
  other: "Squares2X2Icon",
};

interface PendingBooking {
  _id: string;
  destination: string;
  travelers: number;
  totalAmount: number;
  currency?: string;
  conversionRate?: number;
  status: string;
  paymentStatus: string;
  createdAt: string;
  clientId?: { name: string; email: string; phone: string; countryCode?: string; alternatePhone?: string };
}

export default function AdminBookingFormPage() {
  const router = useRouter();
  const [form, setForm] = useState<BookingFormState>({
    name: "",
    email: "",
    countryCode: "+91",
    phone: "",
    alternatePhone: "",
    members: 1,
    destination: "",
    description: "",
    bookingTypes: [],
    uploads: {},
    bookingAmount: "",
    currency: DEFAULT_CURRENCY,
    typeDescriptions: {},
  });
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [pendingBookings, setPendingBookings] = useState<PendingBooking[]>([]);
  const [checkingDuplicates, setCheckingDuplicates] = useState(false);
  const [duplicateChecked, setDuplicateChecked] = useState(false);
  const [allowDuplicate, setAllowDuplicate] = useState(false);

  const resetDuplicateState = () => {
    setPendingBookings([]);
    setDuplicateChecked(false);
    setAllowDuplicate(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const target = e.target as HTMLInputElement;
    const { name, value, type } = target;
    const checked = target.checked;
    if (name === "email" || name === "phone" || name === "alternatePhone" || name === "countryCode") {
      resetDuplicateState();
    }

    if (type === "checkbox") {
      setForm((prev) => {
        const arr = prev.bookingTypes.includes(value)
          ? prev.bookingTypes.filter((v) => v !== value)
          : [...prev.bookingTypes, value];
        return { ...prev, bookingTypes: arr };
      });
    } else if (type === "file") {
      setForm((prev) => ({
        ...prev,
        uploads: { ...prev.uploads, [name]: target.files?.[0] },
      }));
    } else {
      setForm((prev) => ({
        ...prev,
        [name]: name === "members" ? Number(value) : (name === "phone" || name === "alternatePhone" ? sanitizePhoneNumber(value) : value),
      }));
    }
  };

  const checkPendingBookings = async () => {
    if (!form.email.trim() && !form.phone.trim() && !form.alternatePhone.trim()) {
      toast.error("Enter email or phone first");
      return;
    }

    setCheckingDuplicates(true);
    try {
      const query = new URLSearchParams();
      if (form.email.trim()) query.set("email", form.email.trim());
      if (form.phone.trim()) query.set("phone", form.phone.trim());
      if (form.phone.trim()) query.set("countryCode", form.countryCode);
      if (form.alternatePhone.trim()) query.set("alternatePhone", form.alternatePhone.trim());

      const res = await fetch(`/api/admin/bookings?${query.toString()}`);
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Failed to check pending bookings");
        return;
      }

      const matches = Array.isArray(data.pendingBookings) ? data.pendingBookings : [];
      setPendingBookings(matches);
      setDuplicateChecked(true);
      setAllowDuplicate(matches.length === 0);

      if (matches.length > 0) {
        toast.error("Found pending booking(s). Review before creating new one.");
      } else {
        toast.success("No pending bookings found. You can continue.");
      }
    } catch {
      toast.error("Failed to check pending bookings");
    } finally {
      setCheckingDuplicates(false);
    }
  };

  const handleTypeDescription = (type: string, value: string) => {
    setForm((prev) => ({
      ...prev,
      typeDescriptions: { ...prev.typeDescriptions, [type]: value },
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    setErrors({});

    if (!duplicateChecked) {
      toast.error("Check existing pending bookings first");
      setSubmitting(false);
      return;
    }

    if (pendingBookings.length > 0 && !allowDuplicate) {
      toast.error("Edit existing pending booking or choose Continue With New");
      setSubmitting(false);
      return;
    }

    try {
      // Upload all files first
      const attachments = [];
      for (const type of form.bookingTypes) {
        const file = form.uploads[type];
        if (file) {
          const fd = new FormData();
          fd.append('file', file);
          fd.append('type', type);
          const uploadRes = await fetch('/api/upload', { method: 'POST', body: fd });
          const uploadData = await uploadRes.json();
          if (uploadRes.ok && uploadData.url) {
            attachments.push({
              type,
              url: uploadData.url,
              name: file.name,
              description: form.typeDescriptions[type] || '',
            });
          }
        }
      }
      const res = await fetch('/api/admin/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          countryCode: form.countryCode,
          phone: form.phone,
          alternatePhone: form.alternatePhone,
          members: form.members,
          destination: form.destination,
          description: form.description,
          bookingTypes: form.bookingTypes,
          bookingAmount: form.bookingAmount,
          currency: form.currency,
          typeDescriptions: form.typeDescriptions,
          attachments,
          allowDuplicate,
        }),
      });
      if (res.ok) {
        toast.success('Booking created!');
        router.push('/admin/bookings');
      } else {
        const data = await res.json();
        if (res.status === 409 && Array.isArray(data.pendingBookings)) {
          setPendingBookings(data.pendingBookings);
          setDuplicateChecked(true);
          setAllowDuplicate(false);
        }
        toast.error(data.error || 'Failed to create booking');
      }
    } catch (err) {
      toast.error('Failed to create booking');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto mt-10 mb-16 px-4 md:px-0">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <div className="rounded-4xl overflow-hidden border border-navy/10 shadow-card-lg bg-white">
          <div className="px-8 py-8 border-b border-navy/10" style={{ background: "linear-gradient(110deg, rgba(42,127,212,0.12), rgba(232,160,32,0.15))" }}>
            <h2 className="text-3xl font-bold text-navy tracking-tight flex items-center gap-2">
              <AppIcon name="ClipboardDocumentCheckIcon" size={28} className="text-sky-brand" />
              Create Booking
            </h2>
            <p className="text-navy/60 mt-2 text-sm">Start with client contact check to avoid duplicate pending bookings.</p>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-8">
            <section className="rounded-2xl border border-navy/10 bg-bg/60 p-5">
              <h3 className="text-sm font-bold text-navy uppercase tracking-wide mb-4 flex items-center gap-2">
                <AppIcon name="MagnifyingGlassCircleIcon" size={18} className="text-sky-brand" />
                Step 1: Client Lookup
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-navy/60 mb-1 flex items-center gap-1.5">
                    <AppIcon name="EnvelopeIcon" size={14} className="text-navy/50" />
                    Email
                  </label>
                  <input name="email" type="email" value={form.email} onChange={handleChange} className="w-full rounded-xl border border-navy/10 bg-white px-4 py-3 text-sm text-navy outline-none focus:ring-2 focus:ring-sky-brand" placeholder="client@email.com" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-navy/60 mb-1 flex items-center gap-1.5">
                    <AppIcon name="DevicePhoneMobileIcon" size={14} className="text-navy/50" />
                    Mobile Number
                  </label>
                  <div className="grid grid-cols-[140px_minmax(0,1fr)] gap-2">
                    <select name="countryCode" value={form.countryCode} onChange={handleChange} className="rounded-xl border border-navy/10 bg-white px-3 py-3 text-sm text-navy outline-none focus:ring-2 focus:ring-sky-brand">
                      {PHONE_COUNTRY_OPTIONS.map((option) => (
                        <option key={`${option.code}-${option.label}`} value={option.code}>{option.label}</option>
                      ))}
                    </select>
                    <input name="phone" value={form.phone} onChange={handleChange} className="min-w-[12ch] w-full rounded-xl border border-navy/10 bg-white px-4 py-3 text-sm tabular-nums text-navy outline-none focus:ring-2 focus:ring-sky-brand" placeholder="987654321012" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-navy/60 mb-1 flex items-center gap-1.5">
                    <AppIcon name="PhoneArrowUpRightIcon" size={14} className="text-navy/50" />
                    Alternate Number
                  </label>
                  <input name="alternatePhone" value={form.alternatePhone} onChange={handleChange} className="w-full rounded-xl border border-navy/10 bg-white px-4 py-3 text-sm text-navy outline-none focus:ring-2 focus:ring-sky-brand" placeholder="Optional alternate" />
                </div>
                <div className="flex items-end">
                  <button type="button" onClick={checkPendingBookings} disabled={checkingDuplicates} className="w-full rounded-xl px-4 py-3 text-sm font-bold text-white bg-navy hover:bg-navy/90 transition disabled:opacity-60">
                    <span className="inline-flex items-center gap-1.5">
                      <AppIcon name="ShieldCheckIcon" size={16} className="text-white" />
                      {checkingDuplicates ? "Checking..." : "Check Existing Pending"}
                    </span>
                  </button>
                </div>
              </div>

              {duplicateChecked && pendingBookings.length === 0 && (
                <div className="mt-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                  <span className="inline-flex items-center gap-1.5">
                    <AppIcon name="CheckCircleIcon" size={16} className="text-green-600" />
                    No pending booking found for this client. You can continue with a new booking.
                  </span>
                </div>
              )}

              {pendingBookings.length > 0 && (
                <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4">
                  <p className="text-sm font-bold text-amber-700 mb-3">Pending booking(s) found. Edit an existing one or continue with new.</p>
                  <div className="space-y-2">
                    {pendingBookings.map((b) => (
                      <div key={b._id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 rounded-lg bg-white border border-amber-100 px-3 py-2">
                        <div className="text-xs text-navy/70">
                          <p className="font-semibold text-navy">{b.destination} - {format(new Date(b.createdAt), 'dd MMM yyyy, hh:mm a')}</p>
                          <p>Travelers: {b.travelers} | Amount: {formatMoney(b.totalAmount, b.currency)}</p>
                          {b.clientId?.phone && <p>Phone: {formatPhoneNumber(b.clientId.phone, b.clientId.countryCode)}</p>}
                        </div>
                        <Link href={`/admin/bookings/${b._id}/edit`} className="inline-block text-center px-3 py-1.5 rounded-lg text-xs font-bold bg-sky-brand/10 text-sky-brand">
                          Edit Existing
                        </Link>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 flex justify-end">
                    <button type="button" onClick={() => setAllowDuplicate(true)} className="px-4 py-2 rounded-lg text-xs font-bold bg-amber-brand/10 text-amber-brand border border-amber-brand/20 hover:bg-amber-brand/20 transition">
                      <span className="inline-flex items-center gap-1.5">
                        <AppIcon name="ArrowRightCircleIcon" size={14} className="text-amber-brand" />
                        Continue With New Booking
                      </span>
                    </button>
                  </div>
                </div>
              )}
            </section>

            <section className="rounded-2xl border border-navy/10 p-5">
              <h3 className="text-sm font-bold text-navy uppercase tracking-wide mb-4 flex items-center gap-2">
                <AppIcon name="ClipboardDocumentListIcon" size={18} className="text-sky-brand" />
                Step 2: Booking Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-navy/60 mb-1 flex items-center gap-1.5">
                    <AppIcon name="UserIcon" size={14} className="text-navy/50" />
                    Client Name
                  </label>
                  <input name="name" value={form.name} onChange={handleChange} required className="w-full rounded-xl border border-navy/10 bg-white px-4 py-3 text-sm text-navy outline-none focus:ring-2 focus:ring-sky-brand" placeholder="Client full name" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-navy/60 mb-1 flex items-center gap-1.5">
                    <AppIcon name="UsersIcon" size={14} className="text-navy/50" />
                    Members
                  </label>
                  <input name="members" type="number" min="1" value={form.members} onChange={handleChange} required className="w-full rounded-xl border border-navy/10 bg-white px-4 py-3 text-sm text-navy outline-none focus:ring-2 focus:ring-sky-brand" placeholder="No. of travelers" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-navy/60 mb-1 flex items-center gap-1.5">
                    <AppIcon name="MapPinIcon" size={14} className="text-navy/50" />
                    Destination
                  </label>
                  <input name="destination" value={form.destination} onChange={handleChange} required className="w-full rounded-xl border border-navy/10 bg-white px-4 py-3 text-sm text-navy outline-none focus:ring-2 focus:ring-sky-brand" placeholder="Destination city/country" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-navy/60 mb-1 flex items-center gap-1.5">
                    <AppIcon name="CurrencyRupeeIcon" size={14} className="text-navy/50" />
                    Currency
                  </label>
                  <select name="currency" value={form.currency} onChange={handleChange} className="w-full rounded-xl border border-navy/10 bg-white px-4 py-3 text-sm text-navy outline-none focus:ring-2 focus:ring-sky-brand">
                    {RAZORPAY_SUPPORTED_CURRENCIES.map((currency) => (
                      <option key={currency} value={currency}>{currency}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-navy/60 mb-1 flex items-center gap-1.5">
                    <AppIcon name="BanknotesIcon" size={14} className="text-navy/50" />
                    Booking Amount
                  </label>
                  <input name="bookingAmount" type="number" min="0" step="0.01" value={form.bookingAmount} onChange={handleChange} required className="w-full rounded-xl border border-navy/10 bg-white px-4 py-3 text-sm text-navy outline-none focus:ring-2 focus:ring-sky-brand" placeholder={`Amount in ${form.currency}`} />
                </div>
              </div>

              <div className="mt-3 rounded-xl border border-sky-brand/15 bg-sky-brand/5 px-4 py-3 text-xs text-navy/70">
                <p className="font-semibold text-navy">Entered Amount: {formatMoney(form.bookingAmount, form.currency)}</p>
                <p className="mt-1">If the selected currency is not INR, the current INR to {form.currency} conversion rate will be fetched and stored when you create the booking.</p>
              </div>

              <div className="mt-4">
                <label className="block text-xs font-semibold text-navy/60 mb-1 flex items-center gap-1.5">
                  <AppIcon name="DocumentTextIcon" size={14} className="text-navy/50" />
                  Description
                </label>
                <textarea name="description" value={form.description} onChange={handleChange} className="w-full rounded-xl border border-navy/10 bg-white px-4 py-3 text-sm text-navy outline-none focus:ring-2 focus:ring-sky-brand min-h-[80px]" placeholder="Booking notes, preferences, or requirements" />
              </div>
            </section>

            <section className="rounded-2xl border border-navy/10 p-5">
              <h3 className="text-sm font-bold text-navy uppercase tracking-wide mb-4 flex items-center gap-2">
                <AppIcon name="PaperClipIcon" size={18} className="text-sky-brand" />
                Step 3: Services and Documents
              </h3>
              <div className="flex flex-wrap gap-5 mb-4">
                {bookingTypes.map((type) => (
                  <label key={type.value} className="inline-flex items-center gap-2 text-sm font-semibold text-navy/80 cursor-pointer">
                    <input
                      type="checkbox"
                      name="bookingTypes"
                      value={type.value}
                      checked={form.bookingTypes.includes(type.value)}
                      onChange={handleChange}
                      className="accent-sky-brand w-4 h-4"
                    />
                    <AppIcon name={bookingTypeIcons[type.value] || "Squares2X2Icon"} size={14} className="text-navy/50" />
                    {type.label}
                  </label>
                ))}
              </div>

              {form.bookingTypes.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {form.bookingTypes.map((type) => (
                    <div key={type} className="rounded-xl border border-sky-brand/20 bg-sky-brand/5 p-4">
                      <label className="block text-xs font-semibold mb-1 text-navy flex items-center gap-1.5">
                        <AppIcon name="ArrowUpTrayIcon" size={13} className="text-sky-brand" />
                        Upload {type.charAt(0).toUpperCase() + type.slice(1)} Document
                      </label>
                      <input type="file" name={type} onChange={handleChange} className="w-full rounded-lg border border-navy/10 bg-white px-3 py-2 text-xs text-navy outline-none focus:ring-2 focus:ring-sky-brand" />
                      <label className="block text-xs font-semibold mt-3 mb-1 text-navy flex items-center gap-1.5">
                        <AppIcon name="ChatBubbleLeftEllipsisIcon" size={13} className="text-sky-brand" />
                        Description
                      </label>
                      <input
                        type="text"
                        value={form.typeDescriptions[type] || ""}
                        onChange={(e) => handleTypeDescription(type, e.target.value)}
                        className="w-full rounded-lg border border-navy/10 bg-white px-3 py-2 text-xs text-navy outline-none focus:ring-2 focus:ring-sky-brand"
                        placeholder={`Details for ${type}`}
                      />
                    </div>
                  ))}
                </div>
              )}
            </section>

            <div className="pt-2 flex justify-end">
              <button type="submit" className="px-8 py-3 rounded-full bg-sky-brand text-white font-bold text-sm shadow-amber hover:bg-sky-brand/90 transition-all min-w-[190px] disabled:opacity-60" disabled={submitting}>
                <span className="inline-flex items-center gap-1.5">
                  <AppIcon name="CheckBadgeIcon" size={16} className="text-white" />
                  {submitting ? "Saving..." : "Create Booking"}
                </span>
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
