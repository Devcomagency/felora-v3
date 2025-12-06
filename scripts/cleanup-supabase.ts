/**
 * 🧹 CLEANUP SCRIPT - Direct Supabase connection
 */

import { PrismaClient } from '@prisma/client';

// Force Supabase connection
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://postgres:349plC1Bbblm2MuB@db.lomrmlqxcgvzbndpjyjl.supabase.co:5432/postgres"
    }
  }
});

async function cleanup() {
  console.log('🧹 Nettoyage avec connexion Supabase directe...\n');

  try {
    // Test connexion
    console.log('📡 Test connexion...');
    await prisma.$queryRaw`SELECT 1`;
    console.log('✅ Connecté !\n');

    // Suppression
    console.log('🗑️  Suppression des réactions...');
    const r = await prisma.$executeRaw`DELETE FROM "Reaction"`;
    console.log(`   ✅ ${r} supprimées\n`);

    console.log('🗑️  Suppression des médias...');
    const m = await prisma.$executeRaw`DELETE FROM "Media"`;
    console.log(`   ✅ ${m} supprimés\n`);

    console.log('🗑️  Suppression des messages...');
    const msg = await prisma.$executeRaw`DELETE FROM "Message"`;
    console.log(`   ✅ ${msg} supprimés\n`);

    console.log('🗑️  Suppression des conversations...');
    const conv = await prisma.$executeRaw`DELETE FROM "Conversation"`;
    console.log(`   ✅ ${conv} supprimées\n`);

    console.log('🗑️  Suppression des clubs...');
    const clubs = await prisma.$executeRaw`DELETE FROM "ClubProfileV2"`;
    console.log(`   ✅ ${clubs} supprimés\n`);

    console.log('🗑️  Suppression des escorts...');
    const escorts = await prisma.$executeRaw`DELETE FROM "EscortProfile"`;
    console.log(`   ✅ ${escorts} supprimés\n`);

    console.log('🗑️  Suppression des users non-admin...');
    const users = await prisma.$executeRaw`DELETE FROM "User" WHERE role != 'ADMIN'`;
    console.log(`   ✅ ${users} supprimés\n`);

    // Vérif finale
    const admins = await prisma.user.findMany({
      where: { role: 'ADMIN' },
      select: { email: true }
    });

    console.log('✅ TERMINÉ !\n');
    console.log(`👤 ${admins.length} admin(s) :`);
    admins.forEach(a => console.log(`   - ${a.email}`));

  } catch (error) {
    console.error('❌ Erreur :', error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanup();
