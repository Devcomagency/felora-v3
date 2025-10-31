import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function makeAdmin() {
  // Modifier cet email selon ton compte
  const email = 'n.a.hasnaoui19@gmail.com' // Ou un autre email de la liste ci-dessus

  try {
    console.log(`🔍 Recherche de l'utilisateur avec l'email: ${email}`)

    // Chercher l'utilisateur
    let user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        role: true
      }
    })

    if (user) {
      console.log(`✅ Utilisateur trouvé:`, user)

      if (user.role === 'ADMIN') {
        console.log(`✅ L'utilisateur est déjà ADMIN`)
      } else {
        console.log(`🔄 Mise à jour du rôle de ${user.role} vers ADMIN...`)

        await prisma.user.update({
          where: { email },
          data: { role: 'ADMIN' }
        })

        console.log(`✅ Utilisateur mis à jour en ADMIN avec succès!`)
      }
    } else {
      console.log(`❌ Aucun utilisateur trouvé avec l'email: ${email}`)
      console.log(`\n📋 Liste de tous les utilisateurs dans la base:`)

      const allUsers = await prisma.user.findMany({
        select: {
          id: true,
          email: true,
          name: true,
          role: true
        },
        take: 20
      })

      console.table(allUsers)
    }
  } catch (error) {
    console.error('❌ Erreur:', error)
  } finally {
    await prisma.$disconnect()
  }
}

makeAdmin()
