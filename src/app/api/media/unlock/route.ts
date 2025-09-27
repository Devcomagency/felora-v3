import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    // 1. Vérifier l'authentification
    const session = await getServerSession(authOptions as any)
    const userId = (session as any)?.user?.id as string | undefined

    if (!userId) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    // 2. Récupérer les données de la requête
    const body = await request.json()
    const { mediaId, price } = body

    if (!mediaId || !price || typeof price !== 'number' || price <= 0) {
      return NextResponse.json({
        error: 'Paramètres invalides (mediaId et price requis)'
      }, { status: 400 })
    }

    // 3. Vérifier que le média existe et est bien privé/payant
    const media = await prisma.media.findUnique({
      where: { id: mediaId },
      select: {
        id: true,
        ownerId: true,
        ownerType: true,
        visibility: true,
        price: true,
        url: true
      }
    })

    if (!media) {
      return NextResponse.json({
        error: 'Média non trouvé'
      }, { status: 404 })
    }

    if (media.visibility !== 'REQUESTABLE' && media.visibility !== 'PRIVATE') {
      return NextResponse.json({
        error: 'Ce média n\'est pas payant'
      }, { status: 400 })
    }

    // Vérifier le prix
    const actualPrice = media.price || price
    if (price !== actualPrice) {
      return NextResponse.json({
        error: `Prix incorrect (${actualPrice} diamants requis)`
      }, { status: 400 })
    }

    // 4. Vérifier si l'utilisateur a déjà accès au média
    const existingAccess = await prisma.mediaAccess.findUnique({
      where: {
        mediaId_userId: {
          mediaId: mediaId,
          userId: userId
        }
      }
    })

    if (existingAccess) {
      return NextResponse.json({
        success: true,
        message: 'Vous avez déjà accès à ce média',
        mediaUrl: media.url
      })
    }

    // 5. Vérifier le wallet de diamants de l'utilisateur
    let diamondWallet = await prisma.diamondWallet.findUnique({
      where: { userId }
    })

    if (!diamondWallet) {
      // Créer un wallet vide si n'existe pas
      diamondWallet = await prisma.diamondWallet.create({
        data: {
          userId,
          balance: 0,
          totalEarned: 0,
          totalSpent: 0
        }
      })
    }

    if (diamondWallet.balance < actualPrice) {
      return NextResponse.json({
        error: `Solde insuffisant (${actualPrice} diamants requis, ${diamondWallet.balance} disponibles)`
      }, { status: 400 })
    }

    // 6. Traitement atomique de la transaction
    const result = await prisma.$transaction(async (tx) => {
      // Débiter les diamants
      const updatedWallet = await tx.diamondWallet.update({
        where: { userId },
        data: {
          balance: { decrement: actualPrice },
          totalSpent: { increment: actualPrice }
        }
      })

      // Créer la transaction de paiement
      await tx.diamondTransaction.create({
        data: {
          type: 'TRANSFER',
          status: 'COMPLETED',
          amount: actualPrice,
          fromUserId: userId,
          toUserId: media.ownerId,
          description: `Déblocage média ${mediaId}`,
          metadata: {
            mediaId,
            mediaType: media.ownerType,
            unlockType: 'media_access'
          }
        }
      })

      // Donner accès au média
      const mediaAccess = await tx.mediaAccess.create({
        data: {
          mediaId: mediaId,
          userId: userId
        }
      })

      // Créditer le propriétaire du média (si ce n'est pas le même utilisateur)
      if (media.ownerId !== userId) {
        await tx.diamondWallet.upsert({
          where: { userId: media.ownerId },
          create: {
            userId: media.ownerId,
            balance: actualPrice,
            totalEarned: actualPrice,
            totalSpent: 0
          },
          update: {
            balance: { increment: actualPrice },
            totalEarned: { increment: actualPrice }
          }
        })

        // Transaction de crédit pour le propriétaire
        await tx.diamondTransaction.create({
          data: {
            type: 'TRANSFER',
            status: 'COMPLETED',
            amount: actualPrice,
            fromUserId: userId,
            toUserId: media.ownerId,
            description: `Vente média ${mediaId}`,
            metadata: {
              mediaId,
              mediaType: media.ownerType,
              saleType: 'media_unlock'
            }
          }
        })
      }

      return {
        mediaAccess,
        newBalance: updatedWallet.balance
      }
    })

    console.log(`✅ Média ${mediaId} débloqué pour utilisateur ${userId} (${actualPrice} diamants)`)

    return NextResponse.json({
      success: true,
      message: 'Média débloqué avec succès',
      mediaUrl: media.url,
      diamondsSpent: actualPrice,
      newBalance: result.newBalance
    })

  } catch (error: any) {
    console.error('Erreur déblocage média:', error)
    return NextResponse.json({
      error: 'Erreur interne du serveur',
      details: error?.message || 'Unknown error'
    }, { status: 500 })
  }
}

// GET pour vérifier l'accès à un média
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const mediaId = searchParams.get('mediaId')

    if (!mediaId) {
      return NextResponse.json({ error: 'mediaId requis' }, { status: 400 })
    }

    const session = await getServerSession(authOptions as any)
    const userId = (session as any)?.user?.id as string | undefined

    if (!userId) {
      return NextResponse.json({ hasAccess: false })
    }

    // Vérifier l'accès
    const access = await prisma.mediaAccess.findUnique({
      where: {
        mediaId_userId: {
          mediaId: mediaId,
          userId: userId
        }
      }
    })

    return NextResponse.json({
      hasAccess: !!access,
      accessDate: access?.createdAt || null
    })

  } catch (error: any) {
    console.error('Erreur vérification accès média:', error)
    return NextResponse.json({
      hasAccess: false,
      error: error?.message || 'Unknown error'
    }, { status: 500 })
  }
}