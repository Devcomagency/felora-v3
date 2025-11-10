/**
 * Script pour vérifier le statut d'une vidéo Bunny
 * Usage: npx tsx scripts/check-bunny-video.ts <videoId>
 */

const BUNNY_LIBRARY_ID = '538306'
const BUNNY_API_KEY = '5321345a-0e71-4383-92291b9b13b2-4d98-413b'

async function checkBunnyVideo(videoId: string) {
  console.log(`\n🔍 Vérification vidéo Bunny: ${videoId}\n`)

  try {
    // 1. Get video info from Bunny API
    const response = await fetch(
      `https://video.bunnycdn.com/library/${BUNNY_LIBRARY_ID}/videos/${videoId}`,
      {
        headers: {
          'AccessKey': BUNNY_API_KEY,
          'accept': 'application/json'
        }
      }
    )

    if (!response.ok) {
      console.error(`❌ Erreur API Bunny: ${response.status} ${response.statusText}`)
      return
    }

    const video = await response.json()

    console.log('📊 Informations vidéo:')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log(`Titre: ${video.title}`)
    console.log(`Statut numérique: ${video.status}`)
    console.log(`Statut texte: ${getStatusText(video.status)}`)
    console.log(`Durée: ${video.length} secondes`)
    console.log(`Taille: ${(video.storageSize / 1024 / 1024).toFixed(2)} MB`)
    console.log(`Largeur: ${video.width}px`)
    console.log(`Hauteur: ${video.height}px`)
    console.log(`Créé le: ${new Date(video.dateUploaded).toLocaleString('fr-FR')}`)
    console.log(`Vues: ${video.views}`)
    console.log(`Public: ${video.isPublic ? 'Oui' : 'Non'}`)
    console.log('')

    // 2. Check HLS URL
    const hlsUrl = video.status >= 4
      ? `https://vz-cf0fe97d-915.b-cdn.net/${videoId}/playlist.m3u8`
      : null

    const thumbnailUrl = video.thumbnailFileName
      ? `https://vz-cf0fe97d-915.b-cdn.net/${videoId}/${video.thumbnailFileName}`
      : null

    console.log('🔗 URLs:')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log(`HLS: ${hlsUrl || '❌ Pas encore disponible'}`)
    console.log(`Thumbnail: ${thumbnailUrl || '❌ Pas disponible'}`)
    console.log('')

    // 3. Test if HLS is accessible
    if (hlsUrl) {
      console.log('🧪 Test accessibilité HLS...')
      const hlsResponse = await fetch(hlsUrl)
      if (hlsResponse.ok) {
        console.log('✅ HLS accessible !')
      } else {
        console.log(`❌ HLS non accessible: ${hlsResponse.status}`)
      }
    }

    // 4. Recommendations
    console.log('')
    console.log('💡 Recommandations:')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

    if (video.status < 4) {
      console.log('⏳ La vidéo est encore en traitement.')
      console.log('   Attendez quelques minutes et réessayez.')
    } else if (video.status === 4) {
      console.log('✅ La vidéo est prête !')
      console.log('   Elle peut être sauvegardée en base de données.')
    } else if (video.status === 5) {
      console.log('✅ La vidéo est transcodée et optimisée !')
    } else if (video.status === 6) {
      console.log('❌ La vidéo a échoué le traitement.')
    }

  } catch (error: any) {
    console.error('❌ Erreur:', error.message)
  }
}

function getStatusText(status: number): string {
  const statuses: Record<number, string> = {
    0: 'Queued (En attente)',
    1: 'Processing (Traitement)',
    2: 'Encoding (Encodage)',
    3: 'Finished (Terminé)',
    4: 'Ready (Prêt)',
    5: 'Transcoded (Transcodé)',
    6: 'Failed (Échec)'
  }
  return statuses[status] || `Inconnu (${status})`
}

// Get videoId from command line
const videoId = process.argv[2]

if (!videoId) {
  console.error('❌ Usage: npx tsx scripts/check-bunny-video.ts <videoId>')
  process.exit(1)
}

checkBunnyVideo(videoId)
