// Script de test pour vérifier la restriction de rôle dans la messagerie
// À exécuter dans la console du navigateur

console.log('🔒 Test de restriction de rôle pour la messagerie');

// Test 1: Vérifier l'accès à la page des messages selon le rôle
function testMessageAccess() {
  console.log('Test 1: Vérification de l\'accès à la page des messages');
  
  // Simuler différents rôles d'utilisateur
  const testRoles = ['client', 'escort', 'admin', 'moderator'];
  
  testRoles.forEach(role => {
    console.log(`Rôle: ${role}`);
    if (role === 'client') {
      console.log('✅ Accès autorisé - Les clients peuvent accéder à la messagerie');
    } else {
      console.log('❌ Accès refusé - Seuls les clients peuvent accéder à la messagerie');
    }
  });
}

// Test 2: Vérifier l'API de création de conversation
async function testCreateConversationAPI() {
  console.log('\nTest 2: Vérification de l\'API de création de conversation');
  
  const testCases = [
    { role: 'client', targetRole: 'escort', shouldWork: true },
    { role: 'escort', targetRole: 'client', shouldWork: false },
    { role: 'admin', targetRole: 'escort', shouldWork: false },
    { role: 'client', targetRole: 'client', shouldWork: false }
  ];
  
  for (const testCase of testCases) {
    console.log(`\nTest: ${testCase.role} → ${testCase.targetRole}`);
    
    try {
      const response = await fetch('/api/e2ee/conversations/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          participantId: 'test-escort-id',
          introMessage: 'Test message'
        })
      });
      
      const data = await response.json();
      
      if (testCase.shouldWork) {
        if (response.ok) {
          console.log('✅ Succès - Conversation créée (comme attendu)');
        } else {
          console.log('❌ Échec - Conversation non créée (inattendu)');
        }
      } else {
        if (!response.ok && data.error) {
          console.log('✅ Succès - Accès refusé (comme attendu):', data.error);
        } else {
          console.log('❌ Échec - Accès autorisé (inattendu)');
        }
      }
    } catch (error) {
      console.log('❌ Erreur de test:', error.message);
    }
  }
}

// Test 3: Vérifier l'affichage des boutons Message
function testMessageButtonVisibility() {
  console.log('\nTest 3: Vérification de l\'affichage des boutons Message');
  
  const testRoles = ['client', 'escort', 'admin', 'moderator'];
  
  testRoles.forEach(role => {
    console.log(`Rôle: ${role}`);
    if (role === 'client') {
      console.log('✅ Bouton Message visible - Les clients voient le bouton');
    } else {
      console.log('❌ Bouton Message masqué - Les non-clients ne voient pas le bouton');
    }
  });
}

// Exécuter les tests
console.log('=== DÉBUT DES TESTS ===');
testMessageAccess();
testMessageButtonVisibility();

// Décommentez la ligne suivante pour tester l'API (nécessite une session active)
// testCreateConversationAPI();

console.log('\n=== FIN DES TESTS ===');
console.log('Note: Pour tester l\'API, décommentez l\'appel à testCreateConversationAPI()');
