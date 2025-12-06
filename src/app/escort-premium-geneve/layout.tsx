import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Escort Premium à Genève — Profils Vérifiés | Felora',
  description: 'Découvrez des escorts premium vérifiées à Genève. Messagerie sécurisée E2EE, profils authentiques. Eaux-Vives, Champel, Plainpalais. Discrétion garantie.',
  keywords: [
    'escort premium genève',
    'escort genève vérifiée',
    'escort de luxe genève',
    'escort haut de gamme genève',
    'escort discrète genève',
    'escort vip genève',
    'accompagnatrice genève',
    'escort eaux-vives',
    'escort champel',
  ],
  openGraph: {
    title: 'Escort Premium à Genève — Profils Vérifiés | Felora',
    description: 'Découvrez des escorts premium vérifiées à Genève. Messagerie sécurisée E2EE, profils authentiques. Discrétion garantie.',
    url: '/escort-premium-geneve',
    type: 'website',
  },
  alternates: {
    canonical: '/escort-premium-geneve',
  },
};

export default function EscortPremiumGeneveLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
