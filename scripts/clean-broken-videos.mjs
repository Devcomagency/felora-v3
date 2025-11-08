import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  console.log('🔍 Recherche des vidéos Mux cassées...')
  
  const allMedia = await prisma.media.findMany({
    where: {
      type: 'VIDEO',
      url: {
        contains: 'stream.mux.com'
      }
    }
  })
  
  console.log(`📊 Total vidéos Mux trouvées: ${allMedia.length}`)
  
  const brokenVideos = allMedia.filter(media => {
    const id = media.url.split('/')[3]?.split('.')[0] || ''
    return id.length > 40
  })
  
  console.log(`❌ Vidéos cassées trouvées: ${brokenVideos.length}`)
  
  if (brokenVideos.length > 0) {
    console.log('\n📋 Liste des vidéos à supprimer:')
    brokenVideos.forEach((v, i) => {
      const id = v.url.split('/')[3]?.split('.')[0] || ''
      console.log(`  ${i+1}. ${v.id} - ID length: ${id.length} chars`)
    })
    
    console.log('\n🗑️ Suppression en cours...')
    const result = await prisma.media.deleteMany({
      where: {
        id: {
          in: brokenVideos.map(v => v.id)
        }
      }
    })
    
    console.log(`✅ ${result.count} vidéos cassées supprimées !`)
  } else {
    console.log('✅ Aucune vidéo cassée à supprimer')
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
