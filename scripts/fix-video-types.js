const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function fixVideoTypes() {
  console.log('🔧 Correction des types de vidéos...')

  try {
    // 1. Trouver toutes les vidéos avec type undefined
    console.log('\n1️⃣ Recherche des vidéos avec type undefined...')
    
    const undefinedTypeVideos = await prisma.media.findMany({
      where: {
        type: undefined
      },
      select: { 
        id: true, 
        url: true, 
        type: true,
        createdAt: true,
        ownerType: true,
        ownerId: true
      }
    })

    console.log(`📊 ${undefinedTypeVideos.length} vidéos avec type undefined trouvées`)

    if (undefinedTypeVideos.length === 0) {
      console.log('✅ Aucune vidéo avec type undefined trouvée')
      return
    }

    // 2. Analyser chaque vidéo
    console.log('\n2️⃣ Analyse des vidéos...')
    
    for (const video of undefinedTypeVideos) {
      console.log(`\n🔍 Vidéo ${video.id}:`)
      console.log(`   URL: ${video.url}`)
      console.log(`   Type actuel: ${video.type}`)
      console.log(`   Owner: ${video.ownerType} (${video.ownerId})`)
      console.log(`   Créée: ${video.createdAt.toISOString()}`)

      // Déterminer le type basé sur l'URL
      let newType = 'VIDEO' // Par défaut
      
      if (video.url) {
        if (video.url.includes('.mp4') || video.url.includes('.webm') || video.url.includes('.mov')) {
          newType = 'VIDEO'
        } else if (video.url.includes('.jpg') || video.url.includes('.jpeg') || video.url.includes('.png') || video.url.includes('.gif') || video.url.includes('.webp')) {
          newType = 'IMAGE'
        } else {
          // Si on ne peut pas déterminer, on garde VIDEO par défaut
          newType = 'VIDEO'
        }
      }

      console.log(`   Type déterminé: ${newType}`)

      // Mettre à jour en base de données
      try {
        await prisma.media.update({
          where: { id: video.id },
          data: {
            type: newType
          }
        })
        console.log(`   ✅ Vidéo ${video.id} mise à jour avec type ${newType}`)
      } catch (error) {
        console.error(`   ❌ Erreur mise à jour ${video.id}:`, error.message)
      }
    }

    // 3. Vérifier les autres types problématiques
    console.log('\n3️⃣ Vérification des autres types problématiques...')
    
    const otherProblematicVideos = await prisma.media.findMany({
      where: {
        OR: [
          { type: null },
          { type: '' },
          { type: 'undefined' },
          { type: 'null' }
        ]
      },
      select: { 
        id: true, 
        url: true, 
        type: true,
        createdAt: true
      }
    })

    console.log(`📊 ${otherProblematicVideos.length} autres vidéos problématiques trouvées`)

    for (const video of otherProblematicVideos) {
      console.log(`\n🔍 Vidéo ${video.id}:`)
      console.log(`   URL: ${video.url}`)
      console.log(`   Type actuel: ${video.type}`)

      // Déterminer le type basé sur l'URL
      let newType = 'VIDEO' // Par défaut
      
      if (video.url) {
        if (video.url.includes('.mp4') || video.url.includes('.webm') || video.url.includes('.mov')) {
          newType = 'VIDEO'
        } else if (video.url.includes('.jpg') || video.url.includes('.jpeg') || video.url.includes('.png') || video.url.includes('.gif') || video.url.includes('.webp')) {
          newType = 'IMAGE'
        }
      }

      console.log(`   Type déterminé: ${newType}`)

      // Mettre à jour en base de données
      try {
        await prisma.media.update({
          where: { id: video.id },
          data: {
            type: newType
          }
        })
        console.log(`   ✅ Vidéo ${video.id} mise à jour avec type ${newType}`)
      } catch (error) {
        console.error(`   ❌ Erreur mise à jour ${video.id}:`, error.message)
      }
    }

    // 4. Vérification finale
    console.log('\n4️⃣ Vérification finale...')
    
    const remainingUndefined = await prisma.media.count({
      where: {
        type: undefined
      }
    })

    const totalVideos = await prisma.media.count({
      where: { type: 'VIDEO' }
    })

    const totalImages = await prisma.media.count({
      where: { type: 'IMAGE' }
    })

    console.log(`\n🎉 Correction terminée !`)
    console.log(`   - Vidéos avec type undefined restantes: ${remainingUndefined}`)
    console.log(`   - Total vidéos: ${totalVideos}`)
    console.log(`   - Total images: ${totalImages}`)

    if (remainingUndefined === 0) {
      console.log('✅ Tous les types de médias ont été corrigés !')
    } else {
      console.log('⚠️ Il reste des médias avec type undefined')
    }

  } catch (error) {
    console.error('❌ Erreur lors de la correction des types:', error)
  } finally {
    await prisma.$disconnect()
  }
}

fixVideoTypes()
