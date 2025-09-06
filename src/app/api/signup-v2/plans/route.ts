import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Ensure the 3 plans exist with correct labels/prices (idempotent upsert)
    const desired = [
      { code:'WEEK',    name:'1 semaine', interval:'WEEK' as any,    priceCents: 8900,  popular: false, active: true },
      { code:'MONTH',   name:'1 mois',    interval:'MONTH' as any,   priceCents: 19900, popular: true,  active: true },
      { code:'QUARTER', name:'3 mois',    interval:'QUARTER' as any, priceCents: 39900, popular: false, active: true },
    ]

    for (const d of desired) {
      const existing = await prisma.planV2.findUnique({ where: { code: d.code } })
      if (!existing) {
        await prisma.planV2.create({ data: d })
      } else {
        // Update if drifted (name, interval, priceCents, active, popular)
        const needsUpdate = existing.name !== d.name
          || existing.interval !== d.interval
          || existing.priceCents !== d.priceCents
          || existing.active !== d.active
          || existing.popular !== d.popular
        if (needsUpdate) {
          await prisma.planV2.update({ where: { code: d.code }, data: { name: d.name, interval: d.interval, priceCents: d.priceCents, active: d.active, popular: d.popular } })
        }
      }
    }

    // Return only these 3 plans in the specified order
    const itemsAll = await prisma.planV2.findMany({ where: { active: true, code: { in: ['WEEK','MONTH','QUARTER'] } } })
    const order = new Map<string, number>([['WEEK',0],['MONTH',1],['QUARTER',2]])
    const items = itemsAll.sort((a,b)=> (order.get(a.code) ?? 99) - (order.get(b.code) ?? 99))
    return NextResponse.json({ items })
  } catch (e:any) {
    return NextResponse.json({ error: e?.message || 'error' }, { status: 500 })
  }
}
