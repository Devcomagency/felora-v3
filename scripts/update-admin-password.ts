import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function updateAdminPassword() {
  const email = 'info@devcom.ch'
  const newPassword = 'Devcom20!'

  try {
    console.log(`🔍 Mise à jour du mot de passe pour ${email}...`)

    // Hasher le nouveau mot de passe
    const hashedPassword = await bcrypt.hash(newPassword, 12)

    // Mettre à jour l'utilisateur
    await prisma.user.update({
      where: { email },
      data: {
        password: hashedPassword,
        role: 'ADMIN' // S'assurer qu'il est ADMIN
      }
    })

    console.log('✅ Mot de passe mis à jour avec succès!')
    console.log(`📧 Email: ${email}`)
    console.log(`🔑 Nouveau mot de passe: ${newPassword}`)

    // Vérifier
    const admin = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        role: true
      }
    })

    console.log('\n✅ Compte admin:')
    console.table(admin)

  } catch (error) {
    console.error('❌ Erreur:', error)
  } finally {
    await prisma.$disconnect()
  }
}

updateAdminPassword()
