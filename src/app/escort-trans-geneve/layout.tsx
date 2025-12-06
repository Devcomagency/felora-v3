import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Escort Trans Premium à Genève — Profils Vérifiés | Felora',
  description: 'Découvrez des escorts trans premium vérifiées à Genève. Sélection exclusive, messagerie sécurisée E2EE, discrétion absolue. Transsexuelles, ladyboys haut de gamme.',
  keywords: [
    'escort trans genève',
    'escort transsexuelle genève',
    'escort trans premium genève',
    'ladyboy genève',
    'escort trans vérifiée genève',
    'escort trans de luxe genève',
    'escort trans discrète genève',
    'escort transgender genève',
    'escort ts genève',
  ],
  openGraph: {
    title: 'Escort Trans Premium à Genève — Profils Vérifiés | Felora',
    description: 'Découvrez des escorts trans premium vérifiées à Genève. Sélection exclusive, messagerie sécurisée E2EE, discrétion absolue.',
    url: '/escort-trans-geneve',
    type: 'website',
  },
  alternates: {
    canonical: '/escort-trans-geneve',
  },
};

export default function EscortTransGeneveLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
