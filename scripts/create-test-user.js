const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function createTestUser() {
  try {
    // Vérifier si l'utilisateur existe déjà
    let user = await prisma.user.findUnique({
      where: { email: 'test@felora.com' }
    })

    if (!user) {
      // Créer un utilisateur de test
      const hashedPassword = await bcrypt.hash('password123', 10)
      
      user = await prisma.user.create({
        data: {
          email: 'test@felora.com',
          password: hashedPassword,
          passwordHash: hashedPassword, // Ajouter les deux champs pour compatibilité
          name: 'Test User',
          phone: '+41791234567',
          role: 'ESCORT' // Changer en ESCORT pour accéder au dashboard
        }
      })

      console.log('✅ Utilisateur créé:', user.email)
    } else {
      console.log('✅ Utilisateur existe déjà:', user.email)
    }

    // Vérifier si le profil escort existe déjà
    let escortProfile = await prisma.escortProfile.findUnique({
      where: { userId: user.id }
    })

    if (!escortProfile) {
      escortProfile = await prisma.escortProfile.create({
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
    } else {
      console.log('✅ Profil escort existe déjà:', escortProfile.stageName)
    }

    // Vérifier si le wallet existe déjà
    let wallet = await prisma.wallet.findUnique({
      where: { userId: user.id }
    })

    if (!wallet) {
      wallet = await prisma.wallet.create({
        data: {
          userId: user.id,
          balance: 1000
        }
      })

      console.log('✅ Wallet créé avec balance:', wallet.balance)
    } else {
      console.log('✅ Wallet existe déjà avec balance:', wallet.balance)
    }

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
