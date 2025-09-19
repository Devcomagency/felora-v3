const { PrismaClient } = require('@prisma/client')

async function analyzeWorkingMedia() {
  const prisma = new PrismaClient()

  try {
    console.log('🔍 [MEDIA DEBUG] Analysing working media in production...')

    // Récupérer tous les profils avec des médias
    const profiles = await prisma.escortProfile.findMany({
      where: {
        OR: [
          { profilePhoto: { not: null } },
          { galleryPhotos: { not: null } },
          { videos: { not: null } }
        ]
      },
      select: {
        id: true,
        userId: true,
        profilePhoto: true,
        galleryPhotos: true,
        videos: true,
        createdAt: true,
        updatedAt: true
      }
    })

    console.log(`📊 [MEDIA DEBUG] Found ${profiles.length} profiles with media`)

    for (const profile of profiles) {
      console.log(`\n👤 [PROFILE ${profile.id}] Analysis:`)
      console.log(`- User ID: ${profile.userId}`)
      console.log(`- Created: ${profile.createdAt}`)
      console.log(`- Updated: ${profile.updatedAt}`)

      // Profile photo analysis
      if (profile.profilePhoto) {
        const photo = typeof profile.profilePhoto === 'string'
          ? JSON.parse(profile.profilePhoto)
          : profile.profilePhoto
        console.log(`📷 Profile Photo:`)
        console.log(`  - URL: ${photo.url?.substring(0, 100)}...`)
        console.log(`  - Length: ${photo.url?.length} chars`)
        console.log(`  - Starts with: ${photo.url?.substring(0, 30)}`)
        console.log(`  - Key: ${photo.key || 'No key'}`)
      }

      // Gallery photos analysis
      if (profile.galleryPhotos) {
        const gallery = typeof profile.galleryPhotos === 'string'
          ? JSON.parse(profile.galleryPhotos)
          : profile.galleryPhotos
        console.log(`🖼️ Gallery Photos (${gallery.length} items):`)
        gallery.forEach((photo, index) => {
          if (photo && photo.url) {
            console.log(`  ${index + 1}. URL: ${photo.url.substring(0, 80)}...`)
            console.log(`     Length: ${photo.url.length} chars`)
            console.log(`     Type: ${photo.url.startsWith('data:') ? 'Base64' : photo.url.startsWith('https://') ? 'Cloud URL' : 'Other'}`)
            console.log(`     Key: ${photo.key || 'No key'}`)
          }
        })
      }

      // Videos analysis
      if (profile.videos) {
        const videos = typeof profile.videos === 'string'
          ? JSON.parse(profile.videos)
          : profile.videos
        console.log(`🎥 Videos (${videos.length} items):`)
        videos.forEach((video, index) => {
          if (video && video.url) {
            console.log(`  ${index + 1}. URL: ${video.url.substring(0, 80)}...`)
            console.log(`     Length: ${video.url.length} chars`)
            console.log(`     Type: ${video.url.startsWith('data:') ? 'Base64' : video.url.startsWith('https://') ? 'Cloud URL' : 'Other'}`)
            console.log(`     Key: ${video.key || 'No key'}`)
          }
        })
      }
    }

    // Statistics
    console.log('\n📈 [MEDIA STATS] Summary:')
    let base64Count = 0
    let cloudCount = 0
    let totalMediaCount = 0

    for (const profile of profiles) {
      // Count profile photo
      if (profile.profilePhoto) {
        totalMediaCount++
        const photo = typeof profile.profilePhoto === 'string'
          ? JSON.parse(profile.profilePhoto)
          : profile.profilePhoto
        if (photo.url?.startsWith('data:')) base64Count++
        else if (photo.url?.startsWith('https://')) cloudCount++
      }

      // Count gallery photos
      if (profile.galleryPhotos) {
        const gallery = typeof profile.galleryPhotos === 'string'
          ? JSON.parse(profile.galleryPhotos)
          : profile.galleryPhotos
        gallery.forEach(photo => {
          if (photo && photo.url) {
            totalMediaCount++
            if (photo.url.startsWith('data:')) base64Count++
            else if (photo.url.startsWith('https://')) cloudCount++
          }
        })
      }

      // Count videos
      if (profile.videos) {
        const videos = typeof profile.videos === 'string'
          ? JSON.parse(profile.videos)
          : profile.videos
        videos.forEach(video => {
          if (video && video.url) {
            totalMediaCount++
            if (video.url.startsWith('data:')) base64Count++
            else if (video.url.startsWith('https://')) cloudCount++
          }
        })
      }
    }

    console.log(`- Total media items: ${totalMediaCount}`)
    console.log(`- Base64 items: ${base64Count} (${((base64Count/totalMediaCount)*100).toFixed(1)}%)`)
    console.log(`- Cloud URLs: ${cloudCount} (${((cloudCount/totalMediaCount)*100).toFixed(1)}%)`)
    console.log(`- Other: ${totalMediaCount - base64Count - cloudCount}`)

  } catch (error) {
    console.error('❌ [MEDIA DEBUG] Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

analyzeWorkingMedia()