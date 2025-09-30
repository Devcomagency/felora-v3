import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Club Profile - Felora',
  description: 'Découvrez ce club premium sur Felora',
}

export default function ClubProfileLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}