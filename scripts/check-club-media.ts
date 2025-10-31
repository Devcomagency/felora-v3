import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const club = await prisma.clubProfileV2.findUnique({
    where: { handle: 'salonluxeeee' },
    include: { details: true }
  })

  if (!club) {
    console.log('Club not found')
    return
  }

  console.log('\n=== CLUB INFO ===')
  console.log('ID:', club.id)
  console.log('Handle:', club.handle)
  console.log('Name:', club.companyName)
  console.log('\n=== CLUB DETAILS ===')
  console.log('Details name:', club.details?.name)
  console.log('avatarUrl in ClubDetails:', club.details?.avatarUrl)
  console.log('coverUrl in ClubDetails:', club.details?.coverUrl)

  const media = await prisma.media.findMany({
    where: {
      ownerType: 'CLUB',
      ownerId: club.id
    },
    orderBy: { pos: 'asc' }
  })

  console.log('\n=== MEDIA TABLE ===')
  media.forEach(m => {
    console.log(`pos=${m.pos}, type=${m.type}, url=${m.url}`)
  })
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
