import bcrypt from 'bcryptjs';

const password = 'Felora2025!SecureAdmin';
const hash = '$2b$10$ZayGHs.0FF9rnA5iRVECeeOPuRNmRaNBvaCV5R5lzUNDU18baTCsm';

console.log('Testing password:', password);
console.log('Against hash:', hash);

bcrypt.compare(password, hash).then(result => {
  console.log('Result:', result ? '✅ MATCH' : '❌ NO MATCH');
});
