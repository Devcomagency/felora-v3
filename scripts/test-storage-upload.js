// Script pour tester directement la fonction mediaStorage.upload()
const fs = require('fs');
const path = require('path');

// Simuler un fichier
const dummyFilePath = path.join(__dirname, 'dummy_test_storage.mp4');
if (!fs.existsSync(dummyFilePath)) {
  fs.writeFileSync(dummyFilePath, Buffer.alloc(1024 * 1024, ' ')); // 1MB dummy file
  console.log(`Créé un fichier dummy: ${dummyFilePath}`);
}

// Créer un objet File simulé
const dummyFile = {
  name: 'test_video.mp4',
  type: 'video/mp4',
  size: 1024 * 1024,
  arrayBuffer: () => fs.readFileSync(dummyFilePath).buffer
};

async function testStorageUpload() {
  console.log('🧪 Test de la fonction mediaStorage.upload()...');
  
  try {
    // Importer la fonction storage
    const { mediaStorage } = require('../src/lib/storage');
    
    console.log('📤 Test d\'upload vers R2...');
    const result = await mediaStorage.upload(dummyFile, 'profiles');
    
    console.log('📥 Résultat:');
    console.log(JSON.stringify(result, null, 2));
    
    if (result?.success && result?.url) {
      console.log('✅ Upload réussi!');
      console.log('URL générée:', result.url);
      if (result.url.includes('undefined')) {
        console.log('❌ PROBLÈME: URL contient "undefined"');
      } else {
        console.log('✅ URL semble correcte');
      }
    } else {
      console.log('❌ Upload échoué:', result?.error);
    }
  } catch (error) {
    console.error('❌ Erreur lors du test:', error);
  } finally {
    // Nettoyer le fichier dummy
    if (fs.existsSync(dummyFilePath)) {
      fs.unlinkSync(dummyFilePath);
    }
  }
}

testStorageUpload();
