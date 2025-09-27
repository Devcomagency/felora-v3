import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    // 1. Vérifier l'authentification
    const session = await getServerSession(authOptions as any)
    const userId = (session as any)?.user?.id as string | undefined

    if (!userId) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    // 2. Récupérer ou créer le wallet de diamants
    let diamondWallet = await prisma.diamondWallet.findUnique({
      where: { userId }
    })

    if (!diamondWallet) {
      // Créer un wallet avec des diamants de test
      diamondWallet = await prisma.diamondWallet.create({
        data: {
          userId,
          balance: 100, // 100 diamants de test
          totalEarned: 100,
          totalSpent: 0
        }
      })
      console.log(`✅ Wallet créé pour ${userId} avec 100 diamants de test`)
    }

    // 3. Retourner les données du wallet
    return NextResponse.json({
      success: true,
      wallet: {
        balance: diamondWallet.balance,
        totalEarned: diamondWallet.totalEarned,
        totalSpent: diamondWallet.totalSpent
      }
    })

  } catch (error: any) {
    console.error('Erreur récupération wallet diamants:', error)
    return NextResponse.json({
      error: 'Erreur interne du serveur',
      details: error?.message || 'Unknown error'
    }, { status: 500 })
  }
}

// POST pour ajouter des diamants de test
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions as any)
    const userId = (session as any)?.user?.id as string | undefined

    if (!userId) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const body = await request.json()
    const { amount } = body

    if (!amount || typeof amount !== 'number' || amount <= 0) {
      return NextResponse.json({
        error: 'Montant invalide'
      }, { status: 400 })
    }

    // Ajouter des diamants au wallet
    const updatedWallet = await prisma.diamondWallet.upsert({
      where: { userId },
      create: {
        userId,
        balance: amount,
        totalEarned: amount,
        totalSpent: 0
      },
      update: {
        balance: { increment: amount },
        totalEarned: { increment: amount }
      }
    })

    // Créer une transaction de crédit
    await prisma.diamondTransaction.create({
      data: {
        type: 'CREDIT',
        status: 'COMPLETED',
        amount: amount,
        fromUserId: 'system',
        toUserId: userId,
        description: `Ajout de test: ${amount} diamants`,
        metadata: {
          source: 'test_credit',
          reason: 'test_wallet'
        }
      }
    })

    console.log(`✅ ${amount} diamants ajoutés au wallet de ${userId}`)

    return NextResponse.json({
      success: true,
      message: `${amount} diamants ajoutés`,
      wallet: {
        balance: updatedWallet.balance,
        totalEarned: updatedWallet.totalEarned,
        totalSpent: updatedWallet.totalSpent
      }
    })

  } catch (error: any) {
    console.error('Erreur ajout diamants:', error)
    return NextResponse.json({
      error: 'Erreur interne du serveur',
      details: error?.message || 'Unknown error'
    }, { status: 500 })
  }
}