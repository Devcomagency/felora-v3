// Test d'upload d'un nouveau média pour vérifier les URLs
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testNewUpload() {
  console.log('🧪 Test d\'upload d\'un nouveau média...\n');
  
  try {
    // 1. Vérifier les médias récents avec URLs undefined
    const recentUndefined = await prisma.media.findMany({
      where: {
        OR: [
          { url: { contains: 'undefined' } },
          { thumbUrl: { contains: 'undefined' } }
        ]
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: { id: true, url: true, thumbUrl: true, type: true, createdAt: true }
    });
    
    console.log(`📹 Médias récents avec URLs undefined: ${recentUndefined.length}`);
    recentUndefined.forEach(media => {
      console.log(`  - ${media.type} (${media.createdAt.toISOString().split('T')[0]}): ${media.url}`);
    });
    
    // 2. Vérifier les médias créés dans la dernière heure
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const recentMedia = await prisma.media.findMany({
      where: {
        createdAt: {
          gte: oneHourAgo
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: { id: true, url: true, thumbUrl: true, type: true, createdAt: true }
    });
    
    console.log(`\n📊 Médias créés dans la dernière heure: ${recentMedia.length}`);
    recentMedia.forEach(media => {
      const hasUndefined = media.url?.includes('undefined') || media.thumbUrl?.includes('undefined');
      const status = hasUndefined ? '❌ UNDEFINED' : '✅ OK';
      console.log(`  - ${media.type} (${media.createdAt.toISOString().split('T')[1].split('.')[0]}): ${status}`);
      if (hasUndefined) {
        console.log(`    URL: ${media.url}`);
        console.log(`    Thumb: ${media.thumbUrl}`);
      }
    });
    
    // 3. Statistiques générales
    const totalMedia = await prisma.media.count();
    const undefinedMedia = await prisma.media.count({
      where: {
        OR: [
          { url: { contains: 'undefined' } },
          { thumbUrl: { contains: 'undefined' } }
        ]
      }
    });
    
    console.log(`\n📈 Statistiques:`);
    console.log(`  - Total médias: ${totalMedia}`);
    console.log(`  - Avec URLs undefined: ${undefinedMedia}`);
    console.log(`  - Pourcentage undefined: ${((undefinedMedia / totalMedia) * 100).toFixed(2)}%`);
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testNewUpload();
