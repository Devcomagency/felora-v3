import { NextResponse } from 'next/server'

// Simple in-memory promo store for dev
type Promo = { code: string; type: 'percent'|'amount'; value: number; applicablePlans?: string[]; expiresAt?: number }
const g = globalThis as any
if (!g.__felora_promos) {
  const now = Date.now()
  g.__felora_promos = new Map<string, Promo>([
    ['PROMO50',   { code:'PROMO50',   type:'percent', value:50, applicablePlans:['MONTH','QUARTER','YEAR'], expiresAt: now + 30*24*3600e3 }],
    ['WELCOME10', { code:'WELCOME10', type:'amount',  value:1000 /* 10 CHF */, expiresAt: now + 30*24*3600e3 }],
    ['TRIALFREE', { code:'TRIALFREE', type:'percent', value:100, applicablePlans:['TRIAL'], expiresAt: now + 7*24*3600e3 }],
  ])
}
const PROMOS: Map<string, Promo> = g.__felora_promos

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(()=>({}))
    const code = String(body?.code || '').trim().toUpperCase()
    const planCode = body?.planCode ? String(body.planCode).trim().toUpperCase() : undefined
    if (!code) return NextResponse.json({ error: 'missing_code' }, { status: 400 })

    const promo = PROMOS.get(code)
    if (!promo) return NextResponse.json({ error: 'invalid_code' }, { status: 400 })
    if (promo.expiresAt && Date.now() > promo.expiresAt) return NextResponse.json({ error: 'expired_code' }, { status: 400 })

    // If planCode provided, check applicability and compute message
    let message = ''
    if (planCode && promo.applicablePlans && !promo.applicablePlans.includes(planCode)) {
      return NextResponse.json({ error: 'code_not_applicable' }, { status: 400 })
    }
    message = promo.type === 'percent' ? `−${promo.value}% appliqué` : `−${(promo.value/100).toFixed(2)} CHF appliqué`

    return NextResponse.json({ success: true, promo: { code: promo.code, type: promo.type, value: promo.value, applicablePlans: promo.applicablePlans || null }, message })
  } catch (e) {
    return NextResponse.json({ error: 'server_error' }, { status: 500 })
  }
}

