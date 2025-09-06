import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Carte — Felora',
  description: 'Explorez les profils sur la carte interactive.',
}

export default function MapLayout({ children }: { children: React.ReactNode }) {
  return children as any
}

