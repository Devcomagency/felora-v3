/**
 * Script pour mettre toutes les vidéos Bunny en mode public
 *
 * Usage: npx tsx scripts/set-bunny-videos-public.ts
 */

const BUNNY_LIBRARY_ID = '538306'
const BUNNY_API_KEY = '5321345a-0e71-4383-92291b9b13b2-4d98-413b'
const BUNNY_API_URL = 'https://video.bunnycdn.com'

async function getAllVideos() {
  const response = await fetch(`${BUNNY_API_URL}/library/${BUNNY_LIBRARY_ID}/videos?page=1&itemsPerPage=100`, {
    headers: {
      'AccessKey': BUNNY_API_KEY
    }
  })

  if (!response.ok) {
    throw new Error(`Failed to get videos: ${response.status}`)
  }

  const data = await response.json()
  return data.items || []
}

async function setVideoPublic(videoId: string) {
  const response = await fetch(`${BUNNY_API_URL}/library/${BUNNY_LIBRARY_ID}/videos/${videoId}`, {
    method: 'POST',
    headers: {
      'AccessKey': BUNNY_API_KEY,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      isPublic: true
    })
  })

  return response.ok
}

async function main() {
  console.log('🔧 Récupération des vidéos Bunny...\n')

  const videos = await getAllVideos()

  console.log(`📊 ${videos.length} vidéos trouvées\n`)

  let successCount = 0
  let errorCount = 0
  let alreadyPublicCount = 0

  for (const video of videos) {
    const isCurrentlyPublic = video.isPublic

    console.log(`📹 ${video.title}`)
    console.log(`   ID: ${video.guid}`)
    console.log(`   Status: ${isCurrentlyPublic ? '✅ Déjà public' : '🔒 Privé'}`)

    if (isCurrentlyPublic) {
      alreadyPublicCount++
      console.log('')
      continue
    }

    console.log(`   🔄 Mise en mode public...`)

    try {
      const success = await setVideoPublic(video.guid)

      if (success) {
        console.log(`   ✅ Mis en public avec succès\n`)
        successCount++
      } else {
        console.log(`   ❌ Échec de la mise en public\n`)
        errorCount++
      }
    } catch (error: any) {
      console.log(`   ❌ Erreur: ${error.message}\n`)
      errorCount++
    }

    // Attendre un peu entre chaque requête
    await new Promise(resolve => setTimeout(resolve, 500))
  }

  console.log('\n' + '='.repeat(60))
  console.log('✅ Terminé!')
  console.log(`   - Déjà publiques: ${alreadyPublicCount}`)
  console.log(`   - Mises en public: ${successCount}`)
  console.log(`   - Erreurs: ${errorCount}`)
  console.log(`   - Total: ${videos.length}`)
  console.log('='.repeat(60))
}

main()
  .catch((error) => {
    console.error('❌ Erreur fatale:', error)
    process.exit(1)
  })
