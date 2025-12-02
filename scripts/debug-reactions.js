// Script de diagnostic pour le système de réactions
// Usage: node scripts/debug-reactions.js [profileId]

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function debugReactions(profileId) {
  console.log('\n🔍 DIAGNOSTIC RÉACTIONS')
  console.log('=' .repeat(50))

  if (!profileId) {
    console.log('❌ Usage: node scripts/debug-reactions.js [profileId]')
    process.exit(1)
  }

  try {
    // 1. Vérifier que le profil existe
    const profile = await prisma.escortProfile.findUnique({
      where: { id: profileId },
      select: {
        id: true,
        stageName: true,
        totalLikes: true,
        totalReacts: true
      }
    })

    if (!profile) {
      console.log(`❌ Profil ${profileId} introuvable`)
      process.exit(1)
    }

    console.log(`\n✅ Profil trouvé: ${profile.stageName}`)
    console.log(`   totalLikes (DB): ${profile.totalLikes}`)
    console.log(`   totalReacts (DB): ${profile.totalReacts}`)

    // 2. Récupérer tous les médias du profil
    const media = await prisma.media.findMany({
      where: {
        ownerType: 'ESCORT',
        ownerId: profileId,
        deletedAt: null
      },
      select: {
        id: true,
        url: true,
        likeCount: true,
        reactCount: true
      }
    })

    console.log(`\n📸 Médias trouvés: ${media.length}`)
    if (media.length === 0) {
      console.log('⚠️  Aucun média trouvé pour ce profil')
    } else {
      media.forEach((m, i) => {
        console.log(`   ${i + 1}. ${m.id.substring(0, 8)}... - likes:${m.likeCount} reacts:${m.reactCount}`)
      })
    }

    // 3. Compter les réactions réelles dans la table reactions
    const mediaIds = media.map(m => m.id)

    if (mediaIds.length > 0) {
      const [actualLikes, actualReacts] = await Promise.all([
        prisma.reaction.count({
          where: {
            mediaId: { in: mediaIds },
            type: 'LIKE'
          }
        }),
        prisma.reaction.count({
          where: {
            mediaId: { in: mediaIds },
            NOT: { type: 'LIKE' }
          }
        })
      ])

      console.log(`\n💯 Réactions réelles (table reactions):`)
      console.log(`   Likes: ${actualLikes}`)
      console.log(`   Reactions: ${actualReacts}`)

      // Afficher les réactions détaillées
      const reactions = await prisma.reaction.findMany({
        where: {
          mediaId: { in: mediaIds }
        },
        select: {
          id: true,
          mediaId: true,
          userId: true,
          type: true
        }
      })

      console.log(`\n🎯 Détail des réactions (${reactions.length} total):`)
      const groupedByMedia = reactions.reduce((acc, r) => {
        if (!acc[r.mediaId]) acc[r.mediaId] = []
        acc[r.mediaId].push(r)
        return acc
      }, {})

      Object.entries(groupedByMedia).forEach(([mediaId, reacts]) => {
        const likes = reacts.filter(r => r.type === 'LIKE').length
        const others = reacts.filter(r => r.type !== 'LIKE').length
        console.log(`   Media ${mediaId.substring(0, 8)}...: ${likes} likes, ${others} reactions`)
        reacts.forEach(r => {
          console.log(`     - ${r.type} by user ${r.userId.substring(0, 8)}...`)
        })
      })

      // 4. Comparer avec les compteurs du profil
      console.log(`\n📊 COMPARAISON:`)
      console.log(`   Profil.totalLikes:  ${profile.totalLikes} (devrait être ${actualLikes})`)
      console.log(`   Profil.totalReacts: ${profile.totalReacts} (devrait être ${actualReacts})`)

      if (profile.totalLikes !== actualLikes || profile.totalReacts !== actualReacts) {
        console.log(`\n⚠️  DÉSYNCHRONISATION DÉTECTÉE !`)
        console.log(`\n🔧 Pour corriger, exécutez:`)
        console.log(`   psql $DATABASE_URL -c "UPDATE escort_profiles SET \\"totalLikes\\" = ${actualLikes}, \\"totalReacts\\" = ${actualReacts} WHERE id = '${profileId}';"`)
      } else {
        console.log(`\n✅ Les compteurs sont synchronisés !`)
      }
    }

  } catch (error) {
    console.error('\n❌ Erreur:', error)
  } finally {
    await prisma.$disconnect()
  }
}

const profileId = process.argv[2]
debugReactions(profileId)
