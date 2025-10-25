const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function analyzeVideoPerformance() {
  console.log('🔍 ANALYSE COMPLÈTE DU SYSTÈME VIDÉO')
  console.log('=' .repeat(50))

  try {
    // 1. ANALYSE DES ERREURS VIDÉO
    console.log('\n1️⃣ ANALYSE DES ERREURS VIDÉO')
    console.log('-'.repeat(30))
    
    const videoErrors = await prisma.media.findMany({
      where: {
        type: 'VIDEO',
        OR: [
          { url: { contains: 'undefined' } },
          { url: { contains: 'null' } },
          { url: '' },
          { url: { startsWith: 'media:' } }
        ]
      },
      select: { 
        id: true, 
        url: true, 
        thumbUrl: true, 
        createdAt: true,
        ownerType: true
      }
    })

    console.log(`❌ Vidéos avec erreurs: ${videoErrors.length}`)
    videoErrors.forEach((video, index) => {
      console.log(`   ${index + 1}. ${video.id}: ${video.url}`)
    })

    // 2. ANALYSE DES PERFORMANCES
    console.log('\n2️⃣ ANALYSE DES PERFORMANCES')
    console.log('-'.repeat(30))
    
    const allVideos = await prisma.media.findMany({
      where: { type: 'VIDEO' },
      select: { 
        id: true, 
        url: true, 
        thumbUrl: true, 
        createdAt: true,
        ownerType: true
      },
      orderBy: { createdAt: 'desc' }
    })

    console.log(`📊 Total vidéos: ${allVideos.length}`)
    
    // Analyser les URLs
    const urlAnalysis = {
      valid: 0,
      undefined: 0,
      null: 0,
      empty: 0,
      mediaPrefix: 0,
      cdn: 0
    }

    allVideos.forEach(video => {
      if (!video.url || video.url === '') {
        urlAnalysis.empty++
      } else if (video.url.includes('undefined')) {
        urlAnalysis.undefined++
      } else if (video.url.includes('null')) {
        urlAnalysis.null++
      } else if (video.url.startsWith('media:')) {
        urlAnalysis.mediaPrefix++
      } else if (video.url.startsWith('https://media.felora.ch/')) {
        urlAnalysis.cdn++
      } else {
        urlAnalysis.valid++
      }
    })

    console.log('📈 Répartition des URLs:')
    Object.entries(urlAnalysis).forEach(([type, count]) => {
      const percentage = ((count / allVideos.length) * 100).toFixed(1)
      console.log(`   ${type}: ${count} (${percentage}%)`)
    })

    // 3. ANALYSE DES THUMBNAILS
    console.log('\n3️⃣ ANALYSE DES THUMBNAILS')
    console.log('-'.repeat(30))
    
    const thumbnailAnalysis = {
      valid: 0,
      null: 0,
      undefined: 0,
      empty: 0
    }

    allVideos.forEach(video => {
      if (!video.thumbUrl || video.thumbUrl === '') {
        thumbnailAnalysis.empty++
      } else if (video.thumbUrl === 'null') {
        thumbnailAnalysis.null++
      } else if (video.thumbUrl.includes('undefined')) {
        thumbnailAnalysis.undefined++
      } else {
        thumbnailAnalysis.valid++
      }
    })

    console.log('🖼️ Répartition des thumbnails:')
    Object.entries(thumbnailAnalysis).forEach(([type, count]) => {
      const percentage = ((count / allVideos.length) * 100).toFixed(1)
      console.log(`   ${type}: ${count} (${percentage}%)`)
    })

    // 4. ANALYSE TEMPORELLE
    console.log('\n4️⃣ ANALYSE TEMPORELLE')
    console.log('-'.repeat(30))
    
    const now = new Date()
    const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000)
    const last7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

    const recentVideos = allVideos.filter(v => v.createdAt > last24h)
    const weekVideos = allVideos.filter(v => v.createdAt > last7d)

    console.log(`📅 Dernières 24h: ${recentVideos.length} vidéos`)
    console.log(`📅 Dernière semaine: ${weekVideos.length} vidéos`)

    // 5. ANALYSE DES TYPES DE PROPRIÉTAIRES
    console.log('\n5️⃣ ANALYSE DES PROPRIÉTAIRES')
    console.log('-'.repeat(30))
    
    const ownerAnalysis = {}
    allVideos.forEach(video => {
      const ownerType = video.ownerType || 'UNKNOWN'
      ownerAnalysis[ownerType] = (ownerAnalysis[ownerType] || 0) + 1
    })

    Object.entries(ownerAnalysis).forEach(([type, count]) => {
      const percentage = ((count / allVideos.length) * 100).toFixed(1)
      console.log(`   ${type}: ${count} (${percentage}%)`)
    })

    // 6. DIAGNOSTIC DES PROBLÈMES
    console.log('\n6️⃣ DIAGNOSTIC DES PROBLÈMES')
    console.log('-'.repeat(30))
    
    const problems = []
    
    if (urlAnalysis.undefined > 0) {
      problems.push(`❌ ${urlAnalysis.undefined} URLs contiennent "undefined"`)
    }
    
    if (urlAnalysis.null > 0) {
      problems.push(`❌ ${urlAnalysis.null} URLs sont "null"`)
    }
    
    if (urlAnalysis.empty > 0) {
      problems.push(`❌ ${urlAnalysis.empty} URLs sont vides`)
    }
    
    if (urlAnalysis.mediaPrefix > 0) {
      problems.push(`❌ ${urlAnalysis.mediaPrefix} URLs commencent par "media:"`)
    }
    
    if (thumbnailAnalysis.null > 0) {
      problems.push(`❌ ${thumbnailAnalysis.null} thumbnails sont "null"`)
    }
    
    if (thumbnailAnalysis.undefined > 0) {
      problems.push(`❌ ${thumbnailAnalysis.undefined} thumbnails contiennent "undefined"`)
    }

    if (problems.length === 0) {
      console.log('✅ Aucun problème détecté !')
    } else {
      console.log('🚨 Problèmes détectés:')
      problems.forEach(problem => console.log(`   ${problem}`))
    }

    // 7. RECOMMANDATIONS
    console.log('\n7️⃣ RECOMMANDATIONS')
    console.log('-'.repeat(30))
    
    const recommendations = []
    
    if (urlAnalysis.undefined > 0 || urlAnalysis.null > 0 || urlAnalysis.empty > 0) {
      recommendations.push('🔧 Corriger les URLs invalides dans la base de données')
    }
    
    if (urlAnalysis.mediaPrefix > 0) {
      recommendations.push('🔧 Remplacer les URLs "media:" par des URLs CDN valides')
    }
    
    if (thumbnailAnalysis.null > 0 || thumbnailAnalysis.undefined > 0) {
      recommendations.push('🔧 Générer des thumbnails pour les vidéos manquantes')
    }
    
    if (allVideos.length > 100) {
      recommendations.push('⚡ Implémenter la pagination pour améliorer les performances')
    }
    
    if (recentVideos.length > 20) {
      recommendations.push('⚡ Optimiser le chargement des vidéos récentes')
    }

    if (recommendations.length === 0) {
      console.log('✅ Aucune recommandation nécessaire !')
    } else {
      recommendations.forEach(rec => console.log(`   ${rec}`))
    }

    // 8. SCORE GLOBAL
    console.log('\n8️⃣ SCORE GLOBAL')
    console.log('-'.repeat(30))
    
    let score = 20
    let deductions = []
    
    // Déductions basées sur les problèmes
    if (urlAnalysis.undefined > 0) {
      score -= 3
      deductions.push('-3: URLs undefined')
    }
    
    if (urlAnalysis.null > 0) {
      score -= 2
      deductions.push('-2: URLs null')
    }
    
    if (urlAnalysis.empty > 0) {
      score -= 2
      deductions.push('-2: URLs vides')
    }
    
    if (urlAnalysis.mediaPrefix > 0) {
      score -= 2
      deductions.push('-2: URLs media:')
    }
    
    if (thumbnailAnalysis.null > 0) {
      score -= 1
      deductions.push('-1: Thumbnails null')
    }
    
    if (thumbnailAnalysis.undefined > 0) {
      score -= 1
      deductions.push('-1: Thumbnails undefined')
    }
    
    if (allVideos.length > 200) {
      score -= 1
      deductions.push('-1: Trop de vidéos (performance)')
    }
    
    if (recentVideos.length > 50) {
      score -= 1
      deductions.push('-1: Trop de vidéos récentes')
    }

    // Bonus pour les bonnes pratiques
    if (urlAnalysis.cdn > allVideos.length * 0.8) {
      score += 1
      deductions.push('+1: 80%+ URLs CDN')
    }
    
    if (thumbnailAnalysis.valid > allVideos.length * 0.9) {
      score += 1
      deductions.push('+1: 90%+ thumbnails valides')
    }

    score = Math.max(0, Math.min(20, score))
    
    console.log(`🎯 SCORE FINAL: ${score}/20`)
    console.log('📊 Détail des points:')
    deductions.forEach(deduction => console.log(`   ${deduction}`))
    
    // 9. POINTS D'AMÉLIORATION PRIORITAIRES
    console.log('\n9️⃣ POINTS D\'AMÉLIORATION PRIORITAIRES')
    console.log('-'.repeat(30))
    
    const priorities = []
    
    if (urlAnalysis.undefined > 0) {
      priorities.push('🚨 URGENT: Corriger les URLs undefined (cause des erreurs vidéo)')
    }
    
    if (urlAnalysis.mediaPrefix > 0) {
      priorities.push('🚨 URGENT: Remplacer les URLs media: par des URLs CDN')
    }
    
    if (urlAnalysis.null > 0 || urlAnalysis.empty > 0) {
      priorities.push('⚠️ IMPORTANT: Corriger les URLs null/vides')
    }
    
    if (thumbnailAnalysis.null > 0 || thumbnailAnalysis.undefined > 0) {
      priorities.push('⚠️ IMPORTANT: Générer les thumbnails manquants')
    }
    
    if (allVideos.length > 100) {
      priorities.push('⚡ PERFORMANCE: Implémenter la pagination')
    }
    
    if (recentVideos.length > 20) {
      priorities.push('⚡ PERFORMANCE: Optimiser le chargement des vidéos récentes')
    }

    if (priorities.length === 0) {
      console.log('✅ Aucune amélioration prioritaire nécessaire !')
    } else {
      priorities.forEach((priority, index) => {
        console.log(`   ${index + 1}. ${priority}`)
      })
    }

    console.log('\n🎉 ANALYSE TERMINÉE !')
    console.log('=' .repeat(50))

  } catch (error) {
    console.error('❌ Erreur lors de l\'analyse:', error)
  } finally {
    await prisma.$disconnect()
  }
}

analyzeVideoPerformance()
