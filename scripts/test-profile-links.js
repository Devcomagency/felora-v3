// Test script pour vérifier que les liens de profil fonctionnent
const testProfileLinks = async () => {
  try {
    console.log('🧪 [TEST] Test des liens de profil...')
    
    // 1. Récupérer les médias du feed
    const feedResponse = await fetch('http://localhost:3001/api/feed/public?limit=3')
    const feedData = await feedResponse.json()
    
    if (!feedData.success || !feedData.items.length) {
      console.error('❌ [TEST] Aucun média trouvé dans le feed')
      return
    }
    
    console.log('✅ [TEST] Feed récupéré:', feedData.items.length, 'médias')
    
    // 2. Tester chaque profil
    for (const item of feedData.items) {
      const profileId = item.author.id
      const profileName = item.author.name
      
      console.log(`\n🔗 [TEST] Test du profil: ${profileName} (ID: ${profileId})`)
      
      try {
        const profileResponse = await fetch(`http://localhost:3001/api/profile-test/escort/${profileId}`)
        const profileData = await profileResponse.json()
        
        if (profileResponse.ok && profileData.success) {
          console.log(`✅ [TEST] Profil trouvé: ${profileData.data.stageName || profileData.data.name}`)
        } else {
          console.log(`❌ [TEST] Profil non trouvé: ${profileResponse.status} - ${profileData.message || 'Erreur inconnue'}`)
        }
      } catch (error) {
        console.log(`❌ [TEST] Erreur API profil: ${error.message}`)
      }
    }
    
  } catch (error) {
    console.error('❌ [TEST] Erreur générale:', error.message)
  }
}

// Exécuter le test
testProfileLinks()
