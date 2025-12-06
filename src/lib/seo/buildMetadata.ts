/**
 * Helper pour construire des metadata cohérentes sur toutes les pages
 * Évite les titres génériques et garantit la cohérence SEO
 */

import type { Metadata } from 'next'

interface BuildMetadataOptions {
  title: string
  description: string
  canonical?: string
  keywords?: string[]
  image?: string
  type?: 'website' | 'article' | 'profile'
  noIndex?: boolean
  locale?: string
}

const DEFAULT_OG_IMAGE = '/og-image.png'
const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || 'https://felora.ch'

export function buildMetadata(options: BuildMetadataOptions): Metadata {
  const {
    title,
    description,
    canonical,
    keywords = [],
    image = DEFAULT_OG_IMAGE,
    type = 'website',
    noIndex = false,
    locale = 'fr_CH',
  } = options

  // Construire l'URL complète pour l'image
  const imageUrl = image.startsWith('http') ? image : `${BASE_URL}${image}`

  // Construire les alternates pour i18n
  const alternates: Metadata['alternates'] = canonical
    ? {
        canonical: canonical.startsWith('http') ? canonical : `${BASE_URL}${canonical}`,
        languages: {
          'fr-CH': canonical.startsWith('http') ? canonical : `${BASE_URL}/fr${canonical}`,
          'en-CH': canonical.startsWith('http') ? canonical : `${BASE_URL}/en${canonical}`,
          'de-CH': canonical.startsWith('http') ? canonical : `${BASE_URL}/de${canonical}`,
          'it-CH': canonical.startsWith('http') ? canonical : `${BASE_URL}/it${canonical}`,
        },
      }
    : undefined

  return {
    title,
    description,
    keywords: keywords.length > 0 ? keywords : undefined,
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: 'Felora',
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      locale,
      type,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [imageUrl],
      creator: '@felora',
      site: '@felora',
    },
    alternates,
    robots: noIndex
      ? {
          index: false,
          follow: false,
        }
      : {
          index: true,
          follow: true,
        },
  }
}

/**
 * Helper spécialisé pour les profils
 */
export function buildProfileMetadata(options: {
  name: string
  age?: number
  city?: string
  description?: string
  id: string
  handle?: string
  verified?: boolean
  image?: string
}): Metadata {
  const { name, age, city, description, id, handle, verified, image } = options

  const titleParts = [name]
  if (age) titleParts.push(`${age} ans`)
  if (city) titleParts.push(city)
  const title = `${titleParts.join(', ')} — Felora`

  const descriptionText =
    description?.slice(0, 155) ||
    `${name}${city ? ` à ${city}` : ''} — ${verified ? '✓ Profil vérifié' : ''} — Disponible sur Felora, la plateforme premium suisse.`

  const canonical = `/profile/${handle || id}`

  const keywords = [
    name,
    city ? `escort ${city}` : 'escort suisse',
    'profil vérifié',
    'rencontres premium',
  ]

  return buildMetadata({
    title,
    description: descriptionText,
    canonical,
    keywords,
    image,
    type: 'profile',
  })
}

/**
 * Helper spécialisé pour les clubs
 */
export function buildClubMetadata(options: {
  name: string
  city?: string
  description?: string
  id: string
  handle?: string
  type?: string
  image?: string
}): Metadata {
  const { name, city, description, id, handle, type, image } = options

  const title = `${name}${city ? ` — ${city}` : ''} — Felora`

  const descriptionText =
    description?.slice(0, 155) ||
    `${name}${city ? ` à ${city}` : ''} — ${type || 'Établissement premium'} — Disponible sur Felora.`

  const canonical = `/profile/${handle || id}`

  const keywords = [
    name,
    city ? `club ${city}` : 'club suisse',
    type || 'salon premium',
    'établissement vérifié',
  ]

  return buildMetadata({
    title,
    description: descriptionText,
    canonical,
    keywords,
    image,
    type: 'website',
  })
}
