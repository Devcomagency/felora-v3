import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function backfillLastLoginRealistic() {
  try {
    console.log('🔄 Mise à jour des lastLoginAt avec des dates réalistes...')

    // Récupérer tous les utilisateurs
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        createdAt: true,
        updatedAt: true
      }
    })

    console.log(`📊 ${users.length} utilisateurs à traiter...`)

    let updated = 0
    for (const user of users) {
      // Utiliser updatedAt si c'est différent de createdAt (ils se sont probablement connectés)
      // Sinon utiliser createdAt
      const lastLogin = user.updatedAt > user.createdAt ? user.updatedAt : user.createdAt

      await prisma.user.update({
        where: { id: user.id },
        data: { lastLoginAt: lastLogin }
      })

      updated++
      if (updated % 10 === 0) {
        console.log(`✅ ${updated}/${users.length} utilisateurs mis à jour`)
      }
    }

    console.log(`\n✅ ${updated} utilisateurs mis à jour avec des dates réalistes`)

    // Afficher quelques exemples
    const samples = await prisma.user.findMany({
      select: {
        email: true,
        createdAt: true,
        updatedAt: true,
        lastLoginAt: true
      },
      take: 10
    })

    console.log('\n📋 Exemples d\'utilisateurs:')
    console.table(samples.map(u => ({
      email: u.email,
      createdAt: u.createdAt.toLocaleDateString('fr-FR'),
      updatedAt: u.updatedAt.toLocaleDateString('fr-FR'),
      lastLoginAt: u.lastLoginAt?.toLocaleDateString('fr-FR') || 'N/A'
    })))

  } catch (error) {
    console.error('❌ Erreur:', error)
  } finally {
    await prisma.$disconnect()
  }
}

backfillLastLoginRealistic()
