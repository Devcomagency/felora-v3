import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Massage Tantrique à Genève — Masseuses Vérifiées | Felora',
  description: 'Découvrez des masseuses tantriques premium à Genève. Massages sensuels authentiques, profils vérifiés, discrétion absolue. Tantra, Nuru, Lingam.',
  keywords: [
    'massage tantrique genève',
    'massage tantra genève',
    'massage sensuel genève',
    'massage érotique tantrique genève',
    'masseuse tantrique genève',
    'massage lingam genève',
    'massage yoni genève',
    'massage nuru genève',
    'salon massage tantrique genève',
  ],
  openGraph: {
    title: 'Massage Tantrique à Genève — Masseuses Vérifiées | Felora',
    description: 'Découvrez des masseuses tantriques premium à Genève. Massages sensuels authentiques, profils vérifiés, discrétion absolue.',
    url: '/massage-tantrique-geneve',
    type: 'website',
  },
  alternates: {
    canonical: '/massage-tantrique-geneve',
  },
};

export default function MassageTantriqueGeneveLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
