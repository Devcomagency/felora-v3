const bcrypt = require('bcryptjs');

console.log('🔍 TEST D\'AUTHENTIFICATION ADMIN\n');

// Les credentials
const email = 'info@devcom.ch';
const password = 'Felora2025!SecureAdmin#1773d599';
const hash = '$2b$10$fdTCBS19bwDf9bIkPKT0i.PNwFTjeOwiUAO9cb8voIGxhou2ef3j.';

console.log('Email:', email);
console.log('Password:', password);
console.log('Hash:', hash);
console.log('');

// Test bcrypt
bcrypt.compare(password, hash).then(result => {
  console.log('✅ Bcrypt compare result:', result);

  if (result) {
    console.log('✅ Le mot de passe correspond au hash');
  } else {
    console.log('❌ Le mot de passe NE correspond PAS au hash');
  }

  // Générer un nouveau hash pour vérifier
  console.log('\n🔄 Génération d\'un nouveau hash pour comparaison:');
  const newHash = bcrypt.hashSync(password, 10);
  console.log('Nouveau hash:', newHash);

  bcrypt.compare(password, newHash).then(result2 => {
    console.log('✅ Nouveau hash fonctionne:', result2);
  });
});
