/**
 * Script pour corriger les URLs "undefined/profiles/..." en base de données
 * Remplace "undefined" par "https://media.felora.ch"
 */

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function fixUndefinedUrls() {
  console.log('🔍 Recherche des URLs corrompues...\n')

  // 1. Vérifier EscortProfile.profilePhoto
  const escortsWithBadUrls = await prisma.escortProfile.findMany({
    where: {
      profilePhoto: {
        startsWith: 'undefined/'
      }
    },
    select: {
      id: true,
      stageName: true,
      profilePhoto: true
    }
  })

  console.log(`📸 Profils escortes avec URLs corrompues : ${escortsWithBadUrls.length}`)
  escortsWithBadUrls.forEach(escort => {
    console.log(`  - ${escort.stageName}: ${escort.profilePhoto}`)
  })

  // 2. Vérifier Media.url
  const mediaWithBadUrls = await prisma.media.findMany({
    where: {
      url: {
        startsWith: 'undefined/'
      }
    },
    select: {
      id: true,
      url: true,
      type: true
    }
  })

  console.log(`\n🎬 Médias avec URLs corrompues : ${mediaWithBadUrls.length}`)
  mediaWithBadUrls.forEach(media => {
    console.log(`  - ${media.type}: ${media.url}`)
  })

  // 3. Demander confirmation
  if (escortsWithBadUrls.length === 0 && mediaWithBadUrls.length === 0) {
    console.log('\n✅ Aucune URL corrompue trouvée !')
    await prisma.$disconnect()
    return
  }

  console.log('\n🔧 Correction des URLs...')

  // 4. Corriger EscortProfile
  let fixedEscorts = 0
  for (const escort of escortsWithBadUrls) {
    const newUrl = escort.profilePhoto.replace('undefined/', 'https://media.felora.ch/')
    await prisma.escortProfile.update({
      where: { id: escort.id },
      data: { profilePhoto: newUrl }
    })
    console.log(`  ✓ ${escort.stageName}: ${newUrl}`)
    fixedEscorts++
  }

  // 5. Corriger Media
  let fixedMedia = 0
  for (const media of mediaWithBadUrls) {
    const newUrl = media.url.replace('undefined/', 'https://media.felora.ch/')
    await prisma.media.update({
      where: { id: media.id },
      data: { url: newUrl }
    })
    console.log(`  ✓ Media ${media.id}: ${newUrl}`)
    fixedMedia++
  }

  console.log(`\n✅ Correction terminée !`)
  console.log(`   - Profils corrigés : ${fixedEscorts}`)
  console.log(`   - Médias corrigés : ${fixedMedia}`)

  await prisma.$disconnect()
}

fixUndefinedUrls()
  .catch((error) => {
    console.error('❌ Erreur:', error)
    process.exit(1)
  })
