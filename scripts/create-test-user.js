const bcrypt = require('bcryptjs')
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function createTestUser() {
  try {
    // Hasher le mot de passe
    const password = '123456'
    const hashedPassword = await bcrypt.hash(password, 10)
    
    // Supprimer l'ancien utilisateur s'il existe
    await prisma.user.deleteMany({
      where: { email: 'test@felora.com' }
    })
    
    // Créer nouvel utilisateur
    const user = await prisma.user.create({
      data: {
        email: 'test@felora.com',
        name: 'Test User',
        password: hashedPassword,
        passwordHash: hashedPassword,
        role: 'ESCORT',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    })
    
    console.log('✅ Utilisateur créé avec succès!')
    console.log('📧 Email:', user.email)
    console.log('🔑 Mot de passe:', password)
    console.log('👤 ID:', user.id)
    
  } catch (error) {
    console.error('❌ Erreur:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createTestUser()