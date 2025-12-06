/**
 * 🧹 CLEANUP SCRIPT - VERSION RAPIDE
 * Supprime par lots pour éviter les timeouts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function cleanup() {
  console.log('🧹 Début du nettoyage rapide...\n');

  try {
    // Utiliser des requêtes SQL brutes pour plus de rapidité
    console.log('🗑️  Suppression des réactions...');
    await prisma.$executeRaw`DELETE FROM "Reaction"`;
    console.log('   ✅ Réactions supprimées\n');

    console.log('🗑️  Suppression des médias...');
    await prisma.$executeRaw`DELETE FROM "Media"`;
    console.log('   ✅ Médias supprimés\n');

    console.log('🗑️  Suppression des messages...');
    await prisma.$executeRaw`DELETE FROM "Message"`;
    console.log('   ✅ Messages supprimés\n');

    console.log('🗑️  Suppression des conversations...');
    await prisma.$executeRaw`DELETE FROM "Conversation"`;
    console.log('   ✅ Conversations supprimées\n');

    console.log('🗑️  Suppression des profils clubs...');
    await prisma.$executeRaw`DELETE FROM "ClubProfileV2"`;
    console.log('   ✅ Profils clubs supprimés\n');

    console.log('🗑️  Suppression des profils escorts...');
    await prisma.$executeRaw`DELETE FROM "EscortProfile"`;
    console.log('   ✅ Profils escorts supprimés\n');

    console.log('🗑️  Suppression des utilisateurs non-admin...');
    await prisma.$executeRaw`DELETE FROM "User" WHERE role != 'ADMIN'`;
    console.log('   ✅ Utilisateurs supprimés\n');

    // Vérifier les admins restants
    const admins = await prisma.user.findMany({
      where: { role: 'ADMIN' },
      select: { email: true }
    });

    console.log('✅ NETTOYAGE TERMINÉ !\n');
    console.log(`👤 ${admins.length} admin(s) conservé(s) :`);
    admins.forEach(admin => console.log(`   - ${admin.email}`));

    console.log('\n🎉 Base de données prête pour la production !');

  } catch (error) {
    console.error('❌ Erreur :', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

cleanup();
