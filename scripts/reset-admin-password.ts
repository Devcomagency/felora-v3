/**
 * 🔐 Reset Admin Password
 * Met à jour le mot de passe de info@devcom.ch avec le hash correct
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function resetPassword() {
  const email = 'info@devcom.ch';
  const newPassword = 'Felora2025!SecureAdmin';

  console.log('🔐 Réinitialisation du mot de passe admin...\n');

  try {
    // Vérifier que l'admin existe
    const admin = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, role: true }
    });

    if (!admin) {
      console.log('❌ Admin non trouvé !');
      return;
    }

    console.log(`✅ Admin trouvé: ${admin.email} (${admin.role})\n`);

    // Générer le nouveau hash
    console.log('🔄 Génération du nouveau hash...');
    const passwordHash = await bcrypt.hash(newPassword, 10);
    console.log(`   Hash: ${passwordHash}\n`);

    // Mettre à jour le mot de passe
    await prisma.user.update({
      where: { email },
      data: { passwordHash }
    });

    console.log('✅ Mot de passe mis à jour !\n');
    console.log('📋 Identifiants admin :');
    console.log(`   Email: ${email}`);
    console.log(`   Mot de passe: ${newPassword}`);

  } catch (error) {
    console.error('❌ Erreur :', error);
  } finally {
    await prisma.$disconnect();
  }
}

resetPassword();
