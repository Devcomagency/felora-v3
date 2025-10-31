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
    const session = await getServerSession(authOptions)
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
        ville: true, // Include both city fields
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
    const session = await getServerSession(authOptions)
    console.log('🔐 [API STATUS POST] Session:', session ? 'exists' : 'null')
    const userId = (session as any)?.user?.id as string | undefined
    console.log('🔐 [API STATUS POST] UserID:', userId)
    if (!userId) {
      console.error('❌ [API STATUS POST] Unauthorized - no userId')
      return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 })
    }

    const body = await req.json().catch(() => ({}))
    console.log('📥 [API STATUS POST] Body:', body)
    const action = String(body?.action || '').toLowerCase()
    console.log('🎯 [API STATUS POST] Action:', action)

    const escort = await prisma.escortProfile.findUnique({ 
      where: { userId }, 
      select: { 
        id: true, 
        status: true,
        stageName: true,
        description: true,
        city: true,
        ville: true, // Include both city fields
        canton: true,
        rue: true, // New address fields
        numero: true,
        codePostal: true,
        workingArea: true, // Legacy address field
        languages: true,
        services: true,
        practices: true,
        photosCount: true,
        videosCount: true,
        hasProfilePhoto: true,
        rate1H: true,
      } 
    })
    if (!escort) return NextResponse.json({ ok: false, error: 'profile_not_found' }, { status: 404 })

    let newStatus: any = escort.status
    if (action === 'pause') {
      newStatus = 'PAUSED'
    } else if (action === 'activate' || action === 'resume') {
      // Validation according to patch pack - dual city/ville support
      const hasCity = Boolean(escort.ville || escort.city)
      const hasAddress = Boolean((escort.rue && escort.codePostal) || escort.workingArea)
      const hasLang = Boolean(escort.languages) // CSV ok
      const hasServices = Boolean(escort.services) // CSV ok  
      const hasRate = Boolean(escort.rate1H)
      const hasName = Boolean(escort.stageName)
      
      const totalChecks = 6 // adjust according to real criteria
      const passed = [hasCity, hasAddress, hasLang, hasServices, hasRate, hasName].filter(Boolean).length
      const completion = (passed / totalChecks) * 100
      
      if (completion < 80) {
        const missing = []
        if (!hasName) missing.push('Nom d\'artiste')
        if (!hasCity) missing.push('Ville')
        if (!hasAddress) missing.push('Adresse')
        if (!hasLang) missing.push('Langues')
        if (!hasServices) missing.push('Services')
        if (!hasRate) missing.push('Tarifs')
        
        console.log('❌ [API STATUS POST] Profil incomplet:', { completion: Math.round(completion), missing })
        
        return NextResponse.json({ 
          ok: false, 
          error: 'profile_incomplete',
          reason: 'INCOMPLETE',
          completion: Math.round(completion),
          missing: missing,
          missingFields: missing
        }, { status: 400 })
      }
      newStatus = 'ACTIVE'
    } else {
      return NextResponse.json({ ok: false, error: 'invalid_action' }, { status: 400 })
    }

    await prisma.escortProfile.update({ where: { id: escort.id }, data: { status: newStatus } })
    console.log('✅ [API STATUS POST] Status updated to:', newStatus)
    return NextResponse.json({ ok: true, status: newStatus })
  } catch (e:any) {
    console.error('❌ [API STATUS POST] Error:', e.message, e.stack)
    try { captureServerException(e) } catch {}
    return NextResponse.json({ ok: false, error: 'server_error' }, { status: 500 })
  }
}
