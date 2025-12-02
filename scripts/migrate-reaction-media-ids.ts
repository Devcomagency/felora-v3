/**
 * Script de migration des mediaIds dans la table reactions
 *
 * Problème: Les réactions utilisent des IDs hashés au lieu des vrais IDs de la table media
 * Solution: Convertir tous les mediaIds hashés en vrais IDs
 *
 * Usage: npx tsx scripts/migrate-reaction-media-ids.ts
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

function normalizeUrl(input?: string | null) {
  if (!input) return ''
  try {
    const u = new URL(input, 'http://_')
    const path = decodeURIComponent(u.pathname || '')
    const normalized = '/' + path.split('/').filter(Boolean).join('/')
    return normalized
  } catch {
    const raw = decodeURIComponent(String(input))
    const pathOnly = raw.split('?')[0]
    const normalized = '/' + pathOnly.split('/').filter(Boolean).join('/')
    return normalized
  }
}

function stableMediaId({ profileId, url }: { profileId: string; url?: string | null }) {
  const key = `${profileId}#${normalizeUrl(url)}`
  const h1 = djb2(key, 5381)
  const h2 = djb2(key, 52711)
  return toHex(h1) + toHex(h2)
}

function djb2(str: string, seed = 5381): number {
  let hash = seed >>> 0
  for (let i = 0; i < str.length; i++) {
    hash = (((hash << 5) + hash) ^ str.charCodeAt(i)) >>> 0
  }
  return hash >>> 0
}

function toHex(n: number): string {
  return (n >>> 0).toString(16).padStart(8, '0')
}

async function main() {
  console.log('🚀 Démarrage de la migration des mediaIds...\n')

  // 1. Récupérer toutes les réactions
  const reactions = await prisma.reaction.findMany({
    select: { id: true, mediaId: true }
  })

  console.log(`📊 ${reactions.length} réactions trouvées dans la base\n`)

  // 2. Récupérer tous les médias avec leurs URLs
  const allMedia = await prisma.media.findMany({
    where: { deletedAt: null },
    select: { id: true, url: true, ownerId: true, ownerType: true }
  })

  console.log(`📊 ${allMedia.length} médias trouvés dans la base\n`)

  // 3. Créer une map: hash → realId
  const hashToRealId = new Map<string, string>()

  for (const media of allMedia) {
    const hash = stableMediaId({ profileId: media.ownerId, url: media.url })
    hashToRealId.set(hash, media.id)
  }

  console.log(`🔑 ${hashToRealId.size} hashs générés\n`)

  // 4. Migrer les réactions
  let migratedCount = 0
  let skippedCount = 0
  let errorCount = 0

  for (const reaction of reactions) {
    const realId = hashToRealId.get(reaction.mediaId)

    if (realId && realId !== reaction.mediaId) {
      // Le mediaId est un hash, on le convertit en vrai ID
      try {
        await prisma.reaction.update({
          where: { id: reaction.id },
          data: { mediaId: realId }
        })
        migratedCount++
        console.log(`✅ Migré: ${reaction.mediaId} → ${realId}`)
      } catch (error: any) {
        errorCount++
        console.error(`❌ Erreur migration ${reaction.id}: ${error.message}`)
      }
    } else if (!realId) {
      // Le hash ne correspond à aucun média (média supprimé?)
      skippedCount++
      console.log(`⚠️  Hash orphelin (média supprimé?): ${reaction.mediaId}`)
    } else {
      // Le mediaId est déjà un vrai ID
      skippedCount++
    }
  }

  console.log('\n' + '='.repeat(60))
  console.log('📈 RÉSUMÉ DE LA MIGRATION')
  console.log('='.repeat(60))
  console.log(`✅ Migrées: ${migratedCount}`)
  console.log(`⏭️  Ignorées (déjà OK ou orphelines): ${skippedCount}`)
  console.log(`❌ Erreurs: ${errorCount}`)
  console.log(`📊 Total: ${reactions.length}`)
  console.log('='.repeat(60) + '\n')

  await prisma.$disconnect()
}

main()
  .catch((e) => {
    console.error('💥 Erreur fatale:', e)
    process.exit(1)
  })
