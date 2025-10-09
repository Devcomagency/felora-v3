import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { jwtVerify } from 'jose'

export async function POST(request: NextRequest) {
  try {
    const bundle = await request.json()
    const { userId, deviceId, identityKeyPub } = bundle

    if (!userId || !deviceId || !identityKeyPub) {
      console.error('[KEYS API] Missing required fields:', { userId: !!userId, deviceId: !!deviceId, identityKeyPub: !!identityKeyPub })
      console.error('[KEYS API] Received bundle:', bundle)
      return NextResponse.json({
        error: 'Paramètres requis manquants (userId, deviceId, identityKeyPub)'
      }, { status: 400 })
    }

    // Authentification
    let session = await getServerSession(authOptions)
    let user = null
    
    if (session?.user?.id) {
      user = session.user
    } else {
      // Fallback : décoder le JWT directement
      const cookieHeader = request.headers.get('cookie')
      const sessionToken = cookieHeader?.match(/next-auth\.session-token=([^;]+)/)?.[1]
      
      if (sessionToken) {
        try {
          const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET)
          const { payload } = await jwtVerify(sessionToken, secret)
          
          if (payload.sub) {
            user = {
              id: payload.sub,
              email: payload.email as string,
              name: payload.name as string,
              role: (payload as any).role as string,
            }
          }
        } catch (jwtError) {
          console.error('[KEYS API] Error decoding JWT:', jwtError)
        }
      }
    }
    
    if (!user?.id) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    // Vérifier que l'utilisateur peut uploader ses clés
    if (user.id !== userId) {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 })
    }

    // Stocker le bundle Signal dans la base de données
    console.log(`[KEYS API] Uploading Signal bundle for user ${userId}, device ${deviceId}`)
    console.log(`[KEYS API] Bundle keys:`, Object.keys(bundle))

    // Upsert du device (créer ou mettre à jour)
    await prisma.userDevice.upsert({
      where: {
        userId_deviceId: {
          userId,
          deviceId
        }
      },
      create: {
        userId,
        deviceId,
        identityKeyPub: bundle.identityKeyPub,
        signedPreKeyId: bundle.signedPreKeyId || 1,
        signedPreKeyPub: bundle.signedPreKeyPub || '',
        signedPreKeySig: bundle.signedPreKeySig || '',
        preKeysJson: {
          preKeys: bundle.preKeys || [],
          registrationId: bundle.registrationId || 0
        }
      },
      update: {
        identityKeyPub: bundle.identityKeyPub,
        signedPreKeyId: bundle.signedPreKeyId || 1,
        signedPreKeyPub: bundle.signedPreKeyPub || '',
        signedPreKeySig: bundle.signedPreKeySig || '',
        preKeysJson: {
          preKeys: bundle.preKeys || [],
          registrationId: bundle.registrationId || 0
        },
        updatedAt: new Date()
      }
    })

    console.log(`[KEYS API] Bundle Signal saved successfully for ${userId}/${deviceId}`)

    return NextResponse.json({
      success: true,
      message: 'Bundle Signal uploadé avec succès',
      bundle: {
        userId,
        deviceId,
        identityKeyPub
      }
    })

  } catch (error) {
    console.error('Erreur lors de l\'upload des clés:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}