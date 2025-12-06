/**
 * 🧹 CLEANUP SCRIPT - Version finale avec bons noms de tables
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function cleanup() {
  console.log('🧹 Nettoyage complet de la base de données...\n');

  try {
    console.log('📡 Test connexion...');
    await prisma.$queryRaw`SELECT 1`;
    console.log('✅ Connecté !\n');

    console.log('🗑️  Suppression des réactions...');
    const r = await prisma.$executeRaw`DELETE FROM reactions`;
    console.log(`   ✅ ${r} réactions supprimées\n`);

    console.log('🗑️  Suppression des médias...');
    const m = await prisma.$executeRaw`DELETE FROM media`;
    console.log(`   ✅ ${m} médias supprimés\n`);

    console.log('🗑️  Suppression des messages...');
    const msg = await prisma.$executeRaw`DELETE FROM messages`;
    console.log(`   ✅ ${msg} messages supprimés\n`);

    console.log('🗑️  Suppression des conversations...');
    const conv = await prisma.$executeRaw`DELETE FROM conversations`;
    console.log(`   ✅ ${conv} conversations supprimées\n`);

    console.log('🗑️  Suppression des profils clubs V2...');
    const clubsV2 = await prisma.$executeRaw`DELETE FROM club_profiles_v2`;
    console.log(`   ✅ ${clubsV2} clubs V2 supprimés\n`);

    console.log('🗑️  Suppression des profils clubs V1...');
    const clubsV1 = await prisma.$executeRaw`DELETE FROM club_profiles`;
    console.log(`   ✅ ${clubsV1} clubs V1 supprimés\n`);

    console.log('🗑️  Suppression des profils escorts V2...');
    const escortsV2 = await prisma.$executeRaw`DELETE FROM escort_profiles_v2`;
    console.log(`   ✅ ${escortsV2} escorts V2 supprimés\n`);

    console.log('🗑️  Suppression des profils escorts V1...');
    const escortsV1 = await prisma.$executeRaw`DELETE FROM escort_profiles`;
    console.log(`   ✅ ${escortsV1} escorts V1 supprimés\n`);

    console.log('🗑️  Suppression des utilisateurs non-admin...');
    const users = await prisma.$executeRaw`DELETE FROM users WHERE role != 'ADMIN'`;
    console.log(`   ✅ ${users} utilisateurs supprimés\n`);

    const admins = await prisma.user.findMany({
      where: { role: 'ADMIN' },
      select: { email: true, role: true }
    });

    console.log('✅ NETTOYAGE TERMINÉ !\n');
    console.log(`👤 ${admins.length} admin(s) conservé(s) :`);
    admins.forEach(a => console.log(`   - ${a.email}`));
    console.log('\n🎉 Base de données PRÊTE POUR LA PRODUCTION !');

  } catch (error) {
    console.error('❌ Erreur :', error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanup();
