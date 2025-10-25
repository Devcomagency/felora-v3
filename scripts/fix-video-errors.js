const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function fixVideoErrors() {
  console.log('🔧 Réparation des erreurs vidéo...')

  try {
    // 1. Trouver toutes les vidéos avec des problèmes
    console.log('\n1️⃣ Recherche des vidéos problématiques...')
    
    const problematicVideos = await prisma.media.findMany({
      where: {
        type: 'VIDEO',
        OR: [
          { url: { contains: 'undefined' } },
          { url: { contains: 'null' } },
          { url: { equals: '' } },
          { thumbUrl: { contains: 'undefined' } },
          { thumbUrl: { contains: 'null' } }
        ]
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

    console.log(`📊 ${problematicVideos.length} vidéos problématiques trouvées`)

    if (problematicVideos.length === 0) {
      console.log('✅ Aucune vidéo problématique trouvée !')
      return
    }

    // 2. Analyser chaque vidéo problématique
    console.log('\n2️⃣ Analyse des vidéos problématiques...')
    
    for (const video of problematicVideos) {
      console.log(`\n🔍 Vidéo ${video.id}:`)
      console.log(`   Type: ${video.type}`)
      console.log(`   Owner: ${video.ownerType} (${video.ownerId})`)
      console.log(`   URL: ${video.url}`)
      console.log(`   Thumb: ${video.thumbUrl}`)
      console.log(`   Créée: ${video.createdAt.toISOString()}`)

      // Identifier le type de problème
      let issues = []
      if (!video.url || video.url === '') issues.push('URL vide')
      if (video.url && video.url.includes('undefined')) issues.push('URL undefined')
      if (video.url && video.url.includes('null')) issues.push('URL null')
      if (video.thumbUrl && video.thumbUrl.includes('undefined')) issues.push('Thumb undefined')
      if (video.thumbUrl && video.thumbUrl.includes('null')) issues.push('Thumb null')

      console.log(`   Problèmes: ${issues.join(', ')}`)

      // Essayer de corriger l'URL
      let newUrl = video.url
      if (video.url && video.url.includes('undefined')) {
        newUrl = video.url.replace('undefined/', 'https://media.felora.ch/')
        console.log(`   ✅ URL corrigée: ${newUrl}`)
      } else if (!video.url || video.url === '') {
        // Si l'URL est vide, marquer comme supprimé
        newUrl = 'DELETED'
        console.log(`   ⚠️ URL vide - marqué comme supprimé`)
      }

      // Essayer de corriger le thumbnail
      let newThumbUrl = video.thumbUrl
      if (video.thumbUrl && video.thumbUrl.includes('undefined')) {
        newThumbUrl = video.thumbUrl.replace('undefined/', 'https://media.felora.ch/')
        console.log(`   ✅ Thumb corrigé: ${newThumbUrl}`)
      } else if (video.thumbUrl && video.thumbUrl.includes('null')) {
        newThumbUrl = null
        console.log(`   ✅ Thumb null supprimé`)
      }

      // Mettre à jour en base de données
      try {
        if (newUrl === 'DELETED') {
          // Supprimer la vidéo si elle est vraiment cassée
          await prisma.media.delete({
            where: { id: video.id }
          })
          console.log(`   🗑️ Vidéo ${video.id} supprimée (URL vide)`)
        } else {
          // Mettre à jour la vidéo
          await prisma.media.update({
            where: { id: video.id },
            data: {
              url: newUrl,
              thumbUrl: newThumbUrl
            }
          })
          console.log(`   ✅ Vidéo ${video.id} mise à jour`)
        }
      } catch (error) {
        console.error(`   ❌ Erreur mise à jour ${video.id}:`, error.message)
      }
    }

    // 3. Vérifier les vidéos avec des URLs valides mais qui pourraient poser problème
    console.log('\n3️⃣ Vérification des vidéos avec URLs valides...')
    
    const validVideos = await prisma.media.findMany({
      where: {
        type: 'VIDEO',
        url: { not: { contains: 'undefined' } },
        url: { not: { contains: 'null' } },
        url: { not: '' }
      },
      select: { 
        id: true, 
        url: true, 
        thumbUrl: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    })

    console.log(`📊 ${validVideos.length} vidéos valides récentes vérifiées`)

    for (const video of validVideos) {
      console.log(`\n🔍 Vidéo ${video.id}:`)
      console.log(`   URL: ${video.url}`)
      console.log(`   Thumb: ${video.thumbUrl}`)
      console.log(`   Créée: ${video.createdAt.toISOString()}`)
      
      // Vérifier si l'URL semble valide
      if (video.url && video.url.startsWith('https://media.felora.ch/')) {
        console.log(`   ✅ URL semble valide`)
      } else {
        console.log(`   ⚠️ URL suspecte`)
      }
    }

    // 4. Statistiques finales
    console.log('\n4️⃣ Statistiques finales...')
    
    const totalVideos = await prisma.media.count({
      where: { type: 'VIDEO' }
    })
    
    const problematicVideosAfter = await prisma.media.count({
      where: {
        type: 'VIDEO',
        OR: [
          { url: { contains: 'undefined' } },
          { url: { contains: 'null' } },
          { url: { equals: '' } },
          { url: null }
        ]
      }
    })

    console.log(`\n🎉 Réparation terminée !`)
    console.log(`   - Total vidéos: ${totalVideos}`)
    console.log(`   - Vidéos problématiques restantes: ${problematicVideosAfter}`)
    console.log(`   - Vidéos corrigées: ${problematicVideos.length - problematicVideosAfter}`)

    if (problematicVideosAfter === 0) {
      console.log('✅ Toutes les vidéos problématiques ont été corrigées !')
    } else {
      console.log('⚠️ Il reste des vidéos problématiques')
    }

  } catch (error) {
    console.error('❌ Erreur lors de la réparation des vidéos:', error)
  } finally {
    await prisma.$disconnect()
  }
}

fixVideoErrors()
