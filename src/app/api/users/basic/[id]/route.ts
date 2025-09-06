import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params
    const user = await prisma.user.findUnique({ where: { id }, select: { id: true, name: true, role: true } })
    if (!user) return NextResponse.json({ error: 'not_found' }, { status: 404 })
    let display = user.name || ''
    if (user.role === 'ESCORT' as any) {
      try {
        const ep = await prisma.escortProfile.findUnique({ where: { userId: id }, select: { stageName: true } })
        if (ep?.stageName) display = ep.stageName
      } catch {}
    }
    if (!display) display = 'Utilisateur'
    return NextResponse.json({ id: user.id, name: display, role: user.role })
  } catch (e:any) {
    return NextResponse.json({ error: 'server_error' }, { status: 500 })
  }
}

