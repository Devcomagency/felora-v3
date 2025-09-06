import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Inscription — Felora',
  description: 'Créez votre compte Felora: client, indépendante ou salon.',
}

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return children as any
}

