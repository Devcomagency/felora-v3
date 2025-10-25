/**
 * Script de migration : Nettoyer les URLs cassées avec "undefined/" dans la BDD
 *
 * Usage:
 *   npx tsx scripts/fix-broken-media-urls.ts [--dry-run]
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const isDryRun = process.argv.includes('--dry-run')

async function fixBrokenMediaUrls() {
  console.log('🔍 Recherche des profils avec URLs cassées...\n')

  // 1. Trouver tous les profils avec "undefined/" dans profilePhoto
  const brokenProfiles = await prisma.escortProfile.findMany({
    where: {
      OR: [
        { profilePhoto: { contains: 'undefined/' } },
        { profilePhoto: { contains: 'null/' } },
        { galleryPhotos: { contains: 'undefined/' } },
        { galleryPhotos: { contains: 'null/' } },
      ]
    },
    select: {
      userId: true,
      profilePhoto: true,
      galleryPhotos: true,
      stageName: true,
    },
    take: 100 // Limiter à 100 profils par exécution
  })

  console.log(`📊 Trouvé ${brokenProfiles.length} profils avec URLs cassées\n`)

  if (brokenProfiles.length === 0) {
    console.log('✅ Aucune URL cassée trouvée!')
    return
  }

  let fixedCount = 0

  for (const profile of brokenProfiles) {
    console.log(`\n👤 Profil: ${profile.stageName || 'N/A'} (${profile.userId})`)

    // Fix profilePhoto
    let newProfilePhoto = profile.profilePhoto
    if (newProfilePhoto && (newProfilePhoto.startsWith('undefined/') || newProfilePhoto.startsWith('null/'))) {
      newProfilePhoto = newProfilePhoto
        .replace(/^undefined\//, '')
        .replace(/^null\//, '')
      console.log(`   📷 profilePhoto: ${profile.profilePhoto} → ${newProfilePhoto}`)
    }

    // Fix galleryPhotos
    let newGalleryPhotos = profile.galleryPhotos
    let galleryChanged = false

    if (newGalleryPhotos) {
      try {
        const gallery = JSON.parse(newGalleryPhotos)
        if (Array.isArray(gallery)) {
          const fixedGallery = gallery.map((item: any) => {
            if (item?.url && typeof item.url === 'string') {
              const originalUrl = item.url
              const fixedUrl = originalUrl
                .replace(/^undefined\//, '')
                .replace(/^null\//, '')

              if (originalUrl !== fixedUrl) {
                console.log(`   🖼️  galleryPhotos: ${originalUrl} → ${fixedUrl}`)
                galleryChanged = true
              }

              return { ...item, url: fixedUrl }
            }
            return item
          })

          if (galleryChanged) {
            newGalleryPhotos = JSON.stringify(fixedGallery)
          }
        }
      } catch (e) {
        console.error(`   ❌ Erreur parsing galleryPhotos:`, e)
      }
    }

    // Update database
    if (!isDryRun && (newProfilePhoto !== profile.profilePhoto || galleryChanged)) {
      await prisma.escortProfile.update({
        where: { userId: profile.userId },
        data: {
          profilePhoto: newProfilePhoto,
          galleryPhotos: newGalleryPhotos,
        }
      })
      console.log('   ✅ Mis à jour en BDD')
      fixedCount++
    }
  }

  console.log(`\n\n🎉 Migration terminée!`)
  console.log(`   - Profils scannés: ${brokenProfiles.length}`)
  console.log(`   - Profils corrigés: ${fixedCount}`)

  if (isDryRun) {
    console.log('\n⚠️  Mode DRY RUN - Aucune modification en BDD')
    console.log('   Pour appliquer les changements: npx tsx scripts/fix-broken-media-urls.ts')
  }
}

// Run
fixBrokenMediaUrls()
  .then(() => {
    console.log('\n✨ Script terminé avec succès')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Erreur:', error)
    process.exit(1)
  })
  .finally(() => {
    prisma.$disconnect()
  })
