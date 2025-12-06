/**
 * 🧹 CLEANUP SCRIPT - PRODUCTION READY
 *
 * Supprime toutes les données de test :
 * - Profils escorts et clubs
 * - Médias (photos/vidéos)
 * - Réactions et likes
 * - Messages
 *
 * GARDE :
 * - Comptes admins
 * - Structure de la base de données
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function cleanup() {
  console.log('🧹 Début du nettoyage de la base de données...\n');

  try {
    // 1. Supprimer toutes les réactions
    console.log('🗑️  Suppression des réactions...');
    const deletedReactions = await prisma.reaction.deleteMany({});
    console.log(`   ✅ ${deletedReactions.count} réactions supprimées\n`);

    // 2. Supprimer tous les médias
    console.log('🗑️  Suppression des médias...');
    const deletedMedia = await prisma.media.deleteMany({});
    console.log(`   ✅ ${deletedMedia.count} médias supprimés\n`);

    // 3. Supprimer tous les messages
    console.log('🗑️  Suppression des messages...');
    const deletedMessages = await prisma.message.deleteMany({});
    console.log(`   ✅ ${deletedMessages.count} messages supprimés\n`);

    // 4. Supprimer toutes les conversations
    console.log('🗑️  Suppression des conversations...');
    const deletedConversations = await prisma.conversation.deleteMany({});
    console.log(`   ✅ ${deletedConversations.count} conversations supprimées\n`);

    // 5. Supprimer tous les profils clubs (V2)
    console.log('🗑️  Suppression des profils clubs...');
    const deletedClubsV2 = await prisma.clubProfileV2.deleteMany({});
    console.log(`   ✅ ${deletedClubsV2.count} profils clubs supprimés\n`);

    // 6. Supprimer tous les profils escorts
    console.log('🗑️  Suppression des profils escorts...');
    const deletedEscorts = await prisma.escortProfile.deleteMany({});
    console.log(`   ✅ ${deletedEscorts.count} profils escorts supprimés\n`);

    // 7. Supprimer tous les utilisateurs NON-ADMIN
    console.log('🗑️  Suppression des utilisateurs non-admin...');
    const deletedUsers = await prisma.user.deleteMany({
      where: {
        role: {
          not: 'ADMIN'
        }
      }
    });
    console.log(`   ✅ ${deletedUsers.count} utilisateurs supprimés\n`);

    // 8. Vérifier les admins restants
    const remainingAdmins = await prisma.user.findMany({
      where: {
        role: 'ADMIN'
      },
      select: {
        email: true,
        role: true
      }
    });

    console.log('✅ NETTOYAGE TERMINÉ !\n');
    console.log('👤 Admins conservés :');
    remainingAdmins.forEach(admin => {
      console.log(`   - ${admin.email}`);
    });

    console.log('\n🎉 Base de données prête pour la production !');

  } catch (error) {
    console.error('❌ Erreur lors du nettoyage :', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Exécution
cleanup()
  .catch((error) => {
    console.error('❌ Erreur fatale :', error);
    process.exit(1);
  });
