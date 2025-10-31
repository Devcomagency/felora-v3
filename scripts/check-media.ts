import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🔍 Checking media in database...\n')

  const totalMedia = await prisma.media.count()
  console.log(`Total media: ${totalMedia}`)

  const activeMedia = await prisma.media.count({
    where: { deletedAt: null }
  })
  console.log(`Active media (not deleted): ${activeMedia}`)

  const reportedMedia = await prisma.media.count({
    where: {
      deletedAt: null,
      reportCount: { gt: 0 }
    }
  })
  console.log(`Reported media: ${reportedMedia}`)

  // Sample media
  const sampleMedia = await prisma.media.findMany({
    take: 5,
    include: {
      reactions: true
    }
  })

  console.log('\n📸 Sample media:')
  sampleMedia.forEach((m, i) => {
    console.log(`\n${i + 1}. ID: ${m.id}`)
    console.log(`   Type: ${m.type}`)
    console.log(`   Owner: ${m.ownerType} - ${m.ownerId}`)
    console.log(`   Visibility: ${m.visibility}`)
    console.log(`   Likes: ${m.likeCount}`)
    console.log(`   Report Count: ${m.reportCount}`)
    console.log(`   URL: ${m.url.substring(0, 50)}...`)
  })

  // Check by ownerType
  const escortMedia = await prisma.media.count({
    where: { ownerType: 'ESCORT', deletedAt: null }
  })
  const clubMedia = await prisma.media.count({
    where: { ownerType: 'CLUB', deletedAt: null }
  })

  console.log(`\n📊 By owner type:`)
  console.log(`   Escort media: ${escortMedia}`)
  console.log(`   Club media: ${clubMedia}`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
