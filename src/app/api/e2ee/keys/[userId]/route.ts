import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(_req: Request, { params }: { params: Promise<{ userId: string }> }) {
  try {
    const { userId } = await params
    if (!userId) return NextResponse.json({ error: 'missing_user' }, { status: 400 })
    // Fetch the most recent device bundle for this user
    const device = await prisma.userDevice.findFirst({ where: { userId }, orderBy: { updatedAt: 'desc' } })
    if (!device) return NextResponse.json({ bundle: null })
    // preKeysJson may be an array (legacy) or an object { preKeys, registrationId }
    const pkj: any = device.preKeysJson as any
    const preKeys = Array.isArray(pkj) ? pkj : (pkj?.preKeys || [])
    const registrationId = Array.isArray(pkj) ? null : (pkj?.registrationId ?? null)
    return NextResponse.json({
      bundle: {
        userId: device.userId,
        deviceId: device.deviceId,
        identityKeyPub: device.identityKeyPub,
        signedPreKeyId: device.signedPreKeyId,
        signedPreKeyPub: device.signedPreKeyPub,
        signedPreKeySig: device.signedPreKeySig,
        preKeys,
        registrationId,
      }
    })
  } catch (e) {
    console.error('keys/[userId] error', e)
    return NextResponse.json({ error: 'server_error' }, { status: 500 })
  }
}
