import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkClubDetails() {
  try {
    const clubs = await prisma.clubProfileV2.findMany({
      include: {
        details: true
      }
    })

    console.log('\n📊 DÉTAILS DES CLUBS:\n')

    for (const club of clubs) {
      console.log(`\n🏢 Club: ${club.companyName} (${club.handle})`)
      console.log(`   ID: ${club.id}`)

      if (club.details) {
        console.log(`   ✅ Type d'établissement: ${club.details.establishmentType}`)
        console.log(`   ✅ Statut actif: ${club.details.isActive}`)
        console.log(`   📍 Ville: ${club.details.city}`)
        console.log(`   📝 Description: ${club.details.description?.substring(0, 50)}...`)
        console.log(`   🕒 Horaires: ${club.details.openingHours}`)
      } else {
        console.log('   ⚠️  Pas de détails enregistrés')
      }
    }

  } catch (error) {
    console.error('❌ Erreur:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkClubDetails()
