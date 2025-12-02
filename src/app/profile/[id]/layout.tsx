import type { Metadata } from 'next'
import { prisma } from '@/lib/prisma'

type Props = {
  params: { id: string }
  children: React.ReactNode
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    // Await params first (Next.js 15 requirement)
    const resolvedParams = await params

    const profile = await prisma.user.findUnique({
      where: { id: resolvedParams.id },
      select: {
        name: true,
        // city is not on User model - get it from escortProfile
        escortProfile: {
          select: {
            city: true,
            description: true,
          }
        },
        // These fields don't exist on User either
        // verified: true,
        // premium: true,
        // languages: true,
        // services: true,
        // description: true,
      },
    })

    if (!profile) {
      return {
        title: 'Profil introuvable — Felora',
        description: 'Ce profil n\'existe pas ou a été supprimé.',
      }
    }

    const city = profile.escortProfile?.city
    const title = `${profile.name}${city ? ` — ${city}` : ''}`
    const badges = []
    // TODO: Add verified and premium badges when we have those fields

    const description = profile.escortProfile?.description
      ? profile.escortProfile.description.slice(0, 155) + (profile.escortProfile.description.length > 155 ? '...' : '')
      : `${profile.name}${city ? ` à ${city}` : ''} — ${badges.join(' • ')} — Disponible sur Felora, la plateforme premium.`

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        type: 'profile',
        images: [
          {
            url: `/profile/${resolvedParams.id}/opengraph-image`,
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
        images: [`/profile/${resolvedParams.id}/opengraph-image`],
      },
      alternates: {
        canonical: `/profile/${resolvedParams.id}`,
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

