import { prisma } from '../src/lib/prisma'

async function diagnoseMediaIssues() {
  console.log('🔍 DIAGNOSTIC COMPLET DES MÉDIAS\n')

  // 1. Statistiques globales
  const totalMedia = await prisma.media.count()
  const activeMedia = await prisma.media.count({ where: { deletedAt: null } })
  const deletedMedia = await prisma.media.count({ where: { deletedAt: { not: null } } })

  console.log('📊 STATISTIQUES GLOBALES:')
  console.log(`   Total médias: ${totalMedia}`)
  console.log(`   Médias actifs: ${activeMedia}`)
  console.log(`   Médias supprimés: ${deletedMedia}\n`)

  // 2. Médias par type
  const mediaByType = await prisma.media.groupBy({
    by: ['type'],
    where: { deletedAt: null },
    _count: true
  })

  console.log('📁 MÉDIAS PAR TYPE:')
  mediaByType.forEach(({ type, _count }) => {
    console.log(`   ${type}: ${_count}`)
  })
  console.log()

  // 3. Médias avec URLs invalides
  const allMedia = await prisma.media.findMany({
    where: { deletedAt: null },
    select: { id: true, type: true, url: true, thumbUrl: true, ownerId: true, ownerType: true }
  })

  const invalidUrls = allMedia.filter(m =>
    !m.url ||
    m.url.startsWith('media:') ||
    m.url.startsWith('blob:') ||
    m.url === 'undefined'
  )

  console.log('❌ URLS INVALIDES:')
  console.log(`   Nombre: ${invalidUrls.length}`)
  if (invalidUrls.length > 0) {
    console.log(`   Exemples:`)
    invalidUrls.slice(0, 5).forEach(m => {
      console.log(`     - ${m.id}: ${m.url}`)
    })
  }
  console.log()

  // 4. Médias avec owners manquants
  const escortMedia = allMedia.filter(m => m.ownerType === 'ESCORT')
  const clubMedia = allMedia.filter(m => m.ownerType === 'CLUB')

  const escortIds = [...new Set(escortMedia.map(m => m.ownerId).filter(id => id !== 'unknown'))]
  const clubIds = [...new Set(clubMedia.map(m => m.ownerId).filter(id => id !== 'unknown'))]

  const existingEscorts = await prisma.escortProfile.findMany({
    where: { id: { in: escortIds } },
    select: { id: true }
  })
  const existingEscortIds = new Set(existingEscorts.map(e => e.id))

  const existingClubs = await prisma.clubProfile.findMany({
    where: { id: { in: clubIds } },
    select: { id: true }
  })
  const existingClubIds = new Set(existingClubs.map(c => c.id))

  const orphanEscortMedia = escortMedia.filter(m =>
    m.ownerId === 'unknown' || !existingEscortIds.has(m.ownerId)
  )
  const orphanClubMedia = clubMedia.filter(m =>
    m.ownerId === 'unknown' || !existingClubIds.has(m.ownerId)
  )

  console.log('👻 MÉDIAS ORPHELINS (sans propriétaire):')
  console.log(`   Escort orphelins: ${orphanEscortMedia.length}`)
  console.log(`   Club orphelins: ${orphanClubMedia.length}`)
  console.log(`   Total orphelins: ${orphanEscortMedia.length + orphanClubMedia.length}\n`)

  // 5. Vidéos sans thumbnail
  const videos = allMedia.filter(m => m.type.includes('video'))
  const videosWithoutThumb = videos.filter(m => !m.thumbUrl)

  console.log('🎥 VIDÉOS:')
  console.log(`   Total vidéos: ${videos.length}`)
  console.log(`   Vidéos sans thumbnail: ${videosWithoutThumb.length}`)
  console.log(`   Vidéos avec thumbnail: ${videos.length - videosWithoutThumb.length}\n`)

  // 6. Recommandations
  console.log('💡 RECOMMANDATIONS:')

  const totalProblems = invalidUrls.length + orphanEscortMedia.length + orphanClubMedia.length

  if (totalProblems > 0) {
    console.log(`\n⚠️  ${totalProblems} médias problématiques détectés`)
    console.log('\n🔧 Actions recommandées:')

    if (invalidUrls.length > 0) {
      console.log(`   1. Supprimer ${invalidUrls.length} médias avec URLs invalides`)
    }
    if (orphanEscortMedia.length + orphanClubMedia.length > 0) {
      console.log(`   2. Supprimer ${orphanEscortMedia.length + orphanClubMedia.length} médias orphelins`)
    }
    if (videosWithoutThumb.length > 0) {
      console.log(`   3. Générer ${videosWithoutThumb.length} thumbnails manquants`)
    }
  } else {
    console.log('   ✅ Aucun problème détecté !')
  }

  await prisma.$disconnect()
}

diagnoseMediaIssues().catch(console.error)
