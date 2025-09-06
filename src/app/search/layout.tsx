import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Recherche — Felora',
  description: 'Trouvez des profils vérifiés et explorez la carte.',
}

export default function SearchLayout({ children }: { children: React.ReactNode }) {
  return children as any
}

