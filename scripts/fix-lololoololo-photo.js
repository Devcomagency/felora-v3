/**
 * Script pour corriger la photo de profil de lolololoololo
 */
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function fixPhoto() {
  console.log('🔧 Correction de la photo de profil de lolololoololo...\n')

  try {
    // Récupérer le profil
    const profile = await prisma.escortProfile.findUnique({
      where: { id: 'cmg2ej3hs0003l804ns2h6d0o' },
      select: { id: true, stageName: true, profilePhoto: true }
    })

    console.log('📊 Profil actuel:')
    console.log(profile)

    // Vérifier si la photo existe
    if (profile.profilePhoto) {
      console.log('\n🔍 URL actuelle:', profile.profilePhoto)
      
      // Vérifier si elle pointe vers un autre profil
      const photoProfileId = profile.profilePhoto.match(/profiles\/([^\/]+)\//)?.[1]
      if (photoProfileId && photoProfileId !== profile.id) {
        console.log('⚠️  Photo pointe vers un autre profil:', photoProfileId)
        
        // Récupérer toutes les photos de ce profil depuis la table media
        const allMedias = await prisma.media.findMany({
          where: {
            ownerId: profile.id,
            ownerType: 'ESCORT'
          },
          select: {
            id: true,
            url: true,
            type: true,
            createdAt: true
          },
          orderBy: {
            createdAt: 'asc'
          }
        })
        
        // Filtrer les images
        const medias = allMedias.filter(m => m.type === 'IMAGE' || m.url.match(/\.(jpeg|jpg|png|gif|webp)$/i))

        console.log('\n📸 Médias trouvés:', medias.length)
        medias.forEach((m, i) => console.log(`  ${i + 1}. ${m.url}`))

        if (medias.length > 0) {
          // Utiliser la première photo comme profilePhoto
          const newProfilePhoto = medias[0].url
          console.log('\n✅ Mise à jour de la photo de profil avec:', newProfilePhoto)
          
          await prisma.escortProfile.update({
            where: { id: profile.id },
            data: { profilePhoto: newProfilePhoto }
          })

          console.log('✅ Photo de profil mise à jour !')
        } else {
          console.log('⚠️  Aucune photo trouvée dans la galerie')
        }
      } else {
        console.log('✅ Photo pointe vers le bon profil')
      }
    } else {
      console.log('⚠️  Aucune photo de profil définie')
    }

  } catch (error) {
    console.error('❌ Erreur:', error)
  } finally {
    await prisma.$disconnect()
  }
}

fixPhoto()

