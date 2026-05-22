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
          <p className="mb-4">Last Updated: April 2026</p>
          <p className="mb-4">
            At Sky Birds, we value your trust and are committed to protecting your personal information. This policy outlines how we collect, use, and safeguard your data when you use our website and services.
          </p>
          <h2 className="text-xl font-semibold mt-8 mb-2">Information We Collect</h2>
          <p className="mb-4">To provide seamless travel and visa services, we collect:</p>
          <ul className="list-disc list-inside mb-4">
            <li><strong>Identity Data:</strong> Name, Passport details, Aadhaar/Govt ID, and photos (for visa processing).</li>
            <li><strong>Contact Data:</strong> Email address, phone number, and billing address.</li>
            <li><strong>Travel Data:</strong> Flight preferences, hotel bookings, and travel itineraries.</li>
            <li><strong>Financial Data:</strong> Payment card details (processed via secure, encrypted gateways).</li>
          </ul>
          <h2 className="text-xl font-semibold mt-8 mb-2">How We Use Your Information</h2>
          <p className="mb-4">We use your data strictly for:</p>
          <ul className="list-disc list-inside mb-4">
            <li><strong>Booking Services:</strong> Confirming flights, hotels, and transport.</li>
            <li><strong>Visa Processing:</strong> Submitting applications to embassies and consulates on your behalf.</li>
            <li><strong>Support:</strong> Providing 24/7 assistance and real-time travel updates.</li>
            <li><strong>Legal Compliance:</strong> Meeting regulatory requirements for international travel and taxation.</li>
          </ul>
          <h2 className="text-xl font-semibold mt-8 mb-2">Data Sharing & Payment Processing</h2>
          <p className="mb-4">We only share your information with essential third parties:</p>
          <ul className="list-disc list-inside mb-4">
            <li><strong>Payment Gateways:</strong> All direct payments are processed through secure, PCI-DSS compliant payment partners. We do not store your full credit/debit card numbers on our own servers.</li>
            <li><strong>Service Providers:</strong> Airlines, hotels, and transport operators to fulfill your bookings.</li>
            <li><strong>Government Authorities:</strong> Embassies and consulates for visa approvals.</li>
          </ul>
          <h2 className="text-xl font-semibold mt-8 mb-2">Data Security & Encryption</h2>
          <p className="mb-4">We take the security of your financial and personal data seriously:</p>
          <ul className="list-disc list-inside mb-4">
            <li><strong>SSL Encryption:</strong> Our website uses industry-standard Secure Sockets Layer (SSL) technology to encrypt all data transmitted during the checkout process.</li>
            <li><strong>Secure Storage:</strong> Sensitive documents (like Passports) are stored in encrypted environments, accessible only by authorized visa specialists.</li>
            <li><strong>Transaction Monitoring:</strong> We monitor for fraudulent activity to protect both your account and our platform.</li>
          </ul>
          <h2 className="text-xl font-semibold mt-8 mb-2">Data Retention</h2>
          <p className="mb-4">We retain your personal information only as long as necessary to fulfill your travel bookings or comply with legal and accounting obligations. Once the service is complete, sensitive documents are securely archived or deleted.</p>
          <h2 className="text-xl font-semibold mt-8 mb-2">Your Rights</h2>
          <p className="mb-4">You have the right to:</p>
          <ul className="list-disc list-inside mb-4">
            <li>Access the personal data we hold about you.</li>
            <li>Request correction of inaccurate data.</li>
            <li>Request deletion of your data (subject to legal requirements).</li>
          </ul>
          <h2 className="text-xl font-semibold mt-8 mb-2">Cookies</h2>
          <p className="mb-4">Our website uses cookies to enhance user experience, remember your preferences, and analyze site traffic to improve our services.</p>
          <h2 className="text-xl font-semibold mt-8 mb-2">Contact Us</h2>
          <p className="mb-4">For any questions regarding this Privacy Policy or your data, please contact us at:</p>
          <p className="mb-4">Email: <a href="mailto:skybirds@skybirds.net" className="text-blue-600 underline">skybirds@skybirds.net</a></p>
          <p className="mb-4">Office Address: 301 Addor Ambition,<br />
          Next to Indian Red Cross Shatbadi Bhavan,<br />
Nr. Navrang Circle, Navrangpura, Ahmedabad 380009.</p>

          
        </section>
      </main>
      <Footer />
    </>
  );
}
