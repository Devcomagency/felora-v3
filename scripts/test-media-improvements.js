/**
 * Script de test pour les améliorations média
 * Vérifie que tous les systèmes fonctionnent correctement
 */

const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function testMediaImprovements() {
  console.log('🧪 Test des améliorations média...\n')

  try {
    // 1. Test de la base de données
    console.log('1️⃣ Test de la base de données...')
    const mediaCount = await prisma.media.count()
    console.log(`   ✅ ${mediaCount} médias trouvés en base`)

    // 2. Test des URLs undefined
    console.log('\n2️⃣ Test des URLs undefined...')
    const undefinedUrls = await prisma.media.findMany({
      where: {
        OR: [
          { url: { contains: 'undefined' } },
          { thumbUrl: { contains: 'undefined' } }
        ]
      },
      select: { id: true, url: true, thumbUrl: true }
    })
    
    if (undefinedUrls.length > 0) {
      console.log(`   ⚠️  ${undefinedUrls.length} URLs avec "undefined" trouvées:`)
      undefinedUrls.forEach(media => {
        console.log(`      - ${media.id}: ${media.url}`)
      })
    } else {
      console.log('   ✅ Aucune URL undefined trouvée')
    }

    // 3. Test des profils escort
    console.log('\n3️⃣ Test des profils escort...')
    const escortProfiles = await prisma.escortProfile.findMany({
      select: { id: true, stageName: true, profilePhoto: true },
      take: 5
    })
    
    console.log(`   ✅ ${escortProfiles.length} profils escort testés`)
    escortProfiles.forEach(profile => {
      const hasUndefined = profile.profilePhoto?.includes('undefined')
      console.log(`      - ${profile.stageName}: ${hasUndefined ? '❌ undefined' : '✅ OK'}`)
    })

    // 4. Test des médias récents
    console.log('\n4️⃣ Test des médias récents...')
    const recentMedia = await prisma.media.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: { id: true, url: true, type: true, createdAt: true }
    })
    
    console.log(`   ✅ ${recentMedia.length} médias récents testés`)
    recentMedia.forEach(media => {
      const hasUndefined = media.url?.includes('undefined')
      console.log(`      - ${media.type} (${media.createdAt.toISOString().split('T')[0]}): ${hasUndefined ? '❌ undefined' : '✅ OK'}`)
    })

    // 5. Test des variables d'environnement
    console.log('\n5️⃣ Test des variables d\'environnement...')
    const requiredVars = [
      'NEXT_PUBLIC_CLOUDFLARE_R2_PUBLIC_URL',
      'CLOUDFLARE_R2_PUBLIC_URL',
      'CLOUDFLARE_R2_ENDPOINT',
      'CLOUDFLARE_R2_ACCESS_KEY',
      'CLOUDFLARE_R2_SECRET_KEY',
      'CLOUDFLARE_R2_BUCKET'
    ]
    
    requiredVars.forEach(varName => {
      const value = process.env[varName]
      if (value) {
        console.log(`   ✅ ${varName}: ${value.substring(0, 20)}...`)
      } else {
        console.log(`   ❌ ${varName}: NON DÉFINIE`)
      }
    })

    // 6. Statistiques générales
    console.log('\n6️⃣ Statistiques générales...')
    const stats = await prisma.media.groupBy({
      by: ['type'],
      _count: { type: true }
    })
    
    stats.forEach(stat => {
      console.log(`   📊 ${stat.type}: ${stat._count.type} médias`)
    })

    console.log('\n🎉 Test terminé avec succès !')
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Exécuter le test
testMediaImprovements()
