import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function updateMediaUrls() {
  console.log('Mise à jour des URLs des médias pour les faire pointer vers des fichiers réels...')

  try {
    // Mettre à jour les 4 médias pour pointer vers des URLs locales réelles
    const updates = [
      {
        id: 'cmg534ikf000qkjfywqsyr0n6', // pos 0 - IMAGE
        newUrl: '/uploads/clubs/cmg4ww1aa00051xfgo7ilxnod_image_0_1727615846_20250520_191846.jpg'
      },
      {
        id: 'cmg534o8l000rkjfyg85j28ao', // pos 1 - VIDEO (on va en faire une image pour le test)
        newUrl: '/uploads/clubs/cmg4ww1aa00051xfgo7ilxnod_video_1_1727615846_14272195_2160_3840_50fps.jpg',
        newType: 'IMAGE' // Changer en IMAGE pour le test
      },
      {
        id: 'cmg5351uc000skjfy6vpc3gzt', // pos 2 - IMAGE
        newUrl: '/uploads/clubs/cmg4ww1aa00051xfgo7ilxnod_image_2_1727615846_20250520_191846_2.jpg'
      },
      {
        id: 'cmg5357fk000tkjfyunepc8dc', // pos 3 - IMAGE
        newUrl: '/uploads/clubs/cmg4ww1aa00051xfgo7ilxnod_image_3_1727615846_emploi_suisse.jpg'
      }
    ]

    for (const update of updates) {
      const result = await prisma.media.update({
        where: { id: update.id },
        data: {
          url: update.newUrl,
          ...(update.newType && { type: update.newType })
        }
      })
      console.log(`✅ Média ${result.id} mis à jour: ${result.url}`)
    }

    console.log('✅ Toutes les URLs des médias ont été mises à jour!')

  } catch (error) {
    console.error('❌ Erreur lors de la mise à jour:', error)
  } finally {
    await prisma.$disconnect()
  }
}

updateMediaUrls()