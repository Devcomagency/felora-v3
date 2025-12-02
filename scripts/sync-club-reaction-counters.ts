import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function syncClubReactionCounters() {
  console.log('🔄 Synchronisation des compteurs de réactions pour les clubs...\n')

  try {
    // 1. Récupérer tous les clubs
    const clubs = await prisma.clubProfileV2.findMany({
      select: { id: true, name: true, totalLikes: true, totalReacts: true }
    })

    console.log(`📊 ${clubs.length} clubs trouvés\n`)

    let updatedCount = 0
    let unchangedCount = 0

    // 2. Pour chaque club, calculer les compteurs réels
    for (const club of clubs) {
      const [totalLikes, totalReacts] = await Promise.all([
        // Compter les LIKE
        prisma.reaction.count({
          where: {
            media: {
              ownerId: club.id,
              ownerType: 'CLUB',
              deletedAt: null
            },
            type: 'LIKE'
          }
        }),
        // Compter les autres réactions (pas LIKE)
        prisma.reaction.count({
          where: {
            media: {
              ownerId: club.id,
              ownerType: 'CLUB',
              deletedAt: null
            },
            NOT: { type: 'LIKE' }
          }
        })
      ])

      // 3. Comparer avec les valeurs actuelles
      const needsUpdate = club.totalLikes !== totalLikes || club.totalReacts !== totalReacts

      if (needsUpdate) {
        console.log(`📝 ${club.name}`)
        console.log(`   Avant: ${club.totalLikes} likes, ${club.totalReacts} réactions`)
        console.log(`   Après: ${totalLikes} likes, ${totalReacts} réactions`)

        // 4. Mettre à jour
        await prisma.clubProfileV2.update({
          where: { id: club.id },
          data: { totalLikes, totalReacts }
        })

        updatedCount++
      } else {
        unchangedCount++
      }
    }

    console.log(`\n✅ Synchronisation terminée !`)
    console.log(`   ${updatedCount} clubs mis à jour`)
    console.log(`   ${unchangedCount} clubs inchangés`)

  } catch (error) {
    console.error('❌ Erreur:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Exécuter
syncClubReactionCounters()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
