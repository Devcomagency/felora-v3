const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function createEscortDirect() {
  try {
    const email = 'escort@felora.com'
    const hashedPassword = await bcrypt.hash('password123', 10)
    
    // Créer l'utilisateur escort directement
    const user = await prisma.user.upsert({
      where: { email },
      update: {
        role: 'ESCORT',
        password: hashedPassword,
        passwordHash: hashedPassword
      },
      create: {
        email,
        password: hashedPassword,
        passwordHash: hashedPassword,
        name: 'Escort Test',
        phone: '+41791234568',
        role: 'ESCORT'
      }
    })

    console.log('✅ Utilisateur escort créé:', user.email)

    // Créer le profil escort
    const escortProfile = await prisma.escortProfile.upsert({
      where: { userId: user.id },
      update: {
        stageName: 'Sofia Test',
        firstName: 'Sofia',
        city: 'Genève',
        description: 'Escort de test pour debug',
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
      },
      create: {
        userId: user.id,
        stageName: 'Sofia Test',
        firstName: 'Sofia',
        city: 'Genève',
        description: 'Escort de test pour debug',
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
    const wallet = await prisma.wallet.upsert({
      where: { userId: user.id },
      update: { balance: 1000 },
      create: {
        userId: user.id,
        balance: 1000
      }
    })

    console.log('✅ Wallet créé avec balance:', wallet.balance)

    // Créer la vérification email
    await prisma.emailVerification.upsert({
      where: { email },
      update: {
        verifiedAt: new Date(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
      },
      create: {
        email,
        codeHash: '123456',
        verifiedAt: new Date(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
      }
    })

    console.log('✅ Vérification email créée')

    console.log('\n🎉 Escort de test créée avec succès!')
    console.log('Email: escort@felora.com')
    console.log('Mot de passe: password123')
    console.log('Role: ESCORT')

  } catch (error) {
    console.error('❌ Erreur:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createEscortDirect()
