import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkClubMedia() {
  try {
    // Récupérer tous les clubs
    const clubs = await prisma.clubProfileV2.findMany({
      include: {
        details: true
      }
    })

    console.log('\n📊 CLUBS ACTIFS:\n')

    for (const club of clubs) {
      console.log(`\n🏢 Club: ${club.companyName} (${club.handle})`)
      console.log(`   ID: ${club.id}`)
      console.log(`   Updated At: ${club.updatedAt}`)

      // Récupérer les médias
      const media = await prisma.media.findMany({
        where: {
          ownerType: 'CLUB',
          ownerId: club.id
        },
        orderBy: [
          { pos: 'asc' }
        ]
      })

      console.log(`\n   📸 Médias (${media.length}):`)

      for (const m of media) {
        console.log(`   - Position ${m.pos}: ${m.type}`)
        console.log(`     URL: ${m.url}`)
        console.log(`     Created: ${m.createdAt}`)
        console.log(`     Updated: ${m.updatedAt}`)
        console.log(`     ID: ${m.id}`)
      }

      console.log('\n   🔗 URLs dans ClubDetails:')
      if (club.details) {
        console.log(`   - Avatar: ${club.details.avatarUrl}`)
        console.log(`   - Cover: ${club.details.coverUrl}`)
      }
    }

  } catch (error) {
    console.error('❌ Erreur:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkClubMedia()
