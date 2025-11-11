import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function cleanupMuxMedia() {
  try {
    console.log('🧹 Nettoyage des médias Mux obsolètes...\n')

    // 1. Trouver tous les médias avec URL Mux
    const muxMedia = await prisma.media.findMany({
      where: {
        OR: [
          { url: { contains: 'mux.com' } },
          { url: { contains: 'muxed.s3' } }
        ]
      }
    })

    console.log(`📊 Trouvé ${muxMedia.length} médias Mux à supprimer\n`)

    if (muxMedia.length === 0) {
      console.log('✅ Aucun média Mux trouvé')
      return
    }

    // Afficher les médias qui seront supprimés
    console.log('📋 Médias Mux à supprimer:')
    muxMedia.forEach((media, index) => {
      console.log(`${index + 1}. ID: ${media.id}`)
      console.log(`   Owner: ${media.ownerType} ${media.ownerId}`)
      console.log(`   Type: ${media.type}`)
      console.log(`   URL: ${media.url.substring(0, 80)}...`)
      console.log(`   Position: ${media.pos}`)
      console.log(`   Created: ${media.createdAt}`)
      console.log('')
    })

    // Demander confirmation (en mode script on supprime directement)
    console.log('🗑️ Suppression des médias Mux...')

    const deleted = await prisma.media.deleteMany({
      where: {
        OR: [
          { url: { contains: 'mux.com' } },
          { url: { contains: 'muxed.s3' } }
        ]
      }
    })

    console.log(`\n✅ ${deleted.count} médias Mux supprimés avec succès !`)

    // 2. Vérifier les médias restants pour chaque profil
    console.log('\n📊 Vérification des médias restants...\n')

    const profiles = await prisma.escortProfile.findMany({
      select: {
        id: true,
        stageName: true,
        userId: true
      }
    })

    for (const profile of profiles) {
      const remainingMedia = await prisma.media.findMany({
        where: {
          ownerType: 'ESCORT',
          ownerId: profile.id,
          deletedAt: null
        },
        orderBy: { pos: 'asc' },
        select: { id: true, pos: true, url: true, type: true }
      })

      if (remainingMedia.length > 0) {
        console.log(`👤 ${profile.stageName || 'Sans nom'} (${profile.id}):`)
        console.log(`   ${remainingMedia.length} média(s) restant(s)`)
        remainingMedia.forEach(m => {
          const urlPreview = m.url.substring(0, 60)
          console.log(`   - pos ${m.pos}: ${m.type} - ${urlPreview}...`)
        })
        console.log('')
      }
    }

    console.log('\n🎉 Nettoyage terminé !')

  } catch (error) {
    console.error('❌ Erreur:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

cleanupMuxMedia()
