"use client";


import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import toast from "react-hot-toast";
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import PageHero from '@/components/ui/PageHero';


export default function PayBookingPage() {
  const { bookingId } = useParams();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState("");

  useEffect(() => {
    if (!bookingId) return;
    fetch(`/api/bookings/${bookingId}`)
      .then((r) => r.json())
      .then((data) => {
        setBooking(data);
        setPaymentStatus(data.paymentStatus);
        setLoading(false);
      });
  }, [bookingId]);

  const handlePay = async () => {
    setPaying(true);
    try {
      const res = await fetch("/api/payments/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create order");
      // Load Razorpay script
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      script.onload = () => {
        const options = {
          key: data.keyId || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
          amount: data.amount,
          currency: data.currency,
          order_id: data.orderId,
          name: "SkyBirds Booking Payment",
          description: `Booking #${bookingId}`,
          handler: function (response) {
            fetch('/api/payments/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            })
              .then(async (verifyRes) => {
                const verifyData = await verifyRes.json();
                if (!verifyRes.ok) {
                  throw new Error(verifyData.error || 'Payment verification failed');
                }
                toast.success('Payment successful!');
                setPaymentStatus('paid');
              })
              .catch((verifyErr) => {
                toast.error(verifyErr.message || 'Payment verification failed');
              });
          },
          prefill: {
            email: booking?.clientId?.email,
            name: booking?.clientId?.name,
          },
        };
        // @ts-ignore
        const rzp = new window.Razorpay(options);
        rzp.open();
      };
      document.body.appendChild(script);
    } catch (err) {
      toast.error(err.message || "Payment failed");
    } finally {
      setPaying(false);
    }
  };

  return (
    <>
      <Header />
      <main className="bg-bg space-y-6 px-4 md:px-6 pb-6 pt-28">
        <PageHero
          eyebrow="Secure Checkout"
          title="Booking Payment"
          subtitle="Complete payment with confidence using encrypted checkout and instant verification for your booking."
          imageSrc="https://images.unsplash.com/photo-1506744038136-46273834b3fb"
          imageAlt="Payment for booking, travel, sky, clouds, airplane window"
        />
        {/* Payment card section */}
        <section className="max-w-xl mx-auto bg-white rounded-4xl shadow-card-lg p-0 mb-16 overflow-hidden border border-navy/10">
          {loading ? (
            <div className="py-20 text-center text-navy/40">Loading booking...</div>
          ) : !booking ? (
            <div className="py-20 text-center text-red-500">Booking not found.</div>
          ) : (
            <>
              <div className="bg-gradient-to-r from-sky-brand/10 to-amber-brand/10 px-8 py-7 border-b border-navy/10">
                <h2 className="text-2xl font-bold text-navy tracking-tight mb-1">Booking Details</h2>
                <p className="text-navy/50 text-base">Booking ID: {bookingId}</p>
              </div>
              <div className="px-8 py-10 space-y-6">
                <div className="flex flex-col gap-2">
                  <span className="text-navy/60 text-sm">Name: <b>{booking.clientId?.name}</b></span>
                  <span className="text-navy/60 text-sm">Email: <b>{booking.clientId?.email}</b></span>
                  <span className="text-navy/60 text-sm">Destination: <b>{booking.destination}</b></span>
                  <span className="text-navy/60 text-sm">Amount: <b>₹{booking.totalAmount?.toLocaleString("en-IN")}</b></span>
                  <span className="text-navy/60 text-sm">Status: <b className={paymentStatus === 'paid' ? 'text-green-600' : 'text-amber-600'}>{paymentStatus}</b></span>
                </div>
                {/* Attachments section */}
                {booking.attachments && booking.attachments.length > 0 && (
                  <div className="mt-6">
                    <label className="block text-[15px] font-semibold mb-2 text-navy">Attachments</label>
                    <ul className="space-y-2">
                      {booking.attachments.map((att, i) => (
                        <li key={i} className="flex items-center gap-3 text-sm">
                          <span className="font-bold text-navy/70">{att.type}</span>
                          <a href={att.url} target="_blank" rel="noopener" className="text-sky-brand underline">View Attachment</a>
                          {att.description && <span className="text-navy/40">{att.description}</span>}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {paymentStatus !== "paid" && (
                  <button
                    className="px-8 py-3 rounded-full bg-sky-brand text-white font-bold text-lg shadow-amber hover:bg-sky-brand/90 transition-all min-w-[180px]"
                    onClick={handlePay}
                    disabled={paying}
                  >
                    {paying ? "Processing..." : "Pay Now"}
                  </button>
                )}
                {paymentStatus === "paid" && (
                  <div className="space-y-2">
                    <div className="text-green-700 font-bold text-lg">Payment Successful!</div>
                    <div className="text-sm text-navy/70">
                      Payment Ref No: <b>{booking.razorpayPaymentId || 'N/A'}</b>
                    </div>
                    <div className="text-sm text-navy/70">
                      Razorpay Order No: <b>{booking.razorpayOrderId || 'N/A'}</b>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </section>
      </main>
      <Footer />
    </>
  );
}
