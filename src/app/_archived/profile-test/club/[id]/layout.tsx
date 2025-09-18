import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Profil Club — Felora',
  description: 'Présentation du club, médias et informations utiles.',
}

export default function ClubTestProfileLayout({ children }: { children: React.ReactNode }) {
  return children as any
}

