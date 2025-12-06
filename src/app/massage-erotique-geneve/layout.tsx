import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Massage Érotique à Genève — Masseuses Premium | Felora',
  description: 'Découvrez des masseuses érotiques premium à Genève. Massages sensuels, body body, profils vérifiés, discrétion absolue. Relaxation et plaisir garantis.',
  keywords: [
    'massage érotique genève',
    'massage sensuel genève',
    'masseuse érotique genève',
    'massage body body genève',
    'massage naturiste genève',
    'massage relaxant sensuel genève',
    'salon massage érotique genève',
    'massage corps à corps genève',
    'massage intime genève',
  ],
  openGraph: {
    title: 'Massage Érotique à Genève — Masseuses Premium | Felora',
    description: 'Découvrez des masseuses érotiques premium à Genève. Massages sensuels, profils vérifiés, discrétion absolue.',
    url: '/massage-erotique-geneve',
    type: 'website',
  },
  alternates: {
    canonical: '/massage-erotique-geneve',
  },
};

export default function MassageErotiqueGeneveLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
