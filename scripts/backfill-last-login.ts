import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function backfillLastLogin() {
  try {
    console.log('🔄 Mise à jour des lastLoginAt pour les utilisateurs existants...')

    // Mettre à jour tous les utilisateurs sans lastLoginAt
    // Utiliser createdAt comme approximation (ils se sont probablement connectés au moins lors de la création)
    const result = await prisma.user.updateMany({
      where: {
        lastLoginAt: null
      },
      data: {
        lastLoginAt: new Date() // Ou utiliser createdAt si disponible
      }
    })

    console.log(`✅ ${result.count} utilisateurs mis à jour`)

    // Afficher quelques exemples
    const samples = await prisma.user.findMany({
      select: {
        email: true,
        createdAt: true,
        lastLoginAt: true
      },
      take: 5
    })

    console.log('\n📋 Exemples d\'utilisateurs:')
    console.table(samples.map(u => ({
      email: u.email,
      createdAt: u.createdAt.toLocaleString('fr-FR'),
      lastLoginAt: u.lastLoginAt?.toLocaleString('fr-FR') || 'N/A'
    })))

  } catch (error) {
    console.error('❌ Erreur:', error)
  } finally {
    await prisma.$disconnect()
  }
}

backfillLastLogin()
