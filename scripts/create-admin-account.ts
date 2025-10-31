import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function createAdminAccount() {
  const email = 'info@devcom.ch'
  const password = 'Admin2025!' // Change ce mot de passe

  try {
    console.log(`🔍 Vérification si ${email} existe déjà...`)

    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      console.log('✅ Le compte existe déjà')
      console.log('🔄 Mise à jour en ADMIN...')

      await prisma.user.update({
        where: { email },
        data: { role: 'ADMIN' }
      })

      console.log('✅ Compte mis à jour en ADMIN')
    } else {
      console.log('❌ Le compte n\'existe pas')
      console.log('🔨 Création du compte ADMIN...')

      // Hasher le mot de passe
      const hashedPassword = await bcrypt.hash(password, 12)

      await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          name: 'Admin Devcom',
          role: 'ADMIN'
        }
      })

      console.log('✅ Compte ADMIN créé avec succès!')
      console.log(`📧 Email: ${email}`)
      console.log(`🔑 Mot de passe: ${password}`)
      console.log('\n⚠️  IMPORTANT: Change ce mot de passe après ta première connexion!')
    }

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

    console.log('\n✅ Compte admin final:')
    console.table(admin)

  } catch (error) {
    console.error('❌ Erreur:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createAdminAccount()
