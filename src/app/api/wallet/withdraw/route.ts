import { NextRequest, NextResponse } from 'next/server'

// POST /api/wallet/withdraw { amount }
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}))
  const amount = Number(body?.amount || 0)
  if (!amount || amount < 50) {
    return NextResponse.json({ ok: false, error: 'Montant minimum: 50 ♦' }, { status: 200 })
  }
  const fee = Math.max(2, Math.round(amount * 0.02))
  const etaDays = 3
  return NextResponse.json({ ok: true, amount, fee, etaDays, status: 'pending' })
}

