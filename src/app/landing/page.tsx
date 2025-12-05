'use client';

import { Header } from '@/components/landing/premium/Header';
import { HeroSection } from '@/components/landing/premium/HeroSection';
import { FreeBadges } from '@/components/landing/premium/FreeBadges';
import { DualValueProposition } from '@/components/landing/premium/DualValueProposition';
import { FeaturesIndependantes } from '@/components/landing/premium/FeaturesIndependantes';
import { FeaturesClients } from '@/components/landing/premium/FeaturesClients';
import { FeaturesEtablissements } from '@/components/landing/premium/FeaturesEtablissements';
import { HowItWorks } from '@/components/landing/premium/HowItWorks';
import { FinalCTA } from '@/components/landing/premium/FinalCTA';
import { Footer } from '@/components/landing/premium/Footer';

export default function LandingPage() {
  return (
    <main className="bg-black text-white overflow-x-hidden">
      <Header />
      <HeroSection />
      <FreeBadges />
      <DualValueProposition />
      <FeaturesIndependantes />
      <FeaturesClients />
      <FeaturesEtablissements />
      <HowItWorks />
      <FinalCTA />
      <Footer />
    </main>
  );
}
