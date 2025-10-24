/**
 * Script de test pour vérifier le système de vues de médias
 */

const { PrismaClient } = require('@prisma/client')

async function testMediaViews() {
  console.log('🧪 Test du système de vues de médias...')
  
  const prisma = new PrismaClient()
  
  try {
    // 1. Tester la création d'une vue
    console.log('\n1️⃣ Test de création d\'une vue...')
    const view = await prisma.mediaView.create({
      data: {
        mediaId: 'test-media-123',
        timestamp: new Date()
      }
    })
    console.log('   ✅ Vue créée:', view.id)
    
    // 2. Tester le comptage des vues
    console.log('\n2️⃣ Test de comptage des vues...')
    const viewCount = await prisma.mediaView.count({
      where: {
        mediaId: 'test-media-123'
      }
    })
    console.log('   ✅ Nombre de vues:', viewCount)
    
    // 3. Tester avec un autre média
    console.log('\n3️⃣ Test avec un autre média...')
    await prisma.mediaView.create({
      data: {
        mediaId: 'test-media-456',
        timestamp: new Date()
      }
    })
    
    const viewCount2 = await prisma.mediaView.count({
      where: {
        mediaId: 'test-media-456'
      }
    })
    console.log('   ✅ Nombre de vues pour media-456:', viewCount2)
    
    // 4. Lister toutes les vues
    console.log('\n4️⃣ Liste de toutes les vues...')
    const allViews = await prisma.mediaView.findMany({
      orderBy: { timestamp: 'desc' },
      take: 10
    })
    allViews.forEach(view => {
      console.log(`   - ${view.mediaId}: ${view.timestamp.toISOString()}`)
    })
    
    console.log('\n🎉 Test terminé avec succès !')
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testMediaViews()
