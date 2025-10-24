const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function fixUndefinedUrls() {
  console.log('🔍 Recherche des URLs avec "undefined"...')
  
  try {
    // 1. Vérifier les profils escort avec des URLs undefined
    const escortProfiles = await prisma.escortProfile.findMany({
      where: {
        OR: [
          { profilePhoto: { contains: 'undefined' } },
          { galleryPhotos: { contains: 'undefined' } }
        ]
      },
      select: {
        id: true,
        stageName: true,
        profilePhoto: true,
        galleryPhotos: true
      }
    })
    
    console.log(`📊 Trouvé ${escortProfiles.length} profils escort avec des URLs undefined`)
    
    for (const profile of escortProfiles) {
      console.log(`\n🔧 Correction du profil: ${profile.stageName} (${profile.id})`)
      
      // Corriger profilePhoto
      if (profile.profilePhoto && profile.profilePhoto.includes('undefined')) {
        console.log(`  ❌ ProfilePhoto undefined: ${profile.profilePhoto}`)
        // Remplacer undefined par l'URL correcte
        const correctedPhoto = profile.profilePhoto.replace('undefined/', 'https://media.felora.ch/')
        console.log(`  ✅ Corrigé vers: ${correctedPhoto}`)
        
        await prisma.escortProfile.update({
          where: { id: profile.id },
          data: { profilePhoto: correctedPhoto }
        })
      }
      
      // Corriger galleryPhotos
      if (profile.galleryPhotos && profile.galleryPhotos.includes('undefined')) {
        console.log(`  ❌ GalleryPhotos contient undefined`)
        try {
          const galleryData = JSON.parse(profile.galleryPhotos)
          let corrected = false
          
          if (Array.isArray(galleryData)) {
            const correctedGallery = galleryData.map(item => {
              if (item.url && item.url.includes('undefined')) {
                corrected = true
                return {
                  ...item,
                  url: item.url.replace('undefined/', 'https://media.felora.ch/')
                }
              }
              return item
            })
            
            if (corrected) {
              console.log(`  ✅ GalleryPhotos corrigé`)
              await prisma.escortProfile.update({
                where: { id: profile.id },
                data: { galleryPhotos: JSON.stringify(correctedGallery) }
              })
            }
          }
        } catch (error) {
          console.log(`  ⚠️ Erreur parsing galleryPhotos: ${error.message}`)
        }
      }
    }
    
    // 2. Vérifier la table Media
    const mediaItems = await prisma.media.findMany({
      where: {
        url: { contains: 'undefined' }
      },
      select: {
        id: true,
        url: true,
        ownerId: true,
        ownerType: true
      }
    })
    
    console.log(`\n📊 Trouvé ${mediaItems.length} médias avec des URLs undefined`)
    
    for (const media of mediaItems) {
      console.log(`\n🔧 Correction du média: ${media.id}`)
      console.log(`  ❌ URL undefined: ${media.url}`)
      
      const correctedUrl = media.url.replace('undefined/', 'https://media.felora.ch/')
      console.log(`  ✅ Corrigé vers: ${correctedUrl}`)
      
      await prisma.media.update({
        where: { id: media.id },
        data: { url: correctedUrl }
      })
    }
    
    console.log('\n✅ Correction terminée!')
    
  } catch (error) {
    console.error('❌ Erreur:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Exécuter le script
fixUndefinedUrls()