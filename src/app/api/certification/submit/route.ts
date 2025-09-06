import { NextResponse } from 'next/server'

// In-memory submissions for dev
const g = globalThis as any
if (!g.__felora_cert_submissions) g.__felora_cert_submissions = [] as any[]

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(()=>({}))
    const userId = String(body?.userId || '').trim()
    const faceUrl = String(body?.faceUrl || '').trim()
    const profileUrl = String(body?.profileUrl || '').trim()
    const bodyFrontUrl = String(body?.bodyFrontUrl || '').trim()
    const bodyBackUrl = String(body?.bodyBackUrl || '').trim()
    if (!faceUrl || !profileUrl || !bodyFrontUrl || !bodyBackUrl) {
      return NextResponse.json({ error: 'missing_photos' }, { status: 400 })
    }
    // userId optional in dev; in prod, require auth/userId
    g.__felora_cert_submissions.push({
      userId: userId || null,
      faceUrl, profileUrl, bodyFrontUrl, bodyBackUrl,
      createdAt: new Date().toISOString()
    })
    if (process.env.NODE_ENV !== 'production') {
      console.log('[CERT] submission', { userId, faceUrl, profileUrl, bodyFrontUrl, bodyBackUrl })
    }
    return NextResponse.json({ ok: true })
  } catch (e:any) {
    return NextResponse.json({ error: e?.message || 'server_error' }, { status: 500 })
  }
}