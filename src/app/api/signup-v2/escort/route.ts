import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { escortPreSignupLite } from '@/components/signup-v2/validation'
import { rateLimit, getClientIp } from '@/lib/rateLimit'
import { sendEmailResend, emailTemplates } from '@/lib/resend'

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req as any)
    const rl = rateLimit(`signup:escort:${ip}`, 10 * 60_000, 5)
    if (!rl.ok) return NextResponse.json({ error: 'too_many_requests' }, { status: 429 })
    const body = await req.json()
    if (body?.hp) return NextResponse.json({ error: 'invalid' }, { status: 200 })
    const parsed = escortPreSignupLite.safeParse(body)
    if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message || 'invalid' }, { status: 400 })
    const { email, phoneE164, handle, birthDate, password } = parsed.data

    // Note: La vérification d'email est maintenant gérée côté client via le système en mémoire
    // L'utilisateur doit avoir vérifié son email avant d'arriver ici

    const existingUser = await prisma.user.findUnique({ where: { email } })
    if (existingUser) return NextResponse.json({ error: 'Email déjà utilisé' }, { status: 200 })

    if (handle) {
      const existingHandle = await prisma.escortProfileV2.findUnique({ where: { handle } })
      if (existingHandle) return NextResponse.json({ error: 'Handle déjà pris' }, { status: 400 })
    }

    const passwordHash = await bcrypt.hash(password, 10)
    const user = await prisma.user.create({ data: { email, phoneE164, passwordHash, role: 'ESCORT' as any } })
    if (handle && birthDate) {
      await prisma.escortProfileV2.create({ data: { userId: user.id, handle, birthDate: new Date(birthDate) } })
    }
    await prisma.kycSubmission.create({ data: { userId: user.id, role: 'ESCORT' as any, status: 'PENDING' as any } })

    // Envoyer l'email de bienvenue à l'escorte
    try {
      const welcomeEmail = emailTemplates.welcome(handle || email.split('@')[0])
      const emailResult = await sendEmailResend({
        to: email,
        subject: welcomeEmail.subject,
        html: welcomeEmail.html
      })
      
      if (!emailResult.success) {
        console.error('❌ Erreur envoi email de bienvenue escorte:', emailResult.error)
        // On ne fait pas échouer l'inscription si l'email échoue
      } else {
        console.log('✅ Email de bienvenue escorte envoyé:', emailResult.messageId)
      }
    } catch (emailError) {
      console.error('❌ Exception envoi email bienvenue escorte:', emailError)
      // On continue même si l'email échoue
    }

    return NextResponse.json({ ok: true, userId: user.id, next: '/profile-test-signup/escort?step=2' })
  } catch (e:any) {
    return NextResponse.json({ error: e?.message || 'server_error' }, { status: 500 })
  }
}
