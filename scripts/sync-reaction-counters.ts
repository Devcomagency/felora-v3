/**
 * Script pour synchroniser les compteurs totalLikes et totalReacts
 * pour tous les profils escorts
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🔄 Synchronisation des compteurs de réactions...\n')

  // 1. Nettoyer les médias fantômes
  console.log('🧹 Nettoyage des médias fantômes...')
  const deletedReactions = await prisma.reaction.deleteMany({
    where: {
      media: { ownerId: 'unknown' }
    }
  })
  console.log(`✅ ${deletedReactions.count} réactions orphelines supprimées`)

  const deletedMedia = await prisma.media.deleteMany({
    where: { ownerId: 'unknown' }
  })
  console.log(`✅ ${deletedMedia.count} médias fantômes supprimés\n`)

  // 2. Synchroniser les compteurs pour chaque escort
  const escorts = await prisma.escortProfile.findMany({
    select: { id: true, userId: true, stageName: true }
  })

  console.log(`📊 ${escorts.length} profils escorts à synchroniser\n`)

  let updated = 0
  for (const escort of escorts) {
    // Compter les réactions pour les médias de cet escort
    const [totalLikes, totalReacts] = await Promise.all([
      prisma.reaction.count({
        where: {
          media: {
            ownerId: escort.id,
            ownerType: 'ESCORT',
            deletedAt: null
          },
          type: 'LIKE'
        }
      }),
      prisma.reaction.count({
        where: {
          media: {
            ownerId: escort.id,
            ownerType: 'ESCORT',
            deletedAt: null
          },
          NOT: { type: 'LIKE' }
        }
      })
    ])

    // Mettre à jour le profil
    await prisma.escortProfile.update({
      where: { id: escort.id },
      data: { totalLikes, totalReacts }
    })

    if (totalLikes > 0 || totalReacts > 0) {
      console.log(`✅ ${escort.stageName}: ${totalLikes} likes, ${totalReacts} reactions`)
      updated++
    }
  }

  console.log(`\n✅ Synchronisation terminée: ${updated} profils mis à jour`)

  await prisma.$disconnect()
}

main().catch((e) => {
  console.error('💥 Erreur:', e)
  process.exit(1)
})
