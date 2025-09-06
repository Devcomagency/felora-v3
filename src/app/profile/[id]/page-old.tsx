import ProfileClient from '@/components/ProfileClient'

interface ProfilePageProps {
  params: Promise<{ id: string }>
}

interface EscortProfile {
  id: string
  name: string
  stageName: string
  age: number
  location: string
  media: string
  gallery: string[]
  blurredGallery: string[]
  description: string
  services: string[]
  price: number
  rating: number
  reviews: number
  likes: number
  followers: number
  online: boolean
  lastSeen: string
  verified: boolean
  premium: boolean
  viewersCount: number
  responseRate: number
  responseTime: string
  unlockPrice: number
}

const profileMockData: { [key: string]: EscortProfile } = {
  '1': {
    id: '1',
    name: 'Sofia',
    stageName: 'Sofia Milano',
    age: 24,
    location: 'Genève',
    media: '/placeholder-avatar.jpg',
    gallery: [],
    blurredGallery: [],
    description: 'Bonjour mes amours 💋 Je suis Sofia, une femme raffinée et passionnée qui saura vous faire vivre des moments inoubliables dans la belle ville de Genève. ✨\n\nAvec mes 5 années d\'expérience dans l\'accompagnement de qualité, je vous propose des services personnalisés et discrets adaptés à tous vos désirs. Que ce soit pour un dîner romantique, un événement social, un voyage d\'affaires ou simplement pour passer un moment intime et relaxant, je sais m\'adapter à chaque situation avec élégance et professionnalisme.\n\n🌟 Mes spécialités :\n• Girlfriend Experience authentique et naturelle\n• Massages relaxants et sensoriels\n• Accompagnement pour soirées et événements\n• Voyages et week-ends romantiques\n• Services de domination douce pour les curieux\n\n💎 Ce qui me différencie :\n- Toujours impeccablement présentée\n- Conversation intelligente en français, anglais et italien\n- Approche personnalisée selon vos envies\n- Discrétion absolue garantie\n- Hygiène irréprochable\n- Ponctualité et respect des rendez-vous\n\n🏨 Je reçois dans un appartement privé, discret et luxueux au cœur de Genève, ou me déplace dans les meilleurs hôtels de la région. Possibilité de déplacements dans toute la Suisse romande sur demande.\n\n⏰ Disponibilités : Du lundi au dimanche de 10h à 21h (sur rendez-vous uniquement)\n\n💌 N\'hésitez pas à me contacter pour discuter de vos attentes et organiser notre rencontre. Je réponds personnellement à tous les messages sérieux.\n\nAu plaisir de faire votre connaissance... 😘\nSofia ❤️',
    services: ['GFE', 'Massage', 'Accompagnement', 'Voyage', 'Soirées', 'Week-end', 'Fétichisme soft', 'Domination légère'],
    price: 800,
    rating: 4.9,
    reviews: 145,
    likes: 2340,
    followers: 1580,
    online: true,
    lastSeen: 'En ligne maintenant',
    verified: true,
    premium: true,
    viewersCount: 8,
    responseRate: 95,
    responseTime: '~2 min',
    unlockPrice: 35
  }
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { id } = await params
  
  try {
    // Essayer de charger depuis l'API escort spécifique d'abord
    const escortResponse = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/escort/profile/${id}`, {
      cache: 'no-store'
    })
    
    if (escortResponse.ok) {
      const escortProfile = await escortResponse.json()
      console.log('🎯 Profil escort chargé depuis la base:', escortProfile)
      
      // Convertir le profil escort en format attendu
      const profile: EscortProfile = {
        id: escortProfile.id,
        name: escortProfile.firstName || escortProfile.stageName || 'Unknown',
        stageName: escortProfile.stageName || escortProfile.firstName || 'Unknown',
        age: escortProfile.dateOfBirth ? 
          new Date().getFullYear() - new Date(escortProfile.dateOfBirth).getFullYear() : 25,
        location: escortProfile.city || 'Unknown',
        media: escortProfile?.profilePhoto || '/placeholder-avatar.jpg',
        gallery: escortProfile.galleryPhotos ? 
          JSON.parse(escortProfile.galleryPhotos).filter((m: any) => m.type === 'image').map((m: any) => m.url).slice(0, 6) : [],
        blurredGallery: escortProfile.galleryPhotos ? 
          JSON.parse(escortProfile.galleryPhotos).filter((m: any) => m.type === 'image').map((m: any) => m.url).slice(0, 6) : [],
        description: escortProfile.description || 'Aucune description disponible',
        services: escortProfile.services ? JSON.parse(escortProfile.services) : ['Accompagnement'],
        price: 350, // Prix par défaut
        rating: 4.9, // Rating par défaut
        reviews: 24, // Avis par défaut
        likes: 156, // Likes par défaut
        followers: 289, // Followers par défaut
        online: escortProfile.status === 'ACTIVE',
        lastSeen: escortProfile.status === 'ACTIVE' ? 'En ligne maintenant' : 'Vu récemment',
        verified: escortProfile.isVerifiedBadge || false,
        premium: true, // Premium par défaut
        viewersCount: Math.floor(Math.random() * 20) + 5, // Viewers aléatoires
        responseRate: 98, // Taux de réponse par défaut
        responseTime: '~3 min', // Temps de réponse par défaut
        unlockPrice: 30 // Prix déblocage par défaut
      }
      
      return <ProfileClient profile={profile} />
    }
    
    // Fallback vers l'ancienne API escorts
    const response = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/escorts`, {
      cache: 'no-store'
    })
    const data = await response.json()
    
    if (!data.success || !data.escorts) {
      throw new Error('Failed to load escorts')
    }
    
    // Trouver le profil correspondant
    const escort = data.escorts.find((e: any) => e.id === id)
    
    if (!escort) {
      // Fallback sur le mock data
      const profile = profileMockData[id] || profileMockData['1']
      return <ProfileClient profile={profile} />
    }
    
    // Adapter les données escort vers le format ProfileClient
    const profile: EscortProfile = {
      id: escort.id,
      name: escort.name,
      stageName: escort.username || escort.name,
      age: escort.age,
      location: escort.location,
      media: escort.profileImage || escort.media,
      gallery: escort.gallery || [escort.media, escort.profileImage].filter(Boolean),
      blurredGallery: escort.gallery?.map((img: string) => `${img}?blur=15`) || [],
      description: escort.description,
      services: escort.services || ['GFE', 'Massage', 'Accompagnement'],
      price: escort.price || 800,
      rating: escort.rating || 4.8,
      reviews: escort.reviews || 100,
      likes: escort.likes || 500,
      followers: escort.followers || 300,
      online: escort.online || false,
      lastSeen: escort.online ? 'En ligne maintenant' : 'Vu récemment',
      verified: escort.verified || false,
      premium: escort.premium || false,
      viewersCount: Math.floor(Math.random() * 15) + 1,
      responseRate: 95,
      responseTime: '~2 min',
      unlockPrice: 35
    }

    return <ProfileClient profile={profile} />
    
  } catch (error) {
    console.error('Error loading profile:', error)
    // Fallback sur mock data
    const profile = profileMockData[id] || profileMockData['1']
    return <ProfileClient profile={profile} />
  }
}