import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkTheRockData() {
  try {
    const club = await prisma.clubProfileV2.findUnique({
      where: { handle: 'therock' },
      include: {
        details: true,
        services: true,
        user: true
      }
    })

    if (!club) {
      console.log('❌ Club "therock" non trouvé')
      return
    }

    console.log('\n🏢 Club "therock" - Données complètes:\n')
    console.log('📋 ClubProfileV2:')
    console.log('   ID:', club.id)
    console.log('   Handle:', club.handle)
    console.log('   Company Name:', club.companyName)
    console.log('   Verified:', club.verified)

    console.log('\n📋 ClubDetails:')
    if (club.details) {
      console.log('   Nom:', club.details.name)
      console.log('   Type:', club.details.establishmentType)
      console.log('   Description:', club.details.description?.substring(0, 100))
      console.log('   Ville:', club.details.city)
      console.log('   Adresse:', club.details.address)
      console.log('   Téléphone:', club.details.phone)
      console.log('   Email:', club.details.email)
      console.log('   Website:', club.details.websiteUrl)
      console.log('   isActive:', club.details.isActive)
    } else {
      console.log('   ⚠️ Pas de détails')
    }

    console.log('\n📋 ClubServices:')
    if (club.services) {
      console.log('   Langues:', club.services.languages)
      console.log('   Services:', club.services.services)
      console.log('   Équipements:', club.services.equipments)
      console.log('   isOpen24_7:', club.services.isOpen24_7)
      console.log('   Horaires:', club.services.openingHours)
    } else {
      console.log('   ⚠️ Pas de services')
    }

    console.log('\n📋 User:')
    if (club.user) {
      console.log('   Email:', club.user.email)
      console.log('   Phone:', club.user.phoneE164)
    }

  } catch (error) {
    console.error('❌ Erreur:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkTheRockData()
