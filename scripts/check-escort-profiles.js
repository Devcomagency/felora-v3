const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function checkEscortProfiles() {
  try {
    const profileIds = [
      'cmgdsgrd800081xkdij8wmhgx',
      'cmgau6alj0004l504xscj3xbr',
      'cmg2ej3hs0003l804ns2h6d0o',
      'cmgev7ji200031xkodrhnk9f1'
    ]

    console.log('\n🔍 Vérification des profils escort...\n')

    for (const profileId of profileIds) {
      console.log(`\n📋 Profil ID: ${profileId}`)

      // Vérifier dans EscortProfileV2
      const profile = await prisma.escortProfileV2.findUnique({
        where: { id: profileId },
        select: {
          id: true,
          userId: true,
          handle: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true
            }
          }
        }
      })

      if (profile) {
        console.log('✅ Profil trouvé:')
        console.log(`   Handle: ${profile.handle}`)
        console.log(`   User ID: ${profile.userId}`)
        console.log(`   User Name: ${profile.user.name}`)
        console.log(`   User Email: ${profile.user.email}`)
      } else {
        console.log('❌ Profil introuvable')
      }
    }

    // Lister tous les profils escort disponibles
    console.log('\n\n📋 Tous les profils escort disponibles:\n')
    const allProfiles = await prisma.escortProfileV2.findMany({
      select: {
        id: true,
        userId: true,
        handle: true,
        user: {
          select: {
            name: true,
            email: true
          }
        }
      },
      take: 10
    })

    allProfiles.forEach(profile => {
      console.log(`- Profile ID: ${profile.id}`)
      console.log(`  User ID: ${profile.userId}`)
      console.log(`  Handle: ${profile.handle}`)
      console.log(`  Email: ${profile.user.email}\n`)
    })

  } catch (error) {
    console.error('❌ Erreur:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

checkEscortProfiles()
