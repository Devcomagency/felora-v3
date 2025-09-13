import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({
        success: false,
        error: 'Non authentifié',
        debug: {
          hasSession: false,
          sessionData: null
        }
      }, { status: 401 })
    }

    // Récupérer l'utilisateur complet
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        password: true,
        passwordHash: true,
        createdAt: true,
        updatedAt: true
      }
    })

    if (!user) {
      return NextResponse.json({
        success: false,
        error: 'Utilisateur non trouvé',
        debug: {
          userId: session.user.id,
          userFound: false
        }
      }, { status: 404 })
    }

    // Récupérer le profil escort
    const escortProfile = await prisma.escortProfile.findUnique({
      where: { userId: session.user.id },
      status: true,
        isVerifiedBadge: true,
        hasProfilePhoto: true,
        profilePhoto: true,
        createdAt: true,
        updatedAt: true
      }
    })

    // Récupérer le profil club
    const clubProfile = await prisma.clubProfile.findUnique({
      where: { userId: session.user.id },
      isActive: true,
        createdAt: true,
        updatedAt: true
      }
    })

    // Récupérer le wallet
    const wallet = await prisma.wallet.findUnique({
      where: { userId: session.user.id },
      select: {
        id: true,
        balance: true,
        createdAt: true,
        updatedAt: true
      }
    })

    // Récupérer les médias
    const media = await prisma.media.findMany({
      where: {
        ownerType: 'escort',
        ownerId: session.user.id
      },
      select: {
        id: true,
        type: true,
        url: true,
        visibility: true,
        isActive: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' },
      take: 5
    })

    return NextResponse.json({
      success: true,
      debug: {
        session: {
          userId: session.user.id,
          email: session.user.email,
          name: session.user.name,
          role: session.user.role
        },
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          hasPassword: !!user.password,
          hasPasswordHash: !!user.passwordHash,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        },
        status: escortProfile.status,
          isVerifiedBadge: escortProfile.isVerifiedBadge,
          hasProfilePhoto: escortProfile.hasProfilePhoto,
          profilePhoto: escortProfile.profilePhoto,
          createdAt: escortProfile.createdAt,
          updatedAt: escortProfile.updatedAt
        } : null,
        isActive: clubProfile.isActive,
          createdAt: clubProfile.createdAt,
          updatedAt: clubProfile.updatedAt
        } : null,
        wallet: wallet ? {
          id: wallet.id,
          balance: wallet.balance,
          createdAt: wallet.createdAt,
          updatedAt: wallet.updatedAt
        } : null,
        media: {
          count: media.length,
          items: media.map(m => ({
            id: m.id,
            type: m.type,
            url: m.url?.substring(0, 50) + '...',
            visibility: m.visibility,
            isActive: m.isActive,
            createdAt: m.createdAt
          }))
        }
      }
    })

  } catch (error) {
    console.error('Erreur health check:', error)
    return NextResponse.json({
      success: false,
      error: 'Erreur serveur',
      debug: {
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      }
    }, { status: 500 })
  }
}
