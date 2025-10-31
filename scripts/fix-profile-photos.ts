/**
 * Script pour corriger les photos de profil qui pointent vers d'autres profils
 */
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function fixProfilePhotos() {
  console.log('🔧 Correction des photos de profil...\n')

  try {
    // Récupérer tous les profils escort
    const profiles = await prisma.escortProfile.findMany({
      where: {
        profilePhoto: { not: null }
      },
      select: {
        id: true,
        stageName: true,
        userId: true,
        profilePhoto: true
      }
    })

    console.log(`📊 ${profiles.length} profils trouvés\n`)

    let correctedCount = 0
    let unchangedCount = 0

    for (const profile of profiles) {
      if (!profile.profilePhoto) {
        unchangedCount++
        continue
      }

      // Extraire l'ID du profil depuis le chemin de la photo
      const photoUrl = profile.profilePhoto
      const urlMatch = photoUrl.match(/profiles\/([^\/]+)\//)
      
      if (!urlMatch) {
        console.log(`⚠️  Impossible de parser l'URL pour ${profile.stageName}: ${photoUrl}`)
        unchangedCount++
        continue
      }

      const photoProfileId = urlMatch[1]
      
      // Si l'ID de la photo ne correspond pas à l'ID du profil, corriger
      if (photoProfileId !== profile.id && photoProfileId !== profile.userId) {
        console.log(`❌ Photo incorrecte pour ${profile.stageName} (${profile.id}):`)
        console.log(`   Photo pointe vers: ${photoProfileId}`)
        console.log(`   Photo devrait pointer vers: ${profile.id} ou ${profile.userId}`)
        console.log(`   URL actuelle: ${photoUrl}`)
        
        // Nouvelle URL corrigée
        const correctedUrl = photoUrl.replace(
          `/profiles/${photoProfileId}/`,
          `/profiles/${profile.id}/`
        )
        
        console.log(`   ✅ Nouvelle URL: ${correctedUrl}`)
        
        // Vérifier si la nouvelle photo existe
        try {
          const response = await fetch(correctedUrl, { method: 'HEAD' })
          if (response.ok) {
            console.log(`   ✅ Photo corrigée existe`)
            await prisma.escortProfile.update({
              where: { id: profile.id },
              data: { profilePhoto: correctedUrl }
            })
            correctedCount++
          } else {
            console.log(`   ⚠️  Photo corrigée n'existe pas (${response.status})`)
            unchangedCount++
          }
        } catch (error) {
          console.log(`   ⚠️  Erreur lors de la vérification: ${error}`)
          unchangedCount++
        }
        
        console.log()
      } else {
        unchangedCount++
      }
    }

    console.log('\n📊 Résultats:')
    console.log(`   ✅ ${correctedCount} profils corrigés`)
    console.log(`   ⚪ ${unchangedCount} profils inchangés`)

  } catch (error) {
    console.error('❌ Erreur:', error)
  } finally {
    await prisma.$disconnect()
  }
}

fixProfilePhotos()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })

