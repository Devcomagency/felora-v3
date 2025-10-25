const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function diagnoseClientErrors() {
  console.log('🔍 DIAGNOSTIC DES ERREURS CLIENT')
  console.log('=' .repeat(40))

  try {
    // 1. Vérifier les vidéos récentes
    console.log('\n1️⃣ Vidéos récentes (dernières 24h)...')
    
    const recentVideos = await prisma.media.findMany({
      where: {
        type: 'VIDEO',
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
        }
      },
      select: { 
        id: true, 
        url: true, 
        thumbUrl: true, 
        createdAt: true,
        ownerType: true,
        ownerId: true
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    })

    console.log(`📊 ${recentVideos.length} vidéos récentes trouvées`)

    recentVideos.forEach((video, index) => {
      console.log(`\n${index + 1}. Vidéo ${video.id}:`)
      console.log(`   URL: ${video.url}`)
      console.log(`   Thumb: ${video.thumbUrl}`)
      console.log(`   Créée: ${video.createdAt.toISOString()}`)
      console.log(`   Propriétaire: ${video.ownerType} (${video.ownerId})`)
      
      // Vérifier l'URL
      if (!video.url || video.url.includes('undefined') || video.url.includes('null') || video.url.startsWith('media:')) {
        console.log(`   ❌ URL INVALIDE`)
      } else if (video.url.startsWith('https://media.felora.ch/')) {
        console.log(`   ✅ URL CDN valide`)
      } else {
        console.log(`   ⚠️ URL suspecte`)
      }
      
      // Vérifier le thumbnail
      if (!video.thumbUrl || video.thumbUrl === 'null' || video.thumbUrl.includes('undefined')) {
        console.log(`   ❌ Thumbnail manquant`)
      } else {
        console.log(`   ✅ Thumbnail valide`)
      }
    })

    // 2. Vérifier les URLs problématiques
    console.log('\n2️⃣ Recherche d\'URLs problématiques...')
    
    const problematicUrls = await prisma.media.findMany({
      where: {
        type: 'VIDEO',
        OR: [
          { url: { contains: 'undefined' } },
          { url: { contains: 'null' } },
          { url: '' },
          { url: { startsWith: 'media:' } }
        ]
      },
      select: { id: true, url: true, createdAt: true }
    })

    if (problematicUrls.length > 0) {
      console.log(`❌ ${problematicUrls.length} URLs problématiques trouvées:`)
      problematicUrls.forEach(video => {
        console.log(`   - ${video.id}: ${video.url}`)
      })
    } else {
      console.log('✅ Aucune URL problématique trouvée')
    }

    // 3. Vérifier les thumbnails manquants
    console.log('\n3️⃣ Vérification des thumbnails...')
    
    const missingThumbs = await prisma.media.findMany({
      where: {
        type: 'VIDEO',
        OR: [
          { thumbUrl: null },
          { thumbUrl: '' },
          { thumbUrl: 'null' },
          { thumbUrl: { contains: 'undefined' } }
        ]
      },
      select: { id: true, thumbUrl: true, url: true }
    })

    if (missingThumbs.length > 0) {
      console.log(`❌ ${missingThumbs.length} vidéos sans thumbnails:`)
      missingThumbs.forEach(video => {
        console.log(`   - ${video.id}: ${video.thumbUrl}`)
      })
    } else {
      console.log('✅ Tous les thumbnails sont présents')
    }

    // 4. Statistiques de performance
    console.log('\n4️⃣ Statistiques de performance...')
    
    const totalVideos = await prisma.media.count({
      where: { type: 'VIDEO' }
    })
    
    const cdnVideos = await prisma.media.count({
      where: {
        type: 'VIDEO',
        url: { startsWith: 'https://media.felora.ch/' }
      }
    })
    
    const validThumbs = await prisma.media.count({
      where: {
        type: 'VIDEO',
        thumbUrl: { not: null },
        thumbUrl: { not: '' },
        thumbUrl: { not: 'null' }
      }
    })

    console.log(`📊 Total vidéos: ${totalVideos}`)
    console.log(`🌐 URLs CDN: ${cdnVideos} (${((cdnVideos/totalVideos)*100).toFixed(1)}%)`)
    console.log(`🖼️ Thumbnails valides: ${validThumbs} (${((validThumbs/totalVideos)*100).toFixed(1)}%)`)

    // 5. Recommandations
    console.log('\n5️⃣ Recommandations...')
    
    if (problematicUrls.length > 0) {
      console.log('🔧 Actions nécessaires:')
      console.log('   1. Corriger les URLs problématiques')
      console.log('   2. Vérifier les APIs d\'upload')
    }
    
    if (missingThumbs.length > 0) {
      console.log('🔧 Actions nécessaires:')
      console.log('   1. Générer les thumbnails manquants')
      console.log('   2. Vérifier le processus de génération')
    }
    
    if (problematicUrls.length === 0 && missingThumbs.length === 0) {
      console.log('✅ Aucune action nécessaire - Base de données propre')
      console.log('💡 L\'erreur vient probablement du côté client (JavaScript)')
      console.log('💡 Vérifiez la console du navigateur pour plus de détails')
    }

    console.log('\n🎉 DIAGNOSTIC TERMINÉ !')
    console.log('=' .repeat(40))

  } catch (error) {
    console.error('❌ Erreur lors du diagnostic:', error)
  } finally {
    await prisma.$disconnect()
  }
}

diagnoseClientErrors()
