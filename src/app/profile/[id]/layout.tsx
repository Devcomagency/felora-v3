import type { Metadata } from 'next'
import { prisma } from '@/lib/prisma'

type Props = {
  params: { id: string }
  children: React.ReactNode
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const profile = await prisma.user.findUnique({
      where: { id: params.id },
      select: {
        name: true,
        city: true,
        age: true,
        verified: true,
        premium: true,
        languages: true,
        services: true,
        description: true,
      },
    })

    if (!profile) {
      return {
        title: 'Profil introuvable — Felora',
        description: 'Ce profil n\'existe pas ou a été supprimé.',
      }
    }

    const title = `${profile.name}${profile.age ? `, ${profile.age} ans` : ''}${profile.city ? ` — ${profile.city}` : ''}`
    const badges = []
    if (profile.verified) badges.push('✓ Vérifié')
    if (profile.premium) badges.push('⭐ Premium')

    const description = profile.description
      ? profile.description.slice(0, 155) + (profile.description.length > 155 ? '...' : '')
      : `${profile.name}${profile.city ? ` à ${profile.city}` : ''} — ${badges.join(' • ')} — Disponible sur Felora, la plateforme premium.`

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        type: 'profile',
        images: [
          {
            url: `/profile/${params.id}/opengraph-image`,
            width: 1200,
            height: 630,
            alt: `Profil de ${profile.name} sur Felora`,
          },
        ],
        locale: 'fr_CH',
        siteName: 'Felora',
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: [`/profile/${params.id}/opengraph-image`],
      },
      alternates: {
        canonical: `/profile/${params.id}`,
      },
    }
  } catch (error) {
    console.error('Error generating metadata:', error)
    return {
      title: 'Profil — Felora',
      description: 'Découvrez ce profil sur Felora.',
    }
  }
}

export default function PublicProfileLayout({ children }: Props) {
  return children
}

