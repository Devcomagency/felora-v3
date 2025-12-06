import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

/**
 * 🔐 SETUP ADMIN PRODUCTION
 * Configure les comptes admin avec mots de passe sécurisés
 */

const prisma = new PrismaClient()

async function setupAdminProduction() {
  console.log('🔐 Configuration des comptes admin pour PRODUCTION...\n')

  try {
    // Mot de passe pour info@devcom.ch
    const password1 = 'Felora2025!SecureAdmin'
    const hash1 = await bcrypt.hash(password1, 10)

    console.log('📧 Configuration admin: info@devcom.ch')
    console.log(`   Password: ${password1}`)
    console.log(`   Hash: ${hash1}\n`)

    // Vérifier/créer le compte info@devcom.ch
    const admin1 = await prisma.user.upsert({
      where: { email: 'info@devcom.ch' },
      update: {
        password: hash1,
        role: 'ADMIN',
        emailVerified: new Date()
      },
      create: {
        email: 'info@devcom.ch',
        password: hash1,
        role: 'ADMIN',
        emailVerified: new Date()
      }
    })

    console.log('✅ Admin créé/mis à jour:', admin1.email)
    console.log(`   ID: ${admin1.id}`)
    console.log(`   Role: ${admin1.role}\n`)

    // Vérifier le compte n.a.hasnaoui19@gmail.com
    const admin2 = await prisma.user.findUnique({
      where: { email: 'n.a.hasnaoui19@gmail.com' }
    })

    if (admin2) {
      console.log('✅ Admin existant:', admin2.email)
      console.log(`   ID: ${admin2.id}`)
      console.log(`   Role: ${admin2.role}\n`)
    }

    // Test de connexion
    console.log('🧪 Test de vérification du mot de passe...')
    const isValid = await bcrypt.compare(password1, hash1)
    console.log(`   Résultat: ${isValid ? '✅ OK' : '❌ ERREUR'}\n`)

    console.log('✅ Configuration terminée !\n')
    console.log('📝 Credentials pour production:')
    console.log('   Email: info@devcom.ch')
    console.log(`   Password: ${password1}`)
    console.log('\n⚠️  IMPORTANT: Gardez ces credentials en lieu sûr!')

  } catch (error) {
    console.error('❌ Erreur:', error)
  } finally {
    await prisma.$disconnect()
  }
}

setupAdminProduction()
