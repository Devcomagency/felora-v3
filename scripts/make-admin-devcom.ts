import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function makeAdmin() {
  try {
    // Chercher l'utilisateur
    const user = await prisma.user.findUnique({
      where: { email: 'info@devcom.ch' },
      select: { id: true, email: true, name: true, role: true }
    })

    if (!user) {
      console.log('❌ Utilisateur non trouvé : info@devcom.ch')
      console.log('Créer ce compte d\'abord via /register')
      process.exit(1)
    }

    console.log('✅ Utilisateur trouvé :')
    console.log('  - Email:', user.email)
    console.log('  - Nom:', user.name)
    console.log('  - Rôle actuel:', user.role)

    if (user.role === 'ADMIN') {
      console.log('✅ L\'utilisateur est déjà ADMIN')
    } else {
      // Mettre à jour le rôle
      await prisma.user.update({
        where: { id: user.id },
        data: { role: 'ADMIN' }
      })
      console.log('✅ Rôle mis à jour vers ADMIN')
    }

  } catch (error) {
    console.error('❌ Erreur:', error)
  } finally {
    await prisma.$disconnect()
  }
}

makeAdmin()
