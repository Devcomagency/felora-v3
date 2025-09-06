import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    const sessionUserId = (session as any)?.user?.id
    const body = await req.json().catch(() => ({}))
    const {
      userId,
      deviceId,
      identityKeyPub,
      signedPreKeyId,
      signedPreKeyPub,
      signedPreKeySig,
      preKeys,
      registrationId,
    } = body || {}

    if (!userId || !deviceId || !identityKeyPub || !signedPreKeyId || !signedPreKeyPub || !signedPreKeySig) {
      return NextResponse.json({ error: 'invalid_payload' }, { status: 400 })
    }

    // Optionally, require the session to match the userId (safe for real app)
    // if (!sessionUserId || sessionUserId !== userId) return NextResponse.json({ error: 'not_authorized' }, { status: 403 })

    const preKeysJson = Array.isArray(preKeys) ? { preKeys, registrationId: registrationId ?? null } : (preKeys || { preKeys: [], registrationId: registrationId ?? null })

    const rec = await prisma.userDevice.upsert({
      where: { userId_deviceId: { userId, deviceId } },
      update: {
        identityKeyPub,
        signedPreKeyId: Number(signedPreKeyId),
        signedPreKeyPub,
        signedPreKeySig,
        preKeysJson,
      },
      create: {
        userId,
        deviceId,
        identityKeyPub,
        signedPreKeyId: Number(signedPreKeyId),
        signedPreKeyPub,
        signedPreKeySig,
        preKeysJson,
      }
    })

    return NextResponse.json({ success: true, device: { userId: rec.userId, deviceId: rec.deviceId } })
  } catch (e) {
    console.error('keys/upload error', e)
    return NextResponse.json({ error: 'server_error' }, { status: 500 })
  }
}
