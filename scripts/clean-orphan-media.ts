import { prisma } from '../src/lib/prisma'

async function cleanOrphanMedia() {
  console.log('🧹 Nettoyage des médias orphelins...')

  // 1. Trouver les médias avec ownerId = "unknown"
  const unknownOwners = await prisma.media.findMany({
    where: {
      ownerId: 'unknown',
      deletedAt: null
    }
  })

  console.log(`❌ ${unknownOwners.length} médias avec ownerId="unknown"`)

  // 2. Trouver les médias ESCORT dont le profil n'existe pas
  const allEscortMedia = await prisma.media.findMany({
    where: {
      ownerType: 'ESCORT',
      ownerId: { not: 'unknown' },
      deletedAt: null
    },
    select: {
      id: true,
      ownerId: true
    }
  })

  console.log(`🔍 Vérification de ${allEscortMedia.length} médias ESCORT...`)

  const orphanEscortMedia: string[] = []
  for (const media of allEscortMedia) {
    const escort = await prisma.escortProfile.findUnique({
      where: { id: media.ownerId }
    })
    if (!escort) {
      orphanEscortMedia.push(media.id)
    }
  }

  console.log(`❌ ${orphanEscortMedia.length} médias ESCORT orphelins`)

  // 3. Trouver les médias CLUB dont le profil n'existe pas
  const allClubMedia = await prisma.media.findMany({
    where: {
      ownerType: 'CLUB',
      ownerId: { not: 'unknown' },
      deletedAt: null
    },
    select: {
      id: true,
      ownerId: true
    }
  })

  console.log(`🔍 Vérification de ${allClubMedia.length} médias CLUB...`)

  const orphanClubMedia: string[] = []
  for (const media of allClubMedia) {
    const club = await prisma.clubProfile.findUnique({
      where: { id: media.ownerId }
    })
    if (!club) {
      orphanClubMedia.push(media.id)
    }
  }

  console.log(`❌ ${orphanClubMedia.length} médias CLUB orphelins`)

  // 4. Total des orphelins
  const totalOrphans = unknownOwners.length + orphanEscortMedia.length + orphanClubMedia.length

  console.log(`\n📊 TOTAL: ${totalOrphans} médias orphelins détectés`)

  if (totalOrphans === 0) {
    console.log('✅ Aucun média orphelin à nettoyer !')
    return
  }

  // 5. Demander confirmation
  console.log('\n⚠️  VOULEZ-VOUS SUPPRIMER CES MÉDIAS ? (Ctrl+C pour annuler)')
  console.log('Attente de 5 secondes...')

  await new Promise(resolve => setTimeout(resolve, 5000))

  console.log('\n🗑️  Suppression en cours...')

  // 6. Soft delete (marquer comme supprimés)
  const allOrphanIds = [
    ...unknownOwners.map(m => m.id),
    ...orphanEscortMedia,
    ...orphanClubMedia
  ]

  const result = await prisma.media.updateMany({
    where: {
      id: { in: allOrphanIds }
    },
    data: {
      deletedAt: new Date(),
      deletedBy: 'SYSTEM',
      deletionReason: 'Orphan media - owner not found'
    }
  })

  console.log(`✅ ${result.count} médias marqués comme supprimés`)
  console.log('\n✨ Nettoyage terminé !')
}

cleanOrphanMedia()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
