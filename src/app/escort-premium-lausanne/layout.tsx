import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Escort Premium à Lausanne — Profils Vérifiés | Felora',
  description: 'Découvrez des escorts premium vérifiées à Lausanne. Messagerie sécurisée E2EE, profils authentiques. Ouchy, Flon, Vieux-Lausanne. Discrétion garantie.',
  keywords: [
    'escort premium lausanne',
    'escort lausanne vérifiée',
    'escort de luxe lausanne',
    'escort haut de gamme lausanne',
    'escort discrète lausanne',
    'escort vip lausanne',
    'accompagnatrice lausanne',
    'escort ouchy',
    'escort flon',
  ],
  openGraph: {
    title: 'Escort Premium à Lausanne — Profils Vérifiés | Felora',
    description: 'Découvrez des escorts premium vérifiées à Lausanne. Messagerie sécurisée E2EE, profils authentiques. Discrétion garantie.',
    url: '/escort-premium-lausanne',
    type: 'website',
  },
  alternates: {
    canonical: '/escort-premium-lausanne',
  },
};

export default function EscortPremiumLausanneLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
