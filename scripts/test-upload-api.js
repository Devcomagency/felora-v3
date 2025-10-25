// Test direct de l'API d'upload pour voir les URLs générées
const fs = require('fs');
const path = require('path');

// Simuler un fichier de test
const testImagePath = path.join(__dirname, '../public/logo-principal.png');

if (!fs.existsSync(testImagePath)) {
  console.log('❌ Fichier de test non trouvé:', testImagePath);
  process.exit(1);
}

async function testUploadAPI() {
  console.log('🧪 Test de l\'API d\'upload...\n');
  
  try {
    // Lire le fichier de test
    const fileBuffer = fs.readFileSync(testImagePath);
    const formData = new FormData();
    
    // Créer un Blob à partir du buffer
    const blob = new Blob([fileBuffer], { type: 'image/png' });
    const file = new File([blob], 'test-upload.png', { type: 'image/png' });
    
    formData.append('media', file);
    formData.append('type', 'IMAGE');
    formData.append('pos', '1');
    formData.append('description', 'Test upload API');
    formData.append('visibility', 'public');
    
    console.log('📤 Envoi de la requête d\'upload...');
    
    // Note: Cette requête échouera probablement car elle nécessite une authentification
    // Mais on peut voir les logs du serveur
    const response = await fetch('http://localhost:3000/api/media/upload', {
      method: 'POST',
      body: formData
    });
    
    const result = await response.text();
    console.log('📥 Réponse du serveur:');
    console.log(result);
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message);
  }
}

// Alternative: Test direct des variables d'environnement côté serveur
async function testServerEnvVars() {
  console.log('\n🔍 Test des variables d\'environnement côté serveur...\n');
  
  try {
    const response = await fetch('http://localhost:3000/api/debug/env-vars', {
      method: 'GET'
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('📊 Variables d\'environnement serveur:');
      console.log(JSON.stringify(data, null, 2));
    } else {
      console.log('❌ Endpoint de debug non disponible');
    }
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

// Créer un endpoint de debug temporaire
async function createDebugEndpoint() {
  console.log('\n🛠️ Création d\'un endpoint de debug temporaire...\n');
  
  const debugCode = `
// Endpoint temporaire pour debug des variables d'environnement
export async function GET() {
  return Response.json({
    CLOUDFLARE_R2_PUBLIC_URL: process.env.CLOUDFLARE_R2_PUBLIC_URL,
    NEXT_PUBLIC_CLOUDFLARE_R2_PUBLIC_URL: process.env.NEXT_PUBLIC_CLOUDFLARE_R2_PUBLIC_URL,
    CLOUDFLARE_R2_ENDPOINT: process.env.CLOUDFLARE_R2_ENDPOINT ? 'DÉFINIE' : 'NON DÉFINIE',
    CLOUDFLARE_R2_ACCESS_KEY: process.env.CLOUDFLARE_R2_ACCESS_KEY ? 'DÉFINIE' : 'NON DÉFINIE',
    CLOUDFLARE_R2_SECRET_KEY: process.env.CLOUDFLARE_R2_SECRET_KEY ? 'DÉFINIE' : 'NON DÉFINIE',
    CLOUDFLARE_R2_BUCKET: process.env.CLOUDFLARE_R2_BUCKET,
    NODE_ENV: process.env.NODE_ENV
  });
}
`;
  
  const debugPath = path.join(__dirname, '../src/app/api/debug/env-vars/route.ts');
  const debugDir = path.dirname(debugPath);
  
  if (!fs.existsSync(debugDir)) {
    fs.mkdirSync(debugDir, { recursive: true });
  }
  
  fs.writeFileSync(debugPath, debugCode);
  console.log('✅ Endpoint de debug créé:', debugPath);
  
  // Attendre un peu pour que Next.js recharge
  console.log('⏳ Attente du rechargement de Next.js...');
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  // Tester l'endpoint
  await testServerEnvVars();
}

// Exécuter les tests
async function runTests() {
  await createDebugEndpoint();
  await testUploadAPI();
}

runTests().catch(console.error);
