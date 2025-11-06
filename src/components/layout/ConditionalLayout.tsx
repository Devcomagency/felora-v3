'use client'

import { usePathname } from 'next/navigation'

/**
 * Composant qui masque ses enfants sur certaines pages
 * Utilisé pour cacher la navbar et le footer sur les pages d'authentification
 */
export default function ConditionalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  // Pages où on veut masquer la navbar et le footer
  const hideLayoutPaths = [
    '/auth-check', // Page de mot de passe
    '/login',      // Page de connexion
  ]

  // Si on est sur une page où on veut masquer le layout, ne rien afficher
  if (hideLayoutPaths.includes(pathname)) {
    return null
  }

  // Sinon, afficher les enfants (navbar + footer)
  return <>{children}</>
}
