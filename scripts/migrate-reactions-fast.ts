/**
 * Migration RAPIDE des mediaIds dans la table reactions
 * Version optimisée avec batch updates
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

function normalizeUrl(input?: string | null) {
  if (!input) return ''
  try {
    const u = new URL(input, 'http://_')
    const path = decodeURIComponent(u.pathname || '')
    return '/' + path.split('/').filter(Boolean).join('/')
  } catch {
    const raw = decodeURIComponent(String(input))
    const pathOnly = raw.split('?')[0]
    return '/' + pathOnly.split('/').filter(Boolean).join('/')
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
  console.log('🚀 Migration RAPIDE des mediaIds...\n')

  // 1. Créer map hash → realId
  const media = await prisma.media.findMany({
    where: { deletedAt: null },
    select: { id: true, url: true, ownerId: true }
  })

  const hashMap = new Map<string, string>()
  for (const m of media) {
    const hash = stableMediaId({ profileId: m.ownerId, url: m.url })
    hashMap.set(hash, m.id)
  }

  console.log(`📊 ${media.length} médias, ${hashMap.size} hashs générés\n`)

  // 2. Batch update avec SQL raw (beaucoup plus rapide)
  let updated = 0

  for (const [hash, realId] of hashMap) {
    if (hash === realId) continue // Déjà OK

    const result = await prisma.$executeRaw`
      UPDATE "reactions"
      SET "mediaId" = ${realId}
      WHERE "mediaId" = ${hash}
    `

    if (result > 0) {
      updated += result
      console.log(`✅ ${result} réactions: ${hash} → ${realId}`)
    }
  }

  console.log(`\n✅ Migration terminée: ${updated} réactions mises à jour\n`)

  await prisma.$disconnect()
}

main().catch((e) => {
  console.error('💥 Erreur:', e)
  process.exit(1)
})
