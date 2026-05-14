import Header from '@/components/Header';
import Footer from '@/components/Footer';
import PageHero from '@/components/ui/PageHero';

export default function PrivacyPolicyPage() {
  return (
    <>
      <Header />
      <main className="bg-bg space-y-6 px-4 md:px-6 pb-6 pt-28">
        <PageHero
          eyebrow="Trust and Transparency"
          title="Privacy Policy"
          subtitle="How we protect your information, process your data responsibly, and keep your travel operations secure."
          imageSrc="https://images.unsplash.com/photo-1634018877917-4381815e0747"
          imageAlt="Aerial view of clouds from aircraft window, bright daylight, blue sky, white cloud formations, calm and expansive atmosphere"
        />
        <section className="max-w-3xl mx-auto py-8 px-4 bg-white rounded-xl shadow">
          <h2 className="text-xl font-semibold mt-8 mb-2">Information We Collect</h2>
          <ul className="list-disc pl-6 mb-4">
            <li>Personal information you provide (name, email, etc.)</li>
            <li>Usage data and cookies</li>
            <li>Payment and transaction details</li>
          </ul>
          <h2 className="text-xl font-semibold mt-8 mb-2">How We Use Information</h2>
          <ul className="list-disc pl-6 mb-4">
            <li>To provide and improve our services</li>
            <li>To process payments and bookings</li>
            <li>To communicate with you</li>
            <li>To comply with legal obligations</li>
          </ul>
          <h2 className="text-xl font-semibold mt-8 mb-2">Contact Us</h2>
          <p>If you have any questions about this Privacy Policy, please contact us at <a href="mailto:admin@skybirds.in" className="text-blue-600 underline">admin@skybirds.in</a>.</p>
        </section>
      </main>
      <Footer />
    </>
  );
}
