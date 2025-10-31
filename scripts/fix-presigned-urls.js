const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

/**
 * Script pour remplacer les presigned URLs temporaires par des URLs CDN permanentes
 * 
 * Les presigned URLs (avec X-Amz-Algorithm) expirent après 7 jours
 * On les remplace par des URLs CDN permanentes basées sur CLOUDFLARE_R2_PUBLIC_URL
 */
async function fixPresignedUrls() {
  console.log('🔧 Correction des presigned URLs expirés...\n')

  const CLOUDFLARE_R2_PUBLIC_URL = process.env.CLOUDFLARE_R2_PUBLIC_URL || process.env.NEXT_PUBLIC_CLOUDFLARE_R2_PUBLIC_URL || 'https://media.felora.ch'

  // Trouver tous les profils escort avec des presigned URLs dans profilePhoto
  const profilesWithPresignedUrls = await prisma.escortProfile.findMany({
    where: {
      profilePhoto: {
        contains: 'X-Amz-Algorithm'
      }
    },
    select: {
      id: true,
      stageName: true,
      profilePhoto: true
    }
  })

  console.log(`📊 ${profilesWithPresignedUrls.length} profils avec presigned URLs trouvés\n`)

  let fixed = 0
  let errors = 0

  for (const profile of profilesWithPresignedUrls) {
    try {
      // Extraire le chemin de la presigned URL
      // Exemple: https://...r2.cloudflarestorage.com/felora-media/medias/1758989398288-nm1xire5d9.png?X-Amz-...
      const presignedUrl = profile.profilePhoto
      const urlMatch = presignedUrl.match(/https:\/\/[^\/]+\/(.+)\?/)
      
      if (!urlMatch) {
        console.log(`⚠️  Impossible d'extraire le chemin de: ${profile.stageName}`)
        continue
      }

      const path = urlMatch[1]
      const permanentUrl = `${CLOUDFLARE_R2_PUBLIC_URL}/${path}`

      // Mettre à jour le profil avec l'URL permanente
      await prisma.escortProfile.update({
        where: { id: profile.id },
        data: { profilePhoto: permanentUrl }
      })

      console.log(`✅ ${profile.stageName}: ${permanentUrl}`)
      fixed++
    } catch (error) {
      console.error(`❌ Erreur pour ${profile.stageName}:`, error.message)
      errors++
    }
  }

  console.log(`\n✅ ${fixed} profils corrigés`)
  if (errors > 0) {
    console.log(`❌ ${errors} erreurs`)
  }
}

fixPresignedUrls()
  .catch(e => {
    console.error('❌ Erreur:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

