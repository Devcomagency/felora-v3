import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkReports() {
  try {
    const reports = await prisma.report.findMany({
      select: {
        id: true,
        reportType: true,
        targetType: true,
        status: true,
        createdAt: true,
        reporterEmail: true
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    })

    console.log('📊 Signalements trouvés:', reports.length)
    
    if (reports.length > 0) {
      console.log('\n📋 Liste des signalements:')
      reports.forEach((r, i) => {
        console.log(`${i + 1}. [${r.status}] ${r.reportType} - ${r.targetType}`)
        console.log(`   ID: ${r.id}`)
        console.log(`   Date: ${r.createdAt.toISOString()}`)
        console.log(`   Email: ${r.reporterEmail || 'N/A'}`)
        console.log('')
      })
    } else {
      console.log('❌ Aucun signalement trouvé dans la base de données')
    }

  } catch (error) {
    console.error('❌ Erreur:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkReports()
