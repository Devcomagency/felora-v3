import type { EscortPinDTO } from '../types'

export const DEMO_ESCORTS: EscortPinDTO[] = [
  {
    id: 'demo-escort-1',
    type: 'ESCORT',
    name: 'Aria Deluxe',
    handle: '@aria_deluxe',
    avatar: 'https://picsum.photos/400/400?random=1',
    lat: 46.2044,
    lng: 6.1432,
    isActive: true,
  },
  {
    id: 'demo-escort-2', 
    type: 'ESCORT',
    name: 'Luna Premium',
    handle: '@luna_premium',
    avatar: 'https://picsum.photos/400/400?random=2',
    lat: 46.5197,
    lng: 6.6323,
    isActive: true,
  },
  {
    id: 'demo-escort-3',
    type: 'ESCORT', 
    name: 'Victoria Elite',
    handle: '@victoria_elite',
    avatar: 'https://picsum.photos/400/400?random=3',
    lat: 46.1884,
    lng: 6.1424,
    isActive: true,
  }
]

export const DEMO_DETAILS: Record<string, {
  media: Array<{
    id: string
    type: 'image' | 'video'
    src: string
    locked?: boolean
  }>
  bio: string
  services: string[]
  languages: string[]
}> = {
  'demo-escort-1': {
    media: [
      { id: 'm1', type: 'image', src: 'https://picsum.photos/600/800?random=11' },
      { id: 'm2', type: 'image', src: 'https://picsum.photos/600/800?random=12' },
      { id: 'm3', type: 'video', src: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4' },
      { id: 'm4', type: 'image', src: 'https://picsum.photos/600/800?random=13', locked: true },
      { id: 'm5', type: 'image', src: 'https://picsum.photos/600/800?random=14' },
      { id: 'm6', type: 'video', src: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4', locked: true },
      { id: 'm7', type: 'image', src: 'https://picsum.photos/600/800?random=15' },
      { id: 'm8', type: 'image', src: 'https://picsum.photos/600/800?random=16', locked: true },
    ],
    bio: 'Modèle premium basée à Genève. Expérience VIP haut de gamme avec discrétion absolue. Disponible pour accompagnements et soirées privées.',
    services: ['Escort', 'Compagnie', 'Soirée', 'Événement', 'Dîner'],
    languages: ['Français', 'Anglais', 'Italien']
  },
  'demo-escort-2': {
    media: [
      { id: 'm21', type: 'image', src: 'https://picsum.photos/600/800?random=21' },
      { id: 'm22', type: 'image', src: 'https://picsum.photos/600/800?random=22' },
      { id: 'm23', type: 'image', src: 'https://picsum.photos/600/800?random=23' },
      { id: 'm24', type: 'video', src: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4' },
      { id: 'm25', type: 'image', src: 'https://picsum.photos/600/800?random=24', locked: true },
      { id: 'm26', type: 'image', src: 'https://picsum.photos/600/800?random=25' },
      { id: 'm27', type: 'image', src: 'https://picsum.photos/600/800?random=26', locked: true },
      { id: 'm28', type: 'video', src: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4' },
      { id: 'm29', type: 'image', src: 'https://picsum.photos/600/800?random=27' },
    ],
    bio: 'Accompagnatrice élégante sur Lausanne. Service premium avec attention aux détails. Parfaite pour événements professionnels et moments privilégiés.',
    services: ['Escort', 'Massage', 'Compagnie', 'Voyage', 'Club Privé'],
    languages: ['Français', 'Anglais', 'Allemand', 'Espagnol']
  },
  'demo-escort-3': {
    media: [
      { id: 'm31', type: 'image', src: 'https://picsum.photos/600/800?random=31' },
      { id: 'm32', type: 'image', src: 'https://picsum.photos/600/800?random=32' },
      { id: 'm33', type: 'video', src: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4', locked: true },
      { id: 'm34', type: 'image', src: 'https://picsum.photos/600/800?random=33' },
      { id: 'm35', type: 'image', src: 'https://picsum.photos/600/800?random=34', locked: true },
      { id: 'm36', type: 'image', src: 'https://picsum.photos/600/800?random=35' },
      { id: 'm37', type: 'video', src: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4' },
      { id: 'm38', type: 'image', src: 'https://picsum.photos/600/800?random=36' },
      { id: 'm39', type: 'image', src: 'https://picsum.photos/600/800?random=37', locked: true },
      { id: 'm40', type: 'image', src: 'https://picsum.photos/600/800?random=38' },
    ],
    bio: 'Modèle internationale basée dans la région genevoise. Service exclusif pour clientèle distinguée. Disponible sur rendez-vous uniquement.',
    services: ['Escort', 'Compagnie', 'Soirée', 'Relaxation', 'Salon'],
    languages: ['Français', 'Anglais', 'Russe', 'Portugais']
  }
}