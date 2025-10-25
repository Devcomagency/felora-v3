// Script pour surveiller les uploads en temps réel
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function monitorUploads() {
  console.log('🔍 Surveillance des uploads en temps réel...\n');
  console.log('📋 Instructions:');
  console.log('1. Tentez un upload via l\'interface');
  console.log('2. Ce script détectera immédiatement les nouveaux médias');
  console.log('3. Surveillez les logs du serveur Next.js pour voir quelle API est appelée\n');
  
  let lastCount = 0;
  
  // Vérifier le nombre initial de médias
  const initialCount = await prisma.media.count();
  lastCount = initialCount;
  console.log(`📊 Médias actuels: ${initialCount}`);
  
  // Vérifier les médias undefined existants
  const undefinedMedia = await prisma.media.findMany({
    where: {
      OR: [
        { url: { contains: 'undefined' } },
        { thumbUrl: { contains: 'undefined' } }
      ]
    },
    orderBy: { createdAt: 'desc' },
    take: 5
  });
  
  if (undefinedMedia.length > 0) {
    console.log(`\n❌ ${undefinedMedia.length} médias undefined trouvés:`);
    undefinedMedia.forEach(media => {
      console.log(`  - ${media.type} (${media.createdAt.toISOString().split('T')[1].split('.')[0]}): ${media.url}`);
    });
  } else {
    console.log('\n✅ Aucun média undefined trouvé');
  }
  
  console.log('\n⏳ Surveillance en cours... (Ctrl+C pour arrêter)');
  
  // Surveiller les nouveaux médias
  setInterval(async () => {
    try {
      const currentCount = await prisma.media.count();
      
      if (currentCount > lastCount) {
        console.log(`\n🆕 NOUVEAU MÉDIA DÉTECTÉ! (${currentCount - lastCount} nouveau(x))`);
        
        // Récupérer les médias récents
        const recentMedia = await prisma.media.findMany({
          orderBy: { createdAt: 'desc' },
          take: currentCount - lastCount,
          select: { id: true, url: true, thumbUrl: true, type: true, createdAt: true }
        });
        
        recentMedia.forEach(media => {
          const hasUndefined = media.url?.includes('undefined') || media.thumbUrl?.includes('undefined');
          const status = hasUndefined ? '❌ UNDEFINED' : '✅ OK';
          console.log(`  - ${media.type} (${media.createdAt.toISOString().split('T')[1].split('.')[0]}): ${status}`);
          if (hasUndefined) {
            console.log(`    URL: ${media.url}`);
            console.log(`    Thumb: ${media.thumbUrl}`);
          }
        });
        
        lastCount = currentCount;
      }
    } catch (error) {
      console.error('❌ Erreur surveillance:', error.message);
    }
  }, 2000); // Vérifier toutes les 2 secondes
}

// Gestion de l'arrêt propre
process.on('SIGINT', async () => {
  console.log('\n\n🛑 Arrêt de la surveillance...');
  await prisma.$disconnect();
  process.exit(0);
});

monitorUploads().catch(console.error);
