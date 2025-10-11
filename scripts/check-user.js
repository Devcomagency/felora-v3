const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function checkUser() {
  try {
    const userId = 'cmgdsgrd800081xkdij8wmhgx'

    console.log(`\n🔍 Recherche de l'utilisateur ${userId}...\n`)

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true
      }
    })

    if (user) {
      console.log('✅ Utilisateur trouvé:')
      console.log(JSON.stringify(user, null, 2))
    } else {
      console.log('❌ Utilisateur introuvable')
      console.log('\n📋 Liste des utilisateurs escort disponibles:\n')

      const escorts = await prisma.user.findMany({
        where: { role: 'ESCORT' },
        select: {
          id: true,
          name: true,
          email: true
        },
        take: 5
      })

      escorts.forEach(escort => {
        console.log(`- ID: ${escort.id}`)
        console.log(`  Nom: ${escort.name}`)
        console.log(`  Email: ${escort.email}\n`)
      })
    }

  } catch (error) {
    console.error('❌ Erreur:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkUser()
