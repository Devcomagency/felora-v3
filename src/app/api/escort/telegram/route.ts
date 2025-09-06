import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { telegramBridge } from '@/lib/telegram-bridge'

// GET: Obtenir le statut Telegram de l'escorte
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id || session.user.role !== 'ESCORT') {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 })
    }

    const escortProfile = await prisma.escortProfile.findUnique({
      where: { userId: session.user.id },
      select: {
        telegramChatId: true,
        telegramUsername: true,
        telegramConnected: true,
        telegramEnabled: true,
        messagingPreference: true
      }
    })

    if (!escortProfile) {
      return NextResponse.json({ error: 'Profil escorte non trouvé' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      telegram: {
        connected: escortProfile.telegramConnected,
        enabled: escortProfile.telegramEnabled,
        username: escortProfile.telegramUsername,
        chatId: escortProfile.telegramChatId ? '✓ Configuré' : null,
        preference: escortProfile.messagingPreference,
        botUsername: process.env.TELEGRAM_BOT_USERNAME || 'FELORABot'
      }
    })

  } catch (error) {
    console.error('Erreur statut Telegram:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// POST: Connecter/Configurer Telegram
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id || session.user.role !== 'ESCORT') {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 })
    }

    const { action, telegramCode, messagingPreference, enabled } = await request.json()

    const escortProfile = await prisma.escortProfile.findUnique({
      where: { userId: session.user.id }
    })

    if (!escortProfile) {
      return NextResponse.json({ error: 'Profil escorte non trouvé' }, { status: 404 })
    }

    switch (action) {
      case 'connect':
        if (!telegramCode) {
          return NextResponse.json({ 
            error: 'Code Telegram requis' 
          }, { status: 400 })
        }

        // Vérifier le code Telegram (logique simplifiée)
        const telegramVerification = await verifyTelegramCode(
          telegramCode, 
          session.user.id,
          escortProfile.stageName
        )

        if (!telegramVerification.success) {
          return NextResponse.json({ 
            error: telegramVerification.error 
          }, { status: 400 })
        }

        // Mettre à jour le profil avec les infos Telegram
        await prisma.escortProfile.update({
          where: { userId: session.user.id },
          data: {
            telegramChatId: telegramVerification.chatId,
            telegramUsername: telegramVerification.username,
            telegramConnected: true,
            telegramEnabled: true,
            messagingPreference: messagingPreference || 'BOTH'
          }
        })

        return NextResponse.json({
          success: true,
          message: 'Telegram connecté avec succès !',
          telegram: {
            connected: true,
            username: telegramVerification.username
          }
        })

      case 'disconnect':
        await prisma.escortProfile.update({
          where: { userId: session.user.id },
          data: {
            telegramChatId: null,
            telegramUsername: null,
            telegramConnected: false,
            telegramEnabled: false,
            messagingPreference: 'APP_ONLY'
          }
        })

        return NextResponse.json({
          success: true,
          message: 'Telegram déconnecté'
        })

      case 'update_preferences':
        await prisma.escortProfile.update({
          where: { userId: session.user.id },
          data: {
            telegramEnabled: enabled,
            messagingPreference: messagingPreference || escortProfile.messagingPreference
          }
        })

        return NextResponse.json({
          success: true,
          message: 'Préférences mises à jour'
        })

      default:
        return NextResponse.json({ 
          error: 'Action non reconnue' 
        }, { status: 400 })
    }

  } catch (error) {
    console.error('Erreur Telegram config:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

/**
 * Vérifier le code Telegram de connexion
 */
async function verifyTelegramCode(
  code: string, 
  userId: string, 
  stageName: string
): Promise<{
  success: boolean
  error?: string
  chatId?: string
  username?: string
}> {
  try {
    // Le code doit être au format: FELORA_XXXXX
    if (!code.startsWith('FELORA_')) {
      return { 
        success: false, 
        error: 'Code invalide. Utilisez le code généré par le bot Telegram.' 
      }
    }

    // Extraire l'ID du code (logique simplifiée pour la démo)
    const codeId = code.replace('FELORA_', '')
    
    // En production, ici on vérifierait le code dans une base temporaire
    // et on récupérerait le chatId associé
    
    // Pour la démo, simuler une vérification réussie
    if (codeId.length === 8) { // Format correct
      return {
        success: true,
        chatId: `telegram_chat_${userId}`,
        username: `@${stageName.toLowerCase().replace(/\s+/g, '_')}`
      }
    }

    return { 
      success: false, 
      error: 'Code expiré ou invalide' 
    }

  } catch (error) {
    console.error('Erreur vérification Telegram:', error)
    return { 
      success: false, 
      error: 'Erreur lors de la vérification' 
    }
  }
}