import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Messages — Felora',
  description: 'Conversations sécurisées avec chiffrement de bout en bout.',
}

export default function MessagesLayout({ children }: { children: React.ReactNode }) {
  return children as any
}

