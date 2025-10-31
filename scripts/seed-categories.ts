import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function seedCategories() {
  try {
    console.log('🌱 Mise à jour des catégories pour tester l\'affichage admin\n')

    // Récupérer quelques profils
    const escorts = await prisma.escortProfile.findMany({
      take: 10,
      select: {
        id: true,
        stageName: true,
        category: true,
        user: {
          select: {
            email: true
          }
        }
      }
    })

    if (escorts.length < 4) {
      console.log('❌ Pas assez de profils pour tester')
      return
    }

    // Assigner des catégories variées pour tester
    const categories = ['ESCORT', 'MASSEUSE', 'DOMINATRICE', 'TRANSSEXUELLE', 'AUTRE']

    for (let i = 0; i < Math.min(escorts.length, 10); i++) {
      const escort = escorts[i]
      const category = categories[i % categories.length]

      await prisma.escortProfile.update({
        where: { id: escort.id },
        data: { category: category as any }
      })

      console.log(`✅ ${escort.stageName} (${escort.user.email}) → ${category}`)
    }

    console.log('\n🎉 Catégories mises à jour ! Rafraîchissez l\'admin pour voir les changements.')

  } catch (error) {
    console.error('❌ Erreur:', error)
  } finally {
    await prisma.$disconnect()
  }
}

seedCategories()
