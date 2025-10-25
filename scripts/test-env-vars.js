// Test des variables d'environnement R2
console.log('🔍 Test des variables d\'environnement R2...\n');

const requiredVars = [
  'CLOUDFLARE_R2_PUBLIC_URL',
  'NEXT_PUBLIC_CLOUDFLARE_R2_PUBLIC_URL', 
  'CLOUDFLARE_R2_ENDPOINT',
  'CLOUDFLARE_R2_ACCESS_KEY',
  'CLOUDFLARE_R2_SECRET_KEY',
  'CLOUDFLARE_R2_BUCKET'
];

let allGood = true;

requiredVars.forEach(varName => {
  const value = process.env[varName];
  if (value) {
    console.log(`✅ ${varName}: ${value.substring(0, 20)}${value.length > 20 ? '...' : ''}`);
  } else {
    console.log(`❌ ${varName}: NON DÉFINIE`);
    allGood = false;
  }
});

console.log(`\n${allGood ? '🎉 Toutes les variables sont définies !' : '⚠️ Certaines variables manquent'}`);

// Test de génération d'URL
if (process.env.CLOUDFLARE_R2_PUBLIC_URL) {
  const testKey = 'profiles/test-user/test-file.jpg';
  const testUrl = `${process.env.CLOUDFLARE_R2_PUBLIC_URL}/${testKey}`;
  console.log(`\n🧪 Test URL générée: ${testUrl}`);
  
  if (testUrl.includes('undefined')) {
    console.log('❌ PROBLÈME: URL contient "undefined"');
  } else {
    console.log('✅ URL générée correctement');
  }
}
