import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function findAdmin() {
  try {
    console.log('🔍 Recherche du compte info@devcom.ch...\n')

    // Chercher info@devcom.ch
    const adminUser = await prisma.user.findUnique({
      where: { email: 'info@devcom.ch' }
    })

    if (adminUser) {
      console.log('✅ Compte trouvé:', adminUser)
    } else {
      console.log('❌ Compte info@devcom.ch NON trouvé dans la table User\n')

      // Chercher tous les comptes avec "devcom" dans l'email
      console.log('🔍 Recherche de tous les comptes contenant "devcom"...')
      const devcomUsers = await prisma.user.findMany({
        where: {
          email: {
            contains: 'devcom'
          }
        }
      })

      if (devcomUsers.length > 0) {
        console.log(`✅ ${devcomUsers.length} compte(s) trouvé(s):`)
        console.table(devcomUsers)
      } else {
        console.log('❌ Aucun compte avec "devcom" trouvé\n')

        // Afficher TOUS les utilisateurs (sans limite)
        console.log('📋 TOUS les utilisateurs dans la base:')
        const allUsers = await prisma.user.findMany({
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
            createdAt: true
          },
          orderBy: { createdAt: 'desc' }
        })

        console.log(`Total: ${allUsers.length} utilisateurs`)
        console.table(allUsers)
      }
    }

    // Compter les admins
    const adminCount = await prisma.user.count({
      where: { role: 'ADMIN' }
    })

    console.log(`\n👑 Nombre d'admins dans la base: ${adminCount}`)

    if (adminCount > 0) {
      const admins = await prisma.user.findMany({
        where: { role: 'ADMIN' },
        select: {
          id: true,
          email: true,
          name: true,
          role: true
        }
      })
      console.log('Liste des admins:')
      console.table(admins)
    }

  } catch (error) {
    console.error('❌ Erreur:', error)
  } finally {
    await prisma.$disconnect()
  }
}

findAdmin()
