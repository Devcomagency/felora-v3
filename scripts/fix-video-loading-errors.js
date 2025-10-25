const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function fixVideoLoadingErrors() {
  console.log('🔧 Correction des erreurs de chargement vidéo...')

  try {
    // 1. Trouver toutes les vidéos récentes qui pourraient causer des erreurs
    console.log('\n1️⃣ Recherche des vidéos problématiques...')
    
    const recentVideos = await prisma.media.findMany({
      where: {
        type: 'VIDEO',
        createdAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Dernière semaine
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
      take: 20
    })

    console.log(`📊 ${recentVideos.length} vidéos récentes trouvées`)

    if (recentVideos.length === 0) {
      console.log('✅ Aucune vidéo récente trouvée')
      return
    }

    // 2. Analyser chaque vidéo et identifier les problèmes potentiels
    console.log('\n2️⃣ Analyse des vidéos...')
    
    const problematicVideos = []
    
    for (const video of recentVideos) {
      console.log(`\n🔍 Vidéo ${video.id}:`)
      console.log(`   URL: ${video.url}`)
      console.log(`   Thumb: ${video.thumbUrl}`)
      console.log(`   Créée: ${video.createdAt.toISOString()}`)

      let issues = []
      
      // Vérifier l'URL
      if (!video.url || video.url === '') {
        issues.push('URL vide')
      } else if (video.url.includes('undefined')) {
        issues.push('URL undefined')
      } else if (video.url.includes('null')) {
        issues.push('URL null')
      } else if (!video.url.startsWith('http') && !video.url.startsWith('/')) {
        issues.push('URL invalide')
      }

      // Vérifier le thumbnail
      if (video.thumbUrl && video.thumbUrl.includes('undefined')) {
        issues.push('Thumb undefined')
      }

      if (issues.length > 0) {
        console.log(`   ⚠️ Problèmes détectés: ${issues.join(', ')}`)
        problematicVideos.push({ ...video, issues })
      } else {
        console.log(`   ✅ URL semble valide`)
      }
    }

    console.log(`\n📊 ${problematicVideos.length} vidéos problématiques trouvées`)

    // 3. Corriger les vidéos problématiques
    if (problematicVideos.length > 0) {
      console.log('\n3️⃣ Correction des vidéos problématiques...')
      
      for (const video of problematicVideos) {
        console.log(`\n🔧 Correction vidéo ${video.id}:`)
        console.log(`   Problèmes: ${video.issues.join(', ')}`)

        let newUrl = video.url
        let newThumbUrl = video.thumbUrl

        // Corriger l'URL principale
        if (video.url && video.url.includes('undefined')) {
          newUrl = video.url.replace('undefined/', 'https://media.felora.ch/')
          console.log(`   ✅ URL corrigée: ${newUrl}`)
        } else if (!video.url || video.url === '') {
          // Si l'URL est vide, supprimer la vidéo
          try {
            await prisma.media.delete({
              where: { id: video.id }
            })
            console.log(`   🗑️ Vidéo ${video.id} supprimée (URL vide)`)
            continue
          } catch (error) {
            console.error(`   ❌ Erreur suppression ${video.id}:`, error.message)
            continue
          }
        }

        // Corriger le thumbnail
        if (video.thumbUrl && video.thumbUrl.includes('undefined')) {
          newThumbUrl = video.thumbUrl.replace('undefined/', 'https://media.felora.ch/')
          console.log(`   ✅ Thumb corrigé: ${newThumbUrl}`)
        }

        // Mettre à jour en base de données
        try {
          await prisma.media.update({
            where: { id: video.id },
            data: {
              url: newUrl,
              thumbUrl: newThumbUrl
            }
          })
          console.log(`   ✅ Vidéo ${video.id} mise à jour`)
        } catch (error) {
          console.error(`   ❌ Erreur mise à jour ${video.id}:`, error.message)
        }
      }
    }

    // 4. Vérifier les vidéos avec des URLs qui pourraient ne pas exister
    console.log('\n4️⃣ Vérification des URLs CDN...')
    
    const cdnVideos = await prisma.media.findMany({
      where: {
        type: 'VIDEO',
        url: { startsWith: 'https://media.felora.ch/' }
      },
      select: { 
        id: true, 
        url: true, 
        createdAt: true
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    })

    console.log(`📊 ${cdnVideos.length} vidéos CDN trouvées`)

    for (const video of cdnVideos) {
      console.log(`\n🔍 Vidéo CDN ${video.id}:`)
      console.log(`   URL: ${video.url}`)
      console.log(`   Créée: ${video.createdAt.toISOString()}`)
      
      // Vérifier si l'URL semble valide
      if (video.url.includes('profiles/') && video.url.includes('.mp4')) {
        console.log(`   ✅ URL CDN semble valide`)
      } else {
        console.log(`   ⚠️ URL CDN suspecte`)
      }
    }

    // 5. Statistiques finales
    console.log('\n5️⃣ Statistiques finales...')
    
    const totalVideos = await prisma.media.count({
      where: { type: 'VIDEO' }
    })
    
    const videosWithValidUrls = await prisma.media.count({
      where: {
        type: 'VIDEO',
        url: { not: { contains: 'undefined' } },
        url: { not: { contains: 'null' } },
        url: { not: '' }
      }
    })

    console.log(`\n🎉 Correction terminée !`)
    console.log(`   - Total vidéos: ${totalVideos}`)
    console.log(`   - Vidéos avec URLs valides: ${videosWithValidUrls}`)
    console.log(`   - Vidéos problématiques corrigées: ${problematicVideos.length}`)

    if (videosWithValidUrls === totalVideos) {
      console.log('✅ Toutes les vidéos ont des URLs valides !')
    } else {
      console.log('⚠️ Il reste des vidéos avec des URLs problématiques')
    }

    // 6. Recommandations
    console.log('\n6️⃣ Recommandations...')
    console.log('💡 Si vous voyez encore des erreurs vidéo:')
    console.log('   1. Vérifiez que les fichiers existent sur le CDN')
    console.log('   2. Testez les URLs dans un navigateur')
    console.log('   3. Vérifiez les permissions des fichiers')
    console.log('   4. Assurez-vous que le CDN est accessible')

  } catch (error) {
    console.error('❌ Erreur lors de la correction des vidéos:', error)
  } finally {
    await prisma.$disconnect()
  }
}

fixVideoLoadingErrors()
