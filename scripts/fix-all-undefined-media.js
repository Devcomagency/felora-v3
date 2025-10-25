const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function fixAllUndefinedMedia() {
  console.log('🔧 Réparation de tous les médias undefined...')

  try {
    // 1. Trouver tous les médias avec URLs undefined
    console.log('\n1️⃣ Recherche des médias undefined...')
    const undefinedMedias = await prisma.media.findMany({
      where: {
        OR: [
          { url: { contains: 'undefined' } },
          { thumbUrl: { contains: 'undefined' } }
        ]
      },
      select: { 
        id: true, 
        url: true, 
        thumbUrl: true, 
        type: true,
        createdAt: true,
        ownerType: true,
        ownerId: true
      }
    })

    console.log(`📊 ${undefinedMedias.length} médias undefined trouvés`)

    if (undefinedMedias.length === 0) {
      console.log('✅ Aucun média undefined à réparer !')
      return
    }

    // 2. Corriger les URLs undefined
    console.log('\n2️⃣ Correction des URLs undefined...')
    let fixedCount = 0

    for (const media of undefinedMedias) {
      console.log(`\n🔧 Réparation média ${media.id}:`)
      console.log(`   Type: ${media.type}`)
      console.log(`   Owner: ${media.ownerType} (${media.ownerId})`)
      console.log(`   URL: ${media.url}`)
      console.log(`   Thumb: ${media.thumbUrl}`)

      // Corriger l'URL principale
      let newUrl = media.url
      if (media.url && media.url.includes('undefined')) {
        newUrl = media.url.replace('undefined/', 'https://media.felora.ch/')
        console.log(`   ✅ URL corrigée: ${newUrl}`)
      }

      // Corriger l'URL de thumbnail
      let newThumbUrl = media.thumbUrl
      if (media.thumbUrl && media.thumbUrl.includes('undefined')) {
        newThumbUrl = media.thumbUrl.replace('undefined/', 'https://media.felora.ch/')
        console.log(`   ✅ Thumb corrigé: ${newThumbUrl}`)
      }

      // Mettre à jour en base de données
      try {
        await prisma.media.update({
          where: { id: media.id },
          data: {
            url: newUrl,
            thumbUrl: newThumbUrl
          }
        })
        console.log(`   ✅ Média ${media.id} mis à jour avec succès`)
        fixedCount++
      } catch (error) {
        console.error(`   ❌ Erreur mise à jour ${media.id}:`, error.message)
      }
    }

    // 3. Vérifier les profils escort avec des avatars/galeries undefined
    console.log('\n3️⃣ Vérification des profils escort...')
    const escortProfiles = await prisma.escortProfile.findMany({
      where: {
        profilePhoto: { contains: 'undefined' }
      },
      select: { 
        id: true, 
        stageName: true, 
        profilePhoto: true, 
        galleryPhotos: true 
      }
    })

    console.log(`📊 ${escortProfiles.length} profils escort avec médias undefined trouvés`)

    for (const profile of escortProfiles) {
      console.log(`\n🔧 Réparation profil escort ${profile.stageName}:`)

      // Corriger l'avatar
      let newProfilePhoto = profile.profilePhoto
      if (profile.profilePhoto && profile.profilePhoto.includes('undefined')) {
        newProfilePhoto = profile.profilePhoto.replace('undefined/', 'https://media.felora.ch/')
        console.log(`   ✅ Avatar corrigé: ${newProfilePhoto}`)
      }

      // Corriger la galerie
      let newGalleryPhotos = profile.galleryPhotos
      if (profile.galleryPhotos && profile.galleryPhotos.some(url => url.includes('undefined'))) {
        newGalleryPhotos = profile.galleryPhotos.map(url => 
          url.includes('undefined') ? url.replace('undefined/', 'https://media.felora.ch/') : url
        )
        console.log(`   ✅ Galerie corrigée: ${newGalleryPhotos.length} photos`)
      }

      // Mettre à jour en base de données
      try {
        await prisma.escortProfile.update({
          where: { id: profile.id },
          data: {
            profilePhoto: newProfilePhoto,
            galleryPhotos: newGalleryPhotos
          }
        })
        console.log(`   ✅ Profil escort ${profile.stageName} mis à jour avec succès`)
        fixedCount++
      } catch (error) {
        console.error(`   ❌ Erreur mise à jour profil ${profile.stageName}:`, error.message)
      }
    }

    // 4. Vérifier les profils club avec des médias undefined
    console.log('\n4️⃣ Vérification des profils club...')
    const clubProfiles = await prisma.clubProfileV2.findMany({
      where: {
        profilePhoto: { contains: 'undefined' }
      },
      select: { 
        id: true, 
        name: true, 
        profilePhoto: true, 
        galleryPhotos: true 
      }
    })

    console.log(`📊 ${clubProfiles.length} profils club avec médias undefined trouvés`)

    for (const profile of clubProfiles) {
      console.log(`\n🔧 Réparation profil club ${profile.name}:`)

      // Corriger l'avatar
      let newProfilePhoto = profile.profilePhoto
      if (profile.profilePhoto && profile.profilePhoto.includes('undefined')) {
        newProfilePhoto = profile.profilePhoto.replace('undefined/', 'https://media.felora.ch/')
        console.log(`   ✅ Avatar corrigé: ${newProfilePhoto}`)
      }

      // Corriger la galerie
      let newGalleryPhotos = profile.galleryPhotos
      if (profile.galleryPhotos && profile.galleryPhotos.some(url => url.includes('undefined'))) {
        newGalleryPhotos = profile.galleryPhotos.map(url => 
          url.includes('undefined') ? url.replace('undefined/', 'https://media.felora.ch/') : url
        )
        console.log(`   ✅ Galerie corrigée: ${newGalleryPhotos.length} photos`)
      }

      // Mettre à jour en base de données
      try {
        await prisma.clubProfileV2.update({
          where: { id: profile.id },
          data: {
            profilePhoto: newProfilePhoto,
            galleryPhotos: newGalleryPhotos
          }
        })
        console.log(`   ✅ Profil club ${profile.name} mis à jour avec succès`)
        fixedCount++
      } catch (error) {
        console.error(`   ❌ Erreur mise à jour profil ${profile.name}:`, error.message)
      }
    }

    // 5. Vérification finale
    console.log('\n5️⃣ Vérification finale...')
    const remainingUndefined = await prisma.media.count({
      where: {
        OR: [
          { url: { contains: 'undefined' } },
          { thumbUrl: { contains: 'undefined' } }
        ]
      }
    })

    console.log(`\n🎉 Réparation terminée !`)
    console.log(`   - ${fixedCount} éléments corrigés`)
    console.log(`   - ${remainingUndefined} médias undefined restants`)

    if (remainingUndefined === 0) {
      console.log('✅ Tous les médias undefined ont été réparés !')
    } else {
      console.log('⚠️ Il reste des médias undefined à réparer')
    }

  } catch (error) {
    console.error('❌ Erreur lors de la réparation:', error)
  } finally {
    await prisma.$disconnect()
  }
}

fixAllUndefinedMedia()
