// Script pour tester l'API /api/escort/media/upload
const fetch = require('node-fetch');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

async function testEscortUpload() {
  console.log('🧪 Test de l\'API /api/escort/media/upload...');

  // Créer un fichier dummy
  const dummyFilePath = path.join(__dirname, 'dummy_test_video.mp4');
  if (!fs.existsSync(dummyFilePath)) {
    fs.writeFileSync(dummyFilePath, Buffer.alloc(1024 * 1024, ' ')); // 1MB dummy file
    console.log(`Créé un fichier dummy: ${dummyFilePath}`);
  }

  const formData = new FormData();
  formData.append('file', fs.createReadStream(dummyFilePath), 'test_video.mp4');
  formData.append('slot', '1');
  formData.append('isPrivate', 'false');

  try {
    console.log('\n📤 Envoi de la requête d\'upload...');
    const response = await fetch('http://localhost:3000/api/escort/media/upload', {
      method: 'POST',
      body: formData,
      // Note: Pour un test complet, il faudrait simuler une session authentifiée
      // ou utiliser un token d'authentification. Ici, on s'attend à un 401.
    });

    const data = await response.json();
    console.log('\n📥 Réponse du serveur:');
    console.log(JSON.stringify(data, null, 2));

    if (response.ok && data.success) {
      console.log('✅ Upload API test réussi!');
      console.log('URL générée:', data.url);
      if (data.url && data.url.includes('undefined')) {
        console.log('❌ PROBLÈME: URL contient "undefined"');
      } else {
        console.log('✅ URL semble correcte');
      }
    } else {
      console.error('❌ Upload API test échoué:', data.error || response.statusText);
    }
  } catch (error) {
    console.error('❌ Erreur lors de l\'appel API:', error);
  } finally {
    // Nettoyer le fichier dummy
    if (fs.existsSync(dummyFilePath)) {
      fs.unlinkSync(dummyFilePath);
    }
  }
}

testEscortUpload();
