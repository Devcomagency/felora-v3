// Script de test pour vérifier la création de conversation avec message d'introduction
// À exécuter dans la console du navigateur sur http://localhost:3000

console.log('🧪 Test de création de conversation avec message d\'introduction');

// Simuler l'ouverture d'une conversation depuis un profil
const testUserId = 'test-user-id'; // Remplacez par un ID d'utilisateur valide
const testUrl = `/messages?to=${encodeURIComponent(testUserId)}`;

console.log('URL de test:', testUrl);
console.log('Ouvrez cette URL dans votre navigateur pour tester la fonctionnalité');

// Test de l'API directement
async function testCreateConversation() {
  try {
    const response = await fetch('/api/e2ee/conversations/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        participantId: testUserId,
        introMessage: 'Bonjour ! Ton profil m\'a beaucoup plu ! 😊'
      })
    });
    
    const data = await response.json();
    console.log('Réponse de l\'API:', data);
    
    if (response.ok) {
      console.log('✅ Conversation créée avec succès');
    } else {
      console.log('❌ Erreur lors de la création:', data.error);
    }
  } catch (error) {
    console.error('❌ Erreur de test:', error);
  }
}

// Décommentez la ligne suivante pour tester l'API directement
// testCreateConversation();
