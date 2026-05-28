import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import HeroSection from './components/HeroSection';
import ServicesSection from './components/ServicesSection';
import WhyUsSection from './components/WhyUsSection';
import DestinationsSection from './components/DestinationsSection';
import TestimonialsSection from './components/TestimonialsSection';
import ContactSection from './components/ContactSection';

export default function HomePage() {
  return (
    <>
      <Header />
      <main className="bg-bg space-y-4 px-3 pb-4 sm:px-4 md:space-y-6 md:px-6 md:pb-6">
        <HeroSection />
        <ServicesSection />
        <WhyUsSection />
        <DestinationsSection />
        <TestimonialsSection />
        <ContactSection />
      </main>
      <Footer />
    </>
  );
}