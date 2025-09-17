import { prisma } from '@/lib/prisma'
import { ProfileService, EscortProfileDTO, ClubProfileDTO } from './ProfileService'

export const profileService: ProfileService = {
  async getEscortByUserId(userId) {
    const p = await prisma.escortProfile.findUnique({ 
      where: { userId }
    })
    if (!p) return null
    
    return {
      id: p.id,
      handle: `@${p.stageName}`,
      displayName: p.stageName,
      bio: p.description,
      languages: p.languages ? p.languages.split(',').map(l => l.trim()) : [],
      services: p.services ? p.services.split(',').map(s => s.trim()) : [],
      ratePerHour: p.rate1H ? Math.round(p.rate1H) : undefined,
      avatarUrl: p.profilePhoto
    }
  },

  async getEscortByHandle(handle) {
    const p = await prisma.escortProfile.findFirst({ 
      where: { 
        OR: [
          { stageName: handle },
          { stageName: handle.replace('@', '') }
        ]
      }
    })
    if (!p) return null
    
    // Mapper depuis le modèle existant vers le DTO
    return {
      id: p.id,
      handle: `@${p.stageName}`,
      displayName: p.stageName,
      bio: p.description,
      languages: p.languages ? p.languages.split(',').map(l => l.trim()) : [],
      services: p.services ? p.services.split(',').map(s => s.trim()) : [],
      ratePerHour: p.rate1H ? Math.round(p.rate1H) : undefined,
      avatarUrl: p.profilePhoto
    }
  },
  
  async upsertEscort(input) {
    const { userId, ...rest } = input
    if (!userId) throw new Error('userId required')
    
    // Générer handle si manquant
    const handle = rest.handle?.replace('@', '') ?? `escort_${userId.slice(0,6)}`
    
    // Mapper vers le modèle Prisma existant
    await prisma.escortProfile.upsert({
      where: { userId },
      update: {
        stageName: handle,
        description: rest.bio || '',
        languages: rest.languages?.join(', ') || '',
        services: rest.services?.join(', ') || '',
        rate1H: rest.ratePerHour || null,
        profilePhoto: rest.avatarUrl || null,
      },
      create: {
        userId,
        stageName: handle,
        firstName: handle, // Requis par le schéma
        dateOfBirth: new Date('1990-01-01'), // Valeur par défaut
        nationality: 'CH', // Valeur par défaut
        city: 'Geneva', // Valeur par défaut
        workingArea: 'Geneva', // Valeur par défaut
        description: rest.bio || '',
        languages: rest.languages?.join(', ') || 'French',
        services: rest.services?.join(', ') || '',
        rates: rest.ratePerHour ? `${rest.ratePerHour} CHF/h` : '',
        availability: 'Available',
        galleryPhotos: '',
        videos: '',
        rate1H: rest.ratePerHour || null,
        profilePhoto: rest.avatarUrl || null,
      },
    })
  },

  async getClubByUserId(userId) {
    const p = await prisma.clubProfile.findUnique({ 
      where: { userId }
    })
    if (!p) return null
    
    return {
      id: p.id,
      handle: `@${p.handle}`,
      name: p.name,
      description: p.description || undefined,
      address: p.address || undefined,
      openingHours: p.openingHours || undefined,
      avatarUrl: p.avatarUrl || undefined,
      coverUrl: p.coverUrl || undefined
    }
  },
  
  async getClubByHandle(handle) {
    const p = await prisma.clubProfile.findUnique({ 
      where: { 
        handle: handle.startsWith('@') ? handle.slice(1) : handle
      }
    })
    if (!p) return null
    
    return {
      id: p.id,
      handle: `@${p.handle}`,
      name: p.name,
      description: p.description || undefined,
      address: p.address || undefined,
      openingHours: p.openingHours || undefined,
      avatarUrl: p.avatarUrl || undefined,
      coverUrl: p.coverUrl || undefined
    }
  },
  
  async upsertClub(input) {
    const { userId, ...rest } = input
    if (!userId) throw new Error('userId required')
    
    const handle = rest.handle?.replace('@', '') ?? `club_${userId.slice(0,6)}`
    
    await prisma.clubProfile.upsert({
      where: { userId },
      update: { 
        handle,
        name: rest.name || handle,
        description: rest.description || '',
        address: rest.address || '',
        openingHours: rest.openingHours || '',
        avatarUrl: rest.avatarUrl || null,
        coverUrl: rest.coverUrl || null,
      },
      create: { 
        userId,
        handle,
        name: rest.name || handle,
        description: rest.description || '',
        address: rest.address || '',
        openingHours: rest.openingHours || '',
        avatarUrl: rest.avatarUrl || null,
        coverUrl: rest.coverUrl || null,
      },
    })
  },
}