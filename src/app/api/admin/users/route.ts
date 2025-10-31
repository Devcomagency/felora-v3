import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Admin Users API - Début de la requête')

    // Pas de vérification d'authentification côté serveur
    // L'authentification est gérée côté client via localStorage (comme /admin/kyc)

    // Récupérer tous les utilisateurs avec leurs relations (sauf les ADMIN)
    console.log('📊 Récupération des utilisateurs...')
    const users = await prisma.user.findMany({
      where: {
        role: {
          not: 'ADMIN'
        }
      },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        lastLoginAt: true,
        bannedAt: true,
        bannedReason: true,
        // Profil Escort
        escortProfile: {
          select: {
            id: true,
            stageName: true,
            isVerifiedBadge: true,
            views: true,
            photosCount: true,
            videosCount: true,
            category: true
          }
        },
        // Profil Escort V2 (pour le handle)
        escortProfileV2: {
          select: {
            id: true,
            handle: true
          }
        },
        // Profil Club V2
        clubProfileV2: {
          select: {
            id: true,
            handle: true,
            companyName: true,
            verified: true
          }
        },
        // Soumissions KYC (la plus récente basée sur updatedAt)
        kycSubmissions: {
          select: {
            id: true,
            status: true,
            createdAt: true,
            updatedAt: true
          },
          orderBy: { updatedAt: 'desc' },
          take: 1
        },
        // Statistiques de messages
        _count: {
          select: {
            sentMessages: true,
            receivedMessages: true,
            notifications: true
          }
        }
      }
    })

    console.log(`✅ ${users.length} utilisateurs récupérés`)

    // Calculer les statistiques globales
    const totalUsers = users.length
    const totalEscorts = users.filter(u => u.role === 'ESCORT').length
    const totalClubs = users.filter(u => u.role === 'CLUB').length
    const totalClients = users.filter(u => u.role === 'CLIENT').length
    const totalBanned = users.filter(u => u.bannedAt !== null).length

    const now = new Date()
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const newThisWeek = users.filter(u => new Date(u.createdAt) >= oneWeekAgo).length

    // Utilisateurs actifs (connectés dans les 30 derniers jours)
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    const activeUsers = users.filter(u => {
      if (!u.lastLoginAt) return false
      const lastLogin = new Date(u.lastLoginAt)
      return lastLogin >= thirtyDaysAgo
    }).length

    const verifiedProfiles = users.filter(u => {
      if (u.escortProfile?.isVerifiedBadge) return true
      if (u.clubProfileV2?.verified) return true
      return false
    }).length

    // Statistiques d'abonnements (pour l'instant on ne les a pas dans le schéma)
    const activeSubscriptions = 0
    const expiredSubscriptions = 0

    return NextResponse.json({
      success: true,
      users: users.map(u => ({
        ...u,
        createdAt: u.createdAt.toISOString(),
        updatedAt: u.updatedAt.toISOString(),
        lastLoginAt: u.lastLoginAt?.toISOString() || null,
        bannedAt: u.bannedAt?.toISOString() || null,
        escortProfile: u.escortProfile ? {
          id: u.escortProfile.id,
          displayName: u.escortProfile.stageName,
          isVerifiedBadge: u.escortProfile.isVerifiedBadge,
          viewsCount: u.escortProfile.views,
          subscriptionType: null,
          subscriptionRenewalCount: 0,
          subscriptionExpiresAt: null,
          category: u.escortProfile.category,
          _count: {
            media: u.escortProfile.photosCount + u.escortProfile.videosCount
          }
        } : null,
        escortProfileV2: u.escortProfileV2 ? {
          id: u.escortProfileV2.id,
          handle: u.escortProfileV2.handle
        } : null,
        clubProfile: u.clubProfileV2 ? {
          id: u.clubProfileV2.id,
          handle: u.clubProfileV2.handle,
          displayName: u.clubProfileV2.companyName || 'Club',
          isVerifiedBadge: u.clubProfileV2.verified,
          viewsCount: 0,
          subscriptionType: null,
          subscriptionRenewalCount: 0,
          subscriptionExpiresAt: null,
          _count: {
            media: 0
          }
        } : null,
        kycSubmissions: u.kycSubmissions.map(k => ({
          ...k,
          createdAt: k.createdAt.toISOString()
        }))
      })),
      statistics: {
        totalUsers,
        totalEscorts,
        totalClubs,
        totalClients,
        totalBanned,
        newThisWeek,
        activeUsers,
        verifiedProfiles,
        activeSubscriptions,
        expiredSubscriptions,
        escortsByCategory: users
          .filter(u => u.role === 'ESCORT' && u.escortProfile)
          .reduce((acc, u) => {
            const category = u.escortProfile!.category || 'ESCORT'
            acc[category] = (acc[category] || 0) + 1
            return acc
          }, {} as Record<string, number>)
      }
    })
  } catch (error) {
    console.error('❌ Erreur récupération utilisateurs:', error)
    console.error('Stack:', error instanceof Error ? error.stack : 'No stack')
    console.error('Message:', error instanceof Error ? error.message : String(error))

    return NextResponse.json({
      success: false,
      error: 'Erreur lors de la récupération des utilisateurs',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}
