/**
 * 🧹 CLEANUP SCRIPT - Neon Database
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function cleanup() {
  console.log('🧹 Nettoyage de la base Neon...\n');

  try {
    console.log('📡 Test connexion...');
    await prisma.$queryRaw`SELECT 1`;
    console.log('✅ Connecté à Neon !\n');

    console.log('🗑️  Suppression des réactions...');
    const r = await prisma.$executeRaw`DELETE FROM "Reaction"`;
    console.log(`   ✅ ${r} réactions supprimées\n`);

    console.log('🗑️  Suppression des médias...');
    const m = await prisma.$executeRaw`DELETE FROM "Media"`;
    console.log(`   ✅ ${m} médias supprimés\n`);

    console.log('🗑️  Suppression des messages...');
    const msg = await prisma.$executeRaw`DELETE FROM "Message"`;
    console.log(`   ✅ ${msg} messages supprimés\n`);

    console.log('🗑️  Suppression des conversations...');
    const conv = await prisma.$executeRaw`DELETE FROM "Conversation"`;
    console.log(`   ✅ ${conv} conversations supprimées\n`);

    console.log('🗑️  Suppression des clubs...');
    const clubs = await prisma.$executeRaw`DELETE FROM "ClubProfileV2"`;
    console.log(`   ✅ ${clubs} clubs supprimés\n`);

    console.log('🗑️  Suppression des escorts...');
    const escorts = await prisma.$executeRaw`DELETE FROM "EscortProfile"`;
    console.log(`   ✅ ${escorts} escorts supprimés\n`);

    console.log('🗑️  Suppression des users non-admin...');
    const users = await prisma.$executeRaw`DELETE FROM "User" WHERE role != 'ADMIN'`;
    console.log(`   ✅ ${users} utilisateurs supprimés\n`);

    const admins = await prisma.user.findMany({
      where: { role: 'ADMIN' },
      select: { email: true }
    });

    console.log('✅ NETTOYAGE TERMINÉ !\n');
    console.log(`👤 ${admins.length} admin(s) conservé(s) :`);
    admins.forEach(a => console.log(`   - ${a.email}`));
    console.log('\n🎉 Base de données prête pour la production !');

  } catch (error) {
    console.error('❌ Erreur :', error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanup();
