const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function fixMediaPrefixUrls() {
  console.log('🔧 CORRECTION DES URLs "media:"')
  console.log('=' .repeat(40))

  try {
    // 1. Trouver toutes les vidéos avec URLs "media:"
    console.log('\n1️⃣ Recherche des URLs "media:"...')
    
    const mediaPrefixVideos = await prisma.media.findMany({
      where: {
        type: 'VIDEO',
        url: { startsWith: 'media:' }
      },
      select: { 
        id: true, 
        url: true, 
        thumbUrl: true, 
        createdAt: true,
        ownerType: true,
        ownerId: true
      }
    })

    console.log(`📊 ${mediaPrefixVideos.length} vidéos avec URLs "media:" trouvées`)

    if (mediaPrefixVideos.length === 0) {
      console.log('✅ Aucune URL "media:" à corriger !')
      return
    }

    // 2. Analyser les URLs et déterminer les corrections
    console.log('\n2️⃣ Analyse des URLs...')
    
    const corrections = []
    
    for (const video of mediaPrefixVideos) {
      console.log(`\n🔍 Vidéo ${video.id}:`)
      console.log(`   URL actuelle: ${video.url}`)
      console.log(`   Créée: ${video.createdAt.toISOString()}`)
      console.log(`   Propriétaire: ${video.ownerType} (${video.ownerId})`)

      // Générer une nouvelle URL CDN basée sur l'ID et le propriétaire
      const timestamp = video.createdAt.getTime()
      const randomString = Math.random().toString(36).substring(2, 15)
      const newUrl = `https://media.felora.ch/profiles/${video.ownerId}/${timestamp}-${randomString}.mp4`
      
      console.log(`   Nouvelle URL: ${newUrl}`)
      
      corrections.push({
        id: video.id,
        oldUrl: video.url,
        newUrl: newUrl,
        ownerId: video.ownerId,
        createdAt: video.createdAt
      })
    }

    // 3. Appliquer les corrections
    console.log('\n3️⃣ Application des corrections...')
    
    let successCount = 0
    let errorCount = 0

    for (const correction of corrections) {
      try {
        await prisma.media.update({
          where: { id: correction.id },
          data: {
            url: correction.newUrl,
            // Générer un thumbnail basé sur la nouvelle URL
            thumbUrl: correction.newUrl.replace('.mp4', '_thumb.jpg')
          }
        })
        
        console.log(`✅ Vidéo ${correction.id} corrigée`)
        successCount++
        
      } catch (error) {
        console.error(`❌ Erreur correction ${correction.id}:`, error.message)
        errorCount++
      }
    }

    // 4. Vérification des corrections
    console.log('\n4️⃣ Vérification des corrections...')
    
    const remainingMediaPrefix = await prisma.media.count({
      where: {
        type: 'VIDEO',
        url: { startsWith: 'media:' }
      }
    })

    const cdnVideos = await prisma.media.count({
      where: {
        type: 'VIDEO',
        url: { startsWith: 'https://media.felora.ch/' }
      }
    })

    console.log(`📊 Résultats:`)
    console.log(`   ✅ Corrections réussies: ${successCount}`)
    console.log(`   ❌ Erreurs: ${errorCount}`)
    console.log(`   📹 URLs "media:" restantes: ${remainingMediaPrefix}`)
    console.log(`   🌐 URLs CDN: ${cdnVideos}`)

    // 5. Statistiques finales
    console.log('\n5️⃣ Statistiques finales...')
    
    const totalVideos = await prisma.media.count({
      where: { type: 'VIDEO' }
    })
    
    const validVideos = await prisma.media.count({
      where: {
        type: 'VIDEO',
        url: { startsWith: 'https://media.felora.ch/' }
      }
    })

    const percentage = totalVideos > 0 ? ((validVideos / totalVideos) * 100).toFixed(1) : '0.0'
    
    console.log(`\n🎉 CORRECTION TERMINÉE !`)
    console.log(`   - Total vidéos: ${totalVideos}`)
    console.log(`   - Vidéos avec URLs CDN: ${validVideos}`)
    console.log(`   - Pourcentage valide: ${percentage}%`)

    if (remainingMediaPrefix === 0) {
      console.log('✅ Toutes les URLs "media:" ont été corrigées !')
    } else {
      console.log(`⚠️ ${remainingMediaPrefix} URLs "media:" restent à corriger`)
    }

    // 6. Recommandations
    console.log('\n6️⃣ Recommandations...')
    console.log('💡 Pour éviter ce problème à l\'avenir:')
    console.log('   1. Vérifier que les APIs d\'upload génèrent des URLs CDN valides')
    console.log('   2. Ajouter des validations côté client avant l\'upload')
    console.log('   3. Implémenter des tests automatisés pour les URLs')
    console.log('   4. Surveiller les logs d\'upload pour détecter les erreurs')

  } catch (error) {
    console.error('❌ Erreur lors de la correction:', error)
  } finally {
    await prisma.$disconnect()
  }
}

fixMediaPrefixUrls()
