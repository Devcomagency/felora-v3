import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Profil — Felora',
  description: 'Profil public, médias et informations utiles.',
}

export default function PublicProfileLayout({ children }: { children: React.ReactNode }) {
  return children as any
}

