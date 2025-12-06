import bcrypt from 'bcryptjs';

const password = 'admin123';

bcrypt.hash(password, 10).then(hash => {
  console.log('Password:', password);
  console.log('Hash:', hash);
  console.log('\nAdd to .env.local:');
  console.log(`ADMIN_PASSWORD_HASH="${hash}"`);
});
