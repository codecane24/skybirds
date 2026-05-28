"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import toast from "react-hot-toast";
import AppIcon from "@/components/ui/AppIcon";
import { DEFAULT_CURRENCY, formatMoney, RAZORPAY_SUPPORTED_CURRENCIES } from "@/lib/currency";
import { PHONE_COUNTRY_OPTIONS, sanitizePhoneNumber } from "@/lib/phone";

interface BookingAttachment {
  type?: string;
  url?: string;
  imageUrl?: string;
  path?: string;
  name?: string;
  description?: string;
}

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
  conversionRate: number;
  typeDescriptions: Record<string, string>;
  attachments: BookingAttachment[];
}

const bookingTypes = [
  { label: "Ticket", value: "ticket" },
  { label: "Hotel", value: "hotel" },
  { label: "Other", value: "other" },
];

export default function EditBookingPage() {
  const { id } = useParams();
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
    conversionRate: 1,
    typeDescriptions: {},
    attachments: [],
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!id) return;
    fetch(`/api/bookings/${id}`)
      .then((r) => r.json())
      .then((data) => {
        setForm((prev) => ({
          ...prev,
          name: data.clientId?.name || "",
          email: data.clientId?.email || "",
          countryCode: data.clientId?.countryCode || "+91",
          phone: data.clientId?.phone || "",
          alternatePhone: data.clientId?.alternatePhone || "",
          members: data.travelers || 1,
          destination: data.destination || "",
          description: data.notes || "",
          bookingTypes: data.services || [],
          bookingAmount: data.totalAmount || "",
          currency: data.currency || DEFAULT_CURRENCY,
          conversionRate: data.conversionRate || 1,
          typeDescriptions: data.typeDescriptions || {},
          attachments: data.attachments || [],
        }));
        setLoading(false);
      });
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const target = e.target as HTMLInputElement;
    const { name, value, type } = target;
    const checked = target.checked;
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

  const handleTypeDescription = (type: string, value: string) => {
    setForm((prev) => ({
      ...prev,
      typeDescriptions: { ...prev.typeDescriptions, [type]: value },
    }));
  };

  const handleRemoveAttachment = (indexToRemove: number) => {
    setForm((prev) => ({
      ...prev,
      attachments: prev.attachments.filter((_, index) => index !== indexToRemove),
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    setErrors({});
    try {
      const newAttachments = [];
      for (const type of form.bookingTypes) {
        const file = form.uploads[type];
        if (file) {
          const fd = new FormData();
          fd.append('file', file);
          fd.append('type', type);

          const uploadRes = await fetch('/api/upload', { method: 'POST', body: fd });
          const uploadData = await uploadRes.json();

          if (!uploadRes.ok || !uploadData.url) {
            throw new Error(uploadData.error || `Failed to upload ${type} document`);
          }

          newAttachments.push({
            type,
            url: uploadData.url,
            name: file.name,
            description: form.typeDescriptions[type] || '',
          });
        }
      }

      const replacedTypes = new Set(newAttachments.map((a) => a.type));
      const existingAttachments = (form.attachments || []).filter((att) => !replacedTypes.has(att.type || ''));
      const attachments = [...existingAttachments, ...newAttachments];

      const res = await fetch(`/api/bookings/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          countryCode: form.countryCode,
          phone: form.phone,
          alternatePhone: form.alternatePhone,
          destination: form.destination,
          notes: form.description,
          services: form.bookingTypes,
          totalAmount: Number(form.bookingAmount),
          currency: form.currency,
          attachments,
        }),
      });
      if (res.ok) {
        toast.success("Booking updated!");
        router.push("/admin/bookings");
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to update booking");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update booking");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="py-20 text-center text-navy/40">Loading booking...</div>;

  return (
    <div className="max-w-5xl mx-auto bg-white rounded-4xl shadow-card-lg p-0 mt-12 mb-16 overflow-hidden border border-navy/10">
      <div className="bg-gradient-to-r from-sky-brand/10 to-amber-brand/10 px-8 py-7 border-b border-navy/10">
        <h2 className="text-3xl font-bold text-navy tracking-tight mb-1">Edit Booking</h2>
        <p className="text-navy/50 text-base">Update the details for this booking.</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-8 px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-[15px] font-semibold mb-2 text-navy">Name</label>
            <input name="name" value={form.name} disabled className="w-full rounded-xl border border-navy/10 bg-bg px-4 py-3 text-navy text-base" />
          </div>
          <div>
            <label className="block text-[15px] font-semibold mb-2 text-navy">Email</label>
            <input name="email" type="email" value={form.email} disabled className="w-full rounded-xl border border-navy/10 bg-bg px-4 py-3 text-navy text-base" />
          </div>
          <div>
            <label className="block text-[15px] font-semibold mb-2 text-navy">Primary Phone</label>
            <div className="grid grid-cols-[140px_minmax(0,1fr)] gap-2">
              <select name="countryCode" value={form.countryCode} onChange={handleChange} className="rounded-xl border border-navy/10 bg-white px-3 py-3 text-base text-navy outline-none transition focus:ring-2 focus:ring-sky-brand">
                {PHONE_COUNTRY_OPTIONS.map((option) => (
                  <option key={`${option.code}-${option.label}`} value={option.code}>{option.label}</option>
                ))}
              </select>
              <input name="phone" value={form.phone} onChange={handleChange} inputMode="numeric" className="min-w-[12ch] w-full rounded-xl border border-navy/10 bg-white px-4 py-3 text-base tabular-nums text-navy outline-none transition focus:ring-2 focus:ring-sky-brand" placeholder="987654321012" />
            </div>
          </div>
          <div>
            <label className="block text-[15px] font-semibold mb-2 text-navy">Alternate Number</label>
            <input name="alternatePhone" value={form.alternatePhone} onChange={handleChange} inputMode="numeric" className="min-w-[12ch] w-full rounded-xl border border-navy/10 bg-white px-4 py-3 text-base tabular-nums text-navy outline-none transition focus:ring-2 focus:ring-sky-brand" placeholder="Optional alternate" />
          </div>
          <div>
            <label className="block text-[15px] font-semibold mb-2 text-navy">Members</label>
            <input name="members" type="number" min="1" value={form.members} disabled className="w-full rounded-xl border border-navy/10 bg-bg px-4 py-3 text-navy text-base" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-[15px] font-semibold mb-2 text-navy">Destination</label>
            <input name="destination" value={form.destination} onChange={handleChange} required className="w-full rounded-xl border border-navy/10 bg-bg px-4 py-3 text-navy text-base focus:ring-2 focus:ring-sky-brand outline-none transition" placeholder="Destination" />
          </div>
          <div>
            <label className="block text-[15px] font-semibold mb-2 text-navy">Description <span className="text-navy/30">(optional)</span></label>
            <textarea name="description" value={form.description} onChange={handleChange} className="w-full rounded-xl border border-navy/10 bg-bg px-4 py-3 text-navy text-base focus:ring-2 focus:ring-sky-brand outline-none transition min-h-[48px]" placeholder="Booking notes or requirements" />
          </div>
        </div>
        <div>
          <label className="block text-[15px] font-semibold mb-2 text-navy">Booking For</label>
          <div className="flex gap-6 flex-wrap">
            {bookingTypes.map((type) => (
              <label key={type.value} className="flex items-center gap-2 text-base font-medium text-navy/80 cursor-pointer">
                <input
                  type="checkbox"
                  name="bookingTypes"
                  value={type.value}
                  checked={form.bookingTypes.includes(type.value)}
                  onChange={handleChange}
                  className="accent-sky-brand w-5 h-5 rounded border border-navy/20"
                />
                {type.label}
              </label>
            ))}
          </div>
        </div>
        {form.bookingTypes.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {form.bookingTypes.map((type) => (
              <div key={type} className="rounded-2xl border border-sky-brand/20 bg-sky-brand/5 p-5 mt-2">
                <label className="block text-xs font-semibold mb-1 text-navy">Upload Document for {type.charAt(0).toUpperCase() + type.slice(1)}</label>
                <input type="file" name={type} onChange={handleChange} className="w-full rounded-lg border border-navy/10 bg-white px-3 py-2 text-navy text-sm focus:ring-2 focus:ring-sky-brand outline-none transition" />
                <label className="block text-xs font-semibold mt-2 mb-1 text-navy">Description <span className="text-navy/30">(optional)</span></label>
                <input
                  type="text"
                  value={form.typeDescriptions[type] || ""}
                  onChange={(e) => handleTypeDescription(type, e.target.value)}
                  className="w-full rounded-lg border border-navy/10 bg-white px-3 py-2 text-navy text-sm focus:ring-2 focus:ring-sky-brand outline-none transition"
                  placeholder={`Details for ${type}`}
                />
              </div>
            ))}
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-[15px] font-semibold mb-2 text-navy">Currency</label>
            <select name="currency" value={form.currency} onChange={handleChange} className="w-full rounded-xl border border-navy/10 bg-bg px-4 py-3 text-navy text-base focus:ring-2 focus:ring-sky-brand outline-none transition">
              {RAZORPAY_SUPPORTED_CURRENCIES.map((currency) => (
                <option key={currency} value={currency}>{currency}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[15px] font-semibold mb-2 text-navy">Booking Amount</label>
            <input name="bookingAmount" type="number" min="0" step="0.01" value={form.bookingAmount} onChange={handleChange} required className="w-full rounded-xl border border-navy/10 bg-bg px-4 py-3 text-navy text-base focus:ring-2 focus:ring-sky-brand outline-none transition" placeholder={`Amount (${form.currency})`} />
          </div>
        </div>
        <div className="rounded-2xl border border-sky-brand/15 bg-sky-brand/5 px-4 py-3 text-sm text-navy/70">
          <p className="font-semibold text-navy">Entered Amount: {formatMoney(form.bookingAmount, form.currency)}</p>
          <p className="mt-1">Saved INR conversion rate: {form.conversionRate.toLocaleString('en-IN', { maximumFractionDigits: 6 })}</p>
          <p className="mt-1">If you save a non-INR currency, the latest INR to {form.currency} conversion rate will be stored with this booking.</p>
        </div>
        {/* Existing attachments */}
        <div className="mt-6">
          <label className="block text-[15px] font-semibold mb-2 text-navy">Existing Attachments</label>
          {form.attachments && form.attachments.length > 0 ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {form.attachments.map((att, i) => {
                const attachmentUrl = att.url || att.imageUrl || att.path || "";
                const lowerUrl = attachmentUrl.toLowerCase();
                const isImage = /\.(png|jpe?g|gif|webp|bmp|svg)$/.test(lowerUrl);

                if (!attachmentUrl) {
                  return (
                    <div key={i} className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
                      File URL missing ({att.type || 'Document'})
                    </div>
                  );
                }

                return (
                  <div key={i} className="relative overflow-hidden rounded-lg border border-navy/10 bg-bg transition hover:border-sky-brand/40">
                    <button
                      type="button"
                      onClick={() => handleRemoveAttachment(i)}
                      className="absolute right-2 top-2 z-10 inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/70 bg-white/95 text-navy shadow-sm transition hover:bg-red-50 hover:text-red-600"
                      aria-label={`Remove ${att.name || att.type || 'attachment'}`}
                    >
                      <AppIcon name="XMarkIcon" size={16} />
                    </button>
                    <a
                      href={attachmentUrl}
                      target="_blank"
                      rel="noopener"
                      className="block"
                    >
                      <div className="px-2 py-1.5 border-b border-navy/10 bg-white pr-12">
                        <p className="text-[11px] font-bold uppercase tracking-wide text-navy/60">{att.type || 'Document'}</p>
                      </div>
                      <div className="h-24 flex items-center justify-center bg-white">
                        {isImage ? (
                          <img src={attachmentUrl} alt={att.name || att.type || 'Attachment'} className="max-h-full max-w-full object-cover" />
                        ) : (
                          <div className="text-center px-3">
                            <AppIcon name="PaperClipIcon" size={24} className="mx-auto mb-1 text-navy/50" />
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
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-navy/40">No attachments found for this booking.</p>
          )}
        </div>
        <div className="pt-6 flex justify-end">
          <button type="submit" className="px-8 py-3 rounded-full bg-sky-brand text-white font-bold text-lg shadow-amber hover:bg-sky-brand/90 transition-all min-w-[180px]" disabled={submitting}>
            {submitting ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
