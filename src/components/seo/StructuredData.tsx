/**
 * Composants pour générer des données structurées Schema.org JSON-LD
 * Améliore le référencement et les rich snippets dans les résultats de recherche
 */

interface OrganizationSchemaProps {
  name: string
  url: string
  logo: string
  description: string
  address?: {
    streetAddress?: string
    addressLocality: string
    addressRegion?: string
    postalCode?: string
    addressCountry: string
  }
  contactPoint?: {
    telephone?: string
    contactType: string
    areaServed?: string
    availableLanguage?: string[]
  }
  sameAs?: string[]
}

export function OrganizationSchema(props: OrganizationSchemaProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: props.name,
    url: props.url,
    logo: props.logo,
    description: props.description,
    ...(props.address && {
      address: {
        '@type': 'PostalAddress',
        ...props.address,
      },
    }),
    ...(props.contactPoint && {
      contactPoint: {
        '@type': 'ContactPoint',
        ...props.contactPoint,
      },
    }),
    ...(props.sameAs && { sameAs: props.sameAs }),
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

interface LocalBusinessSchemaProps {
  name: string
  description: string
  url: string
  telephone?: string
  image?: string
  address: {
    streetAddress?: string
    addressLocality: string
    addressRegion?: string
    postalCode?: string
    addressCountry: string
  }
  geo?: {
    latitude: number
    longitude: number
  }
  openingHours?: string[]
  priceRange?: string
  aggregateRating?: {
    ratingValue: number
    reviewCount: number
  }
}

export function LocalBusinessSchema(props: LocalBusinessSchemaProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: props.name,
    description: props.description,
    url: props.url,
    ...(props.telephone && { telephone: props.telephone }),
    ...(props.image && { image: props.image }),
    address: {
      '@type': 'PostalAddress',
      ...props.address,
    },
    ...(props.geo && {
      geo: {
        '@type': 'GeoCoordinates',
        latitude: props.geo.latitude,
        longitude: props.geo.longitude,
      },
    }),
    ...(props.openingHours && { openingHours: props.openingHours }),
    ...(props.priceRange && { priceRange: props.priceRange }),
    ...(props.aggregateRating && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: props.aggregateRating.ratingValue,
        reviewCount: props.aggregateRating.reviewCount,
      },
    }),
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

interface PersonSchemaProps {
  name: string
  description?: string
  url: string
  image?: string
  jobTitle?: string
  address?: {
    addressLocality: string
    addressCountry: string
  }
  knowsLanguage?: string[]
  aggregateRating?: {
    ratingValue: number
    reviewCount: number
  }
}

export function PersonSchema(props: PersonSchemaProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: props.name,
    ...(props.description && { description: props.description }),
    url: props.url,
    ...(props.image && { image: props.image }),
    ...(props.jobTitle && { jobTitle: props.jobTitle }),
    ...(props.address && {
      address: {
        '@type': 'PostalAddress',
        ...props.address,
      },
    }),
    ...(props.knowsLanguage && { knowsLanguage: props.knowsLanguage }),
    ...(props.aggregateRating && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: props.aggregateRating.ratingValue,
        reviewCount: props.aggregateRating.reviewCount,
      },
    }),
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

interface ServiceSchemaProps {
  name: string
  description: string
  provider: {
    name: string
    url: string
  }
  serviceType?: string
  areaServed?: string
  offers?: {
    price: number | string
    priceCurrency: string
    description?: string
  }[]
}

export function ServiceSchema(props: ServiceSchemaProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: props.name,
    description: props.description,
    provider: {
      '@type': 'Organization',
      ...props.provider,
    },
    ...(props.serviceType && { serviceType: props.serviceType }),
    ...(props.areaServed && { areaServed: props.areaServed }),
    ...(props.offers && {
      offers: props.offers.map(offer => ({
        '@type': 'Offer',
        price: offer.price,
        priceCurrency: offer.priceCurrency,
        ...(offer.description && { description: offer.description }),
      })),
    }),
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

interface BreadcrumbSchemaProps {
  items: {
    name: string
    url: string
  }[]
}

export function BreadcrumbSchema(props: BreadcrumbSchemaProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: props.items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

interface WebSiteSchemaProps {
  name: string
  url: string
  description: string
  searchUrl?: string
  searchTermString?: string
  potentialAction?: {
    target: string
    queryInput: string
  }
}

export function WebSiteSchema(props: WebSiteSchemaProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: props.name,
    url: props.url,
    description: props.description,
    ...(props.potentialAction && {
      potentialAction: {
        '@type': 'SearchAction',
        target: props.potentialAction.target,
        'query-input': props.potentialAction.queryInput,
      },
    }),
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

interface FAQSchemaProps {
  questions: {
    question: string
    answer: string
  }[]
}

export function FAQSchema(props: FAQSchemaProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: props.questions.map(q => ({
      '@type': 'Question',
      name: q.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: q.answer,
      },
    })),
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}
