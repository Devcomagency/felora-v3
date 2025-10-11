// Test script pour vérifier la gestion des médias
const testMediaManagement = async () => {
  try {
    console.log('🧪 [TEST] Test de la gestion des médias...')
    
    // 1. Récupérer les médias du feed
    const feedResponse = await fetch('http://localhost:3001/api/feed/public?limit=1')
    const feedData = await feedResponse.json()
    
    if (!feedData.success || !feedData.items.length) {
      console.error('❌ [TEST] Aucun média trouvé dans le feed')
      return
    }
    
    const media = feedData.items[0]
    console.log('✅ [TEST] Média trouvé:', media.id, 'Auteur:', media.author.name)
    
    // 2. Tester l'API de gestion (sans authentification - devrait échouer)
    console.log('\n🔒 [TEST] Test sans authentification...')
    try {
      const manageResponse = await fetch(`http://localhost:3001/api/media/${media.id}/manage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'visibility:PRIVATE' })
      })
      
      const manageData = await manageResponse.json()
      if (manageResponse.status === 401) {
        console.log('✅ [TEST] Authentification requise (attendu)')
      } else {
        console.log('⚠️ [TEST] Réponse inattendue:', manageResponse.status, manageData)
      }
    } catch (error) {
      console.log('❌ [TEST] Erreur API gestion:', error.message)
    }
    
    // 3. Vérifier que l'API existe
    console.log('\n🔍 [TEST] Vérification de l\'existence de l\'API...')
    try {
      const testResponse = await fetch(`http://localhost:3001/api/media/${media.id}/manage`, {
        method: 'OPTIONS'
      })
      console.log('✅ [TEST] API accessible:', testResponse.status)
    } catch (error) {
      console.log('❌ [TEST] API non accessible:', error.message)
    }
    
  } catch (error) {
    console.error('❌ [TEST] Erreur générale:', error.message)
  }
}

// Exécuter le test
testMediaManagement()
