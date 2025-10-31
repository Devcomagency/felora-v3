import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  console.log('🧹 Nettoyage des anciennes photos de clubs...\n')

  // Récupérer tous les clubs
  const clubs = await prisma.clubProfileV2.findMany({
    select: { id: true, handle: true, companyName: true }
  })

  for (const club of clubs) {
    console.log(`\n📍 Club: ${club.companyName} (${club.handle})`)

    // Pour chaque position (0 = avatar, 1 = cover)
    for (const pos of [0, 1]) {
      const mediaAtPos = await prisma.media.findMany({
        where: {
          ownerType: 'CLUB',
          ownerId: club.id,
          pos: pos
        },
        orderBy: { createdAt: 'desc' }
      })

      if (mediaAtPos.length > 1) {
        console.log(`   ⚠️  Position ${pos}: ${mediaAtPos.length} images trouvées`)

        // Garder seulement la plus récente
        const latest = mediaAtPos[0]
        const toDelete = mediaAtPos.slice(1)

        console.log(`   ✅ Garder: ${latest.url}`)

        for (const old of toDelete) {
          console.log(`   🗑️  Supprimer: ${old.url}`)
          await prisma.media.delete({
            where: { id: old.id }
          })
        }
      } else if (mediaAtPos.length === 1) {
        console.log(`   ✓ Position ${pos}: OK (1 image)`)
      }
    }
  }

  console.log('\n✨ Nettoyage terminé !\n')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
