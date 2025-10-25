const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function checkVideoUrls() {
  console.log('🔍 Vérification des URLs vidéo...')

  try {
    // 1. Récupérer toutes les vidéos récentes
    console.log('\n1️⃣ Récupération des vidéos récentes...')
    
    const recentVideos = await prisma.media.findMany({
      where: {
        type: 'VIDEO',
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Dernière 24 heures
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
      orderBy: { createdAt: 'desc' }
    })

    console.log(`📊 ${recentVideos.length} vidéos récentes trouvées`)

    if (recentVideos.length === 0) {
      console.log('✅ Aucune vidéo récente trouvée')
      return
    }

    // 2. Analyser chaque vidéo
    console.log('\n2️⃣ Analyse des URLs vidéo...')
    
    for (const video of recentVideos) {
      console.log(`\n🔍 Vidéo ${video.id}:`)
      console.log(`   Type: ${video.type}`)
      console.log(`   Owner: ${video.ownerType} (${video.ownerId})`)
      console.log(`   URL: ${video.url}`)
      console.log(`   Thumb: ${video.thumbUrl}`)
      console.log(`   Créée: ${video.createdAt.toISOString()}`)

      // Vérifier la structure de l'URL
      if (video.url) {
        if (video.url.startsWith('https://media.felora.ch/')) {
          console.log(`   ✅ URL CDN valide`)
        } else if (video.url.startsWith('/uploads/')) {
          console.log(`   ✅ URL locale valide`)
        } else if (video.url.startsWith('http://') || video.url.startsWith('https://')) {
          console.log(`   ✅ URL externe valide`)
        } else {
          console.log(`   ⚠️ URL suspecte: ${video.url}`)
        }
      } else {
        console.log(`   ❌ URL manquante`)
      }

      // Vérifier le thumbnail
      if (video.thumbUrl) {
        if (video.thumbUrl.startsWith('https://media.felora.ch/')) {
          console.log(`   ✅ Thumb CDN valide`)
        } else if (video.thumbUrl.startsWith('/uploads/')) {
          console.log(`   ✅ Thumb locale valide`)
        } else {
          console.log(`   ⚠️ Thumb suspect: ${video.thumbUrl}`)
        }
      } else {
        console.log(`   ℹ️ Thumb manquant (normal pour les vidéos)`)
      }
    }

    // 3. Vérifier les vidéos avec des patterns d'URL suspects
    console.log('\n3️⃣ Recherche de patterns suspects...')
    
    const suspiciousVideos = await prisma.media.findMany({
      where: {
        type: 'VIDEO',
        OR: [
          { url: { contains: 'undefined' } },
          { url: { contains: 'null' } },
          { url: { contains: 'NaN' } },
          { url: { contains: 'undefined' } },
          { url: { startsWith: 'undefined' } },
          { url: { startsWith: 'null' } }
        ]
      },
      select: { 
        id: true, 
        url: true, 
        thumbUrl: true, 
        createdAt: true
      }
    })

    console.log(`📊 ${suspiciousVideos.length} vidéos suspectes trouvées`)

    if (suspiciousVideos.length > 0) {
      console.log('\n⚠️ Vidéos suspectes détectées:')
      for (const video of suspiciousVideos) {
        console.log(`   - ${video.id}: ${video.url}`)
      }
    } else {
      console.log('✅ Aucune vidéo suspecte trouvée')
    }

    // 4. Statistiques générales
    console.log('\n4️⃣ Statistiques générales...')
    
    const totalVideos = await prisma.media.count({
      where: { type: 'VIDEO' }
    })
    
    const videosWithThumb = await prisma.media.count({
      where: { 
        type: 'VIDEO',
        thumbUrl: { not: null }
      }
    })
    
    const videosWithoutThumb = totalVideos - videosWithThumb

    console.log(`\n📈 Statistiques vidéo:`)
    console.log(`   - Total vidéos: ${totalVideos}`)
    console.log(`   - Avec thumbnail: ${videosWithThumb}`)
    console.log(`   - Sans thumbnail: ${videosWithoutThumb}`)
    console.log(`   - Vidéos récentes (24h): ${recentVideos.length}`)

    // 5. Recommandations
    console.log('\n5️⃣ Recommandations...')
    
    if (suspiciousVideos.length > 0) {
      console.log('⚠️ Actions recommandées:')
      console.log('   1. Corriger les URLs suspectes')
      console.log('   2. Vérifier la configuration CDN')
      console.log('   3. Tester les uploads de vidéos')
    } else {
      console.log('✅ Toutes les vidéos semblent avoir des URLs valides')
      console.log('💡 Si vous voyez encore des erreurs vidéo:')
      console.log('   1. Vérifiez que les fichiers existent sur le CDN')
      console.log('   2. Vérifiez les permissions des fichiers')
      console.log('   3. Testez les URLs dans un navigateur')
    }

  } catch (error) {
    console.error('❌ Erreur lors de la vérification des URLs:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkVideoUrls()
