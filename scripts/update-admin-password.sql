-- 🔐 UPDATE ADMIN PASSWORD FOR PRODUCTION
-- Password: Felora2025!SecureAdmin

UPDATE users
SET
  password = '$2b$10$lLbbIyEhemGrplyxOumPJeQyDqWMluiNq039zM110UYe65BKLmkCy',
  role = 'ADMIN'
WHERE email = 'info@devcom.ch';

-- Verify
SELECT id, email, role, "createdAt", LEFT(password, 30) as password_preview
FROM users
WHERE email = 'info@devcom.ch';
