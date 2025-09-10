// Lightweight mail helper with graceful fallback when no SMTP is configured
export async function sendMail(to: string, subject: string, html: string, text?: string) {
  try {
    // Try dynamic import to avoid hard dependency when not installed
    const nodemailer = await import('nodemailer').catch(() => null)
    const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM } = process.env as any
    if (!nodemailer || !SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS || !SMTP_FROM) {
      console.log('[MAIL:DEV]', { to, subject, text, html: html?.slice(0, 200) + '...' })
      return { ok: true, dev: true }
    }

    const transporter = (nodemailer as any).createTransport({
      host: SMTP_HOST,
      port: Number(SMTP_PORT),
      secure: Number(SMTP_PORT) === 465,
      auth: { user: SMTP_USER, pass: SMTP_PASS },
      tls: {
        rejectUnauthorized: false
      }
    })

    const info = await transporter.sendMail({
      from: SMTP_FROM,
      to,
      subject,
      text: text || html?.replace(/<[^>]+>/g, ''),
      html
    })
    return { ok: true, id: info?.messageId }
  } catch (e) {
    console.error('[MAIL:ERROR]', e)
    return { ok: false, error: (e as any)?.message || 'mail_error' }
  }
}