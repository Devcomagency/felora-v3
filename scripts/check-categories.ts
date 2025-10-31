import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkCategories() {
  try {
    console.log('🔍 Vérification des catégories dans la base de données\n')

    const escorts = await prisma.escortProfile.findMany({
      select: {
        id: true,
        stageName: true,
        category: true,
        user: {
          select: {
            email: true
          }
        }
      },
      take: 20
    })

    console.log(`📊 ${escorts.length} profils escort trouvés:\n`)

    const categoryCounts: Record<string, number> = {}

    escorts.forEach(escort => {
      const cat = escort.category || 'NULL'
      categoryCounts[cat] = (categoryCounts[cat] || 0) + 1
      console.log(`  ${escort.stageName?.padEnd(30)} | ${escort.user.email?.padEnd(35)} | category: "${escort.category}"`)
    })

    console.log('\n📊 Répartition des catégories:')
    Object.entries(categoryCounts).forEach(([cat, count]) => {
      console.log(`  ${cat}: ${count}`)
    })

  } catch (error) {
    console.error('❌ Erreur:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkCategories()
