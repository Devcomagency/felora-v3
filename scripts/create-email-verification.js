const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function createEmailVerification() {
  try {
    // Créer une vérification d'email pour test@felora.com
    const emailVerification = await prisma.emailVerification.upsert({
      where: { email: 'test@felora.com' },
      update: {
        verifiedAt: new Date(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24h
      },
      create: {
        email: 'test@felora.com',
        codeHash: '123456', // Hash du code
        verifiedAt: new Date(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24h
      }
    })

    console.log('✅ Vérification email créée:', emailVerification.email)

    // Mettre à jour l'utilisateur existant pour qu'il soit ESCORT
    const user = await prisma.user.findUnique({
      where: { email: 'test@felora.com' }
    })

    if (user) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          role: 'ESCORT',
          passwordHash: user.password || user.passwordHash
        }
      })
      console.log('✅ Utilisateur mis à jour en ESCORT')
    }

  } catch (error) {
    console.error('❌ Erreur:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createEmailVerification()
