import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Fonction utilitaire pour nettoyer les doublons
function cleanDuplicates(data: string): string {
  try {
    const array = JSON.parse(data)
    if (Array.isArray(array)) {
      // Déduplication et filtrage des éléments vides
      const uniqueItems = [...new Set(array)].filter(item => item && item.trim() !== '')
      return JSON.stringify(uniqueItems)
    }
  } catch {
    // Si ce n'est pas un JSON valide, on le retourne tel quel
  }
  return data
}

export async function POST() {
  try {
    // Récupérer tous les profils avec des venueOptions
    const profiles = await prisma.escortProfile.findMany({
      where: {
        venueOptions: {
          not: null
        }
      },
      select: {
        id: true,
        venueOptions: true,
        practices: true
      }
    })

    let updated = 0

    for (const profile of profiles) {
      const updates: any = {}

      // Nettoyer venueOptions si nécessaire
      if (profile.venueOptions) {
        const cleaned = cleanDuplicates(profile.venueOptions)
        if (cleaned !== profile.venueOptions) {
          updates.venueOptions = cleaned
        }
      }

      // Nettoyer practices si nécessaire
      if (profile.practices) {
        const cleaned = cleanDuplicates(profile.practices)
        if (cleaned !== profile.practices) {
          updates.practices = cleaned
        }
      }

      // Mettre à jour si nécessaire
      if (Object.keys(updates).length > 0) {
        await prisma.escortProfile.update({
          where: { id: profile.id },
          data: updates
        })
        updated++
      }
    }

    return NextResponse.json({
      success: true,
      message: `${updated} profils nettoyés avec succès`,
      totalChecked: profiles.length
    })

  } catch (error) {
    console.error('Erreur nettoyage doublons:', error)
    return NextResponse.json({
      error: 'Erreur lors du nettoyage'
    }, { status: 500 })
  }
}