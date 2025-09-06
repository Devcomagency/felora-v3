import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// POST /api/admin/kyc/update { id, status: 'PENDING'|'APPROVED'|'REJECTED', notes? }
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions as any)
    const role = (session as any)?.user?.role
    if (role !== 'ADMIN') return NextResponse.json({ error: 'not_authorized' }, { status: 403 })

    const body = await req.json().catch(() => ({}))
    const id = String(body?.id || '')
    const status = String(body?.status || '') as 'PENDING'|'APPROVED'|'REJECTED'
    const notes = typeof body?.notes === 'string' ? body.notes : undefined
    if (!id || !['PENDING','APPROVED','REJECTED'].includes(status)) {
      return NextResponse.json({ error: 'invalid_params' }, { status: 400 })
    }

    const updated = await prisma.kycSubmission.update({
      where: { id },
      data: { status: status as any, notes: notes ?? undefined }
    })

    return NextResponse.json({ ok: true, status: updated.status })
  } catch (e:any) {
    return NextResponse.json({ error: e?.message || 'server_error' }, { status: 500 })
  }
}

