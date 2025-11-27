import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * 🏥 HEALTHCHECK ENDPOINT
 *
 * Permet de vérifier que l'application fonctionne correctement
 * Utilisé par les systèmes de monitoring (Vercel, Datadog, etc.)
 *
 * GET /api/health
 * Returns 200 si OK, 503 si problème
 */

export async function GET() {
  const startTime = Date.now()

  try {
    // 1. Vérifier la connexion à la base de données
    await prisma.$queryRaw`SELECT 1`

    const dbLatency = Date.now() - startTime

    // 2. Collecter les métriques
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV,
      version: process.env.npm_package_version || '1.0.0',
      checks: {
        database: {
          status: 'up',
          latency: `${dbLatency}ms`
        },
        memory: {
          used: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`,
          total: `${Math.round(process.memoryUsage().heapTotal / 1024 / 1024)}MB`
        }
      }
    }

    return NextResponse.json(health, { status: 200 })

  } catch (error) {
    console.error('[HEALTH] Database check failed:', error)

    const health = {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      checks: {
        database: {
          status: 'down',
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      }
    }

    return NextResponse.json(health, { status: 503 })
  }
}
