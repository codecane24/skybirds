import Header from '@/components/Header';
import Footer from '@/components/Footer';
import PageHero from '@/components/ui/PageHero';

export default function TermsPage() {
  return (
    <>
      <Header />
      <main className="bg-bg space-y-6 px-4 md:px-6 pb-6 pt-28">
        <PageHero
          eyebrow="Policy and Compliance"
          title="Terms and Conditions"
          subtitle="Please review the governing terms for bookings, payments, and service usage before proceeding."
          imageSrc="https://images.unsplash.com/photo-1634018877917-4381815e0747"
          imageAlt="Aerial view of clouds from aircraft window, bright daylight, blue sky, white cloud formations, calm and expansive atmosphere"
        />
        <section className="max-w-3xl mx-auto py-8 px-4 bg-white rounded-xl shadow">
          <h2 className="text-xl font-semibold mt-8 mb-2">General Terms</h2>
          <ul className="list-disc pl-6 mb-4">
            <li>All bookings are subject to availability and confirmation.</li>
            <li>Payments must be made in full before services are rendered.</li>
            <li>Cancellation and refund policies apply as per our guidelines.</li>
          </ul>
          <h2 className="text-xl font-semibold mt-8 mb-2">User Responsibilities</h2>
          <ul className="list-disc pl-6 mb-4">
            <li>Provide accurate information during booking and payment.</li>
            <li>Comply with all applicable laws and regulations.</li>
          </ul>
          <h2 className="text-xl font-semibold mt-8 mb-2">Contact Us</h2>
          <p>If you have any questions about these terms, please contact us at <a href="mailto:admin@skybirds.in" className="text-blue-600 underline">admin@skybirds.in</a>.</p>
        </section>
      </main>
      <Footer />
    </>
  );
}
