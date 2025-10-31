import { Metadata } from 'next';
import dynamic from 'next/dynamic';
import PromoBar from '@/components/landing/PromoBar';
import Header from '@/components/landing/Header';
import Hero from '@/components/landing/Hero';
import Concept from '@/components/landing/Concept';
import Features from '@/components/landing/Features';
import WhyFelora from '@/components/landing/WhyFelora';
import HowItWorks from '@/components/landing/HowItWorks';
import EarlyAccess from '@/components/landing/EarlyAccess';
import Showcase from '@/components/landing/Showcase';
import Pricing from '@/components/landing/Pricing';
import FAQ from '@/components/landing/FAQ';
import Contact from '@/components/landing/Contact';
import Footer from '@/components/landing/Footer';

export const metadata: Metadata = {
  title: 'Felora — Le réseau social premium pour créatrices & escorts en Suisse',
  description: 'Pré-inscription ouverte : 3 mois offerts au lancement. Plateforme suisse, sécurisée et élégante pour publier, monétiser et interagir en toute discrétion.',
  openGraph: {
    title: 'Felora — Premium. Sécurisé. Élégant.',
    description: 'Rejoignez la liste d\'attente : 3 mois offerts pour les premières créatrices et agences.',
    images: ['/og-felora.jpg'],
    type: 'website',
    locale: 'fr_CH',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Felora — Premium. Sécurisé. Élégant.',
    description: 'Rejoignez la liste d\'attente : 3 mois offerts pour les premières créatrices et agences.',
    images: ['/og-felora.jpg'],
  },
};

export default function LandingPage() {
  const schemaOrg = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': 'https://felora.ch/#organization',
        name: 'Felora',
        url: 'https://felora.ch',
        logo: 'https://felora.ch/logo.png',
        description: 'Le réseau social premium pour créatrices & escorts en Suisse',
        address: {
          '@type': 'PostalAddress',
          addressCountry: 'CH',
        },
        contactPoint: {
          '@type': 'ContactPoint',
          email: 'support@felora.ch',
          contactType: 'customer service',
        },
      },
      {
        '@type': 'WebApplication',
        '@id': 'https://felora.ch/#webapp',
        name: 'Felora',
        url: 'https://felora.ch',
        description: 'Plateforme suisse, sécurisée et élégante pour publier, monétiser et interagir en toute discrétion.',
        applicationCategory: 'SocialNetworkingApplication',
        operatingSystem: 'Web',
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'CHF',
          description: '3 mois offerts pour les premières créatrices',
        },
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaOrg) }}
      />
      <div className="bg-[#0E0E10] text-white overflow-x-hidden relative">
        {/* Ultra-minimal background - no effects, just pure black */}
        <div className="fixed inset-0 -z-10 bg-[#0E0E10]" />

        <PromoBar />
        <Header />
        <main className="relative z-0">
          <Hero />
          <Concept />
          <Features />
          <WhyFelora />
          <HowItWorks />
          <EarlyAccess />
          <Showcase />
          <Pricing />
          <FAQ />
          <Contact />
        </main>
        <Footer />
      </div>
    </>
  );
}
