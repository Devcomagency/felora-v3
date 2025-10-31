const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const profile = await prisma.escortProfile.findUnique({
    where: { id: 'cmg2ej3hs0003l804ns2h6d0o' },
    select: {
      id: true,
      stageName: true,
      profilePhoto: true,
      userId: true,
    }
  });
  
  console.log('📋 Profile:', JSON.stringify(profile, null, 2));
  
  if (profile && profile.userId) {
    const user = await prisma.user.findUnique({
      where: { id: profile.userId },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
      }
    });
    console.log('👤 User:', JSON.stringify(user, null, 2));
  }
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => { prisma.$disconnect(); });

