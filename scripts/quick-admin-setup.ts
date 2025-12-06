import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function quickSetup() {
  console.log('🔐 Quick admin setup...')

  const password = 'Felora2025!SecureAdmin'
  const hash = await bcrypt.hash(password, 10)

  console.log('Hash généré:', hash)

  const result = await prisma.$executeRaw`
    UPDATE "User"
    SET password = ${hash},
        role = 'ADMIN',
        "emailVerified" = NOW()
    WHERE email = 'info@devcom.ch'
  `

  console.log('✅ Lignes mises à jour:', result)

  // Vérifier
  const user = await prisma.user.findUnique({
    where: { email: 'info@devcom.ch' },
    select: { id: true, email: true, role: true, password: true }
  })

  if (user) {
    console.log('\n✅ Utilisateur configuré:')
    console.log('   Email:', user.email)
    console.log('   Role:', user.role)
    console.log('   Hash:', user.password?.substring(0, 30) + '...')

    // Test du mot de passe
    if (user.password) {
      const isValid = await bcrypt.compare(password, user.password)
      console.log('   Test password:', isValid ? '✅ OK' : '❌ ERREUR')
    }
  }

  await prisma.$disconnect()
}

quickSetup().catch(console.error)
