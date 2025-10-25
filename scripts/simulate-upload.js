// Simulation d'un upload pour voir les logs de debug
const fs = require('fs');
const path = require('path');

async function simulateUpload() {
  console.log('🧪 Simulation d\'un upload pour voir les logs...\n');
  
  try {
    // Créer un fichier de test simple
    const testImagePath = path.join(__dirname, '../public/logo-principal.png');
    
    if (!fs.existsSync(testImagePath)) {
      console.log('❌ Fichier de test non trouvé:', testImagePath);
      return;
    }
    
    const fileBuffer = fs.readFileSync(testImagePath);
    const formData = new FormData();
    
    // Créer un Blob à partir du buffer
    const blob = new Blob([fileBuffer], { type: 'image/png' });
    const file = new File([blob], 'test-upload-debug.png', { type: 'image/png' });
    
    formData.append('media', file);
    formData.append('type', 'IMAGE');
    formData.append('pos', '999');
    formData.append('description', 'Test debug upload');
    formData.append('visibility', 'public');
    
    console.log('📤 Envoi de la requête d\'upload...');
    console.log('👀 Surveillez les logs du serveur Next.js pour voir les messages de debug...\n');
    
    const response = await fetch('http://localhost:3000/api/media/upload', {
      method: 'POST',
      body: formData
    });
    
    const result = await response.text();
    console.log('📥 Réponse du serveur:');
    console.log(result);
    
    if (result.includes('undefined')) {
      console.log('\n❌ PROBLÈME DÉTECTÉ: La réponse contient "undefined"');
    } else {
      console.log('\n✅ Pas d\'URL undefined dans la réponse');
    }
    
  } catch (error) {
    console.error('❌ Erreur lors de la simulation:', error.message);
  }
}

// Instructions pour l'utilisateur
console.log('📋 INSTRUCTIONS POUR LE DEBUG:');
console.log('1. Ouvrez un autre terminal');
console.log('2. Surveillez les logs du serveur Next.js');
console.log('3. Exécutez ce script: node scripts/simulate-upload.js');
console.log('4. Cherchez les messages "🔍 DEBUG URL génération" dans les logs\n');

simulateUpload().catch(console.error);
