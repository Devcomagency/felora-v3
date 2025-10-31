import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkClubSchedule() {
  try {
    const clubs = await prisma.clubProfileV2.findMany({
      include: {
        details: true,
        services: true
      }
    })

    console.log('\n📊 HORAIRES DES CLUBS:\n')

    for (const club of clubs) {
      console.log(`\n🏢 Club: ${club.companyName}`)
      console.log(`   ID: ${club.id}`)

      if (club.details) {
        console.log(`   📍 Type: ${club.details.establishmentType}`)
        console.log(`   ✅ isActive (ClubDetails): ${club.details.isActive}`)
        console.log(`   🕒 openingHours (ClubDetails): ${club.details.openingHours || 'non défini'}`)
      }

      if (club.services) {
        console.log(`   🕐 isOpen24_7 (ClubServices): ${club.services.isOpen24_7}`)
        console.log(`   🕒 openingHours (ClubServices): ${club.services.openingHours || 'non défini'}`)
      }
    }

  } catch (error) {
    console.error('❌ Erreur:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkClubSchedule()
