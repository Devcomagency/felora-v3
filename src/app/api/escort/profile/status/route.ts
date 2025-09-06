import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { initSentryServerOnce, captureServerException } from '@/lib/sentry-server'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { checkProfileCompletion } from '@/lib/profile-validation'

// GET /api/escort/profile/status
export async function GET() {
  try {
    initSentryServerOnce()
    const session = await getServerSession(authOptions as any)
    const userId = (session as any)?.user?.id as string | undefined
    if (!userId) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

    const escort = await prisma.escortProfile.findUnique({
      where: { userId },
      select: {
        status: true,
        isVerifiedBadge: true,
        stageName: true,
        description: true,
        city: true,
        canton: true,
        languages: true,
        services: true,
        photosCount: true,
        videosCount: true,
        hasProfilePhoto: true,
        rate1H: true,
      }
    })
    if (!escort) return NextResponse.json({ status: 'PENDING', isVerifiedBadge: false, completion: { isComplete:false, percentage:0, missing:[] }, canActivate:false })

    const completion = checkProfileCompletion(escort as any)
    const canActivate = completion.percentage >= 80
    return NextResponse.json({ status: escort.status, isVerifiedBadge: !!escort.isVerifiedBadge, completion, canActivate, canPause: escort.status === 'ACTIVE' })
  } catch (e:any) {
    console.error('/api/escort/profile/status GET error:', e.message)
    try { captureServerException(e) } catch {}
    return NextResponse.json({ error: 'server_error' }, { status: 500 })
  }
}

// POST /api/escort/profile/status { action: 'activate'|'resume'|'pause' }
export async function POST(req: NextRequest) {
  try {
    initSentryServerOnce()
    const session = await getServerSession(authOptions as any)
    const userId = (session as any)?.user?.id as string | undefined
    if (!userId) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

    const body = await req.json().catch(() => ({}))
    const action = String(body?.action || '').toLowerCase()

    const escort = await prisma.escortProfile.findUnique({ where: { userId }, select: { id: true, status: true } })
    if (!escort) return NextResponse.json({ ok: false, error: 'profile_not_found' }, { status: 404 })

    let newStatus: any = escort.status
    if (action === 'pause') newStatus = 'PAUSED'
    else if (action === 'activate' || action === 'resume') newStatus = 'ACTIVE'
    else return NextResponse.json({ ok: false, error: 'invalid_action' }, { status: 400 })

    await prisma.escortProfile.update({ where: { id: escort.id }, data: { status: newStatus } })
    return NextResponse.json({ ok: true, status: newStatus })
  } catch (e:any) {
    console.error('/api/escort/profile/status POST error:', e.message)
    try { captureServerException(e) } catch {}
    return NextResponse.json({ ok: false, error: 'server_error' }, { status: 500 })
  }
}
