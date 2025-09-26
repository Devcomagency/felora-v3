const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function createTestUser() {
  try {
    // Supprimer les données existantes pour recommencer proprement
    await prisma.escortProfile.deleteMany({})
    await prisma.wallet.deleteMany({})
    await prisma.user.deleteMany({})

    console.log('🧹 Base de données nettoyée')

    // Créer un utilisateur avec l'ID exact de la session actuelle
    const hashedPassword = await bcrypt.hash('password123', 10)

    const user = await prisma.user.create({
      data: {
        id: 'cmg112vrp0000kj4ovpr6v71v', // ID exact de la session
        email: 'test@felora.com',
        password: hashedPassword,
        passwordHash: hashedPassword,
        name: 'Test User',
        phone: '+41791234567',
        role: 'ESCORT'
      }
    })

    console.log('✅ Utilisateur créé avec ID session:', user.email)

    // Créer le profil escort avec les bonnes données
    const escortProfile = await prisma.escortProfile.create({
      data: {
        userId: user.id,
          stageName: 'Sofia',
          firstName: 'Sofia',
          city: 'Genève',
          description: 'Escort de charme à Genève',
          status: 'ACTIVE',
          isVerifiedBadge: true,
          hasProfilePhoto: true,
          profilePhoto: 'https://picsum.photos/300/300?random=1',
          galleryPhotos: JSON.stringify([
            { type: 'image', url: 'https://picsum.photos/600/900?random=1' },
            { type: 'image', url: 'https://picsum.photos/600/900?random=2' },
            { type: 'image', url: 'https://picsum.photos/600/900?random=3' }
          ]),
          services: JSON.stringify(['Escort', 'Compagnie', 'Dîner']),
          languages: JSON.stringify(['Français', 'Anglais']),
          rate1H: 400,
          dateOfBirth: new Date('1995-01-01'),
          views: 150,
          nationality: 'Suisse',
          workingArea: 'Genève',
          rates: JSON.stringify({
            '1h': 400,
            '2h': 700,
            'nuit': 1200
          }),
          availability: 'Disponible 24h/24',
          videos: JSON.stringify([])
        }
      })

    console.log('✅ Profil escort créé:', escortProfile.stageName)

    // Créer le wallet
    const wallet = await prisma.wallet.create({
      data: {
        userId: user.id,
        balance: 1000
      }
    })

    console.log('✅ Wallet créé avec balance:', wallet.balance)

    console.log('\n🎉 Données de test créées avec succès!')
    console.log('Email: test@felora.com')
    console.log('Mot de passe: password123')

  } catch (error) {
    console.error('❌ Erreur:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createTestUser()
