import { Resend } from 'resend'

// Lazy, safe Resend initialization to avoid build-time crashes
let _resend: Resend | null = null
function getResend(): Resend | null {
  try {
    if (_resend) return _resend
    const key = process.env.RESEND_API_KEY
    if (!key) return null
    _resend = new Resend(key)
    return _resend
  } catch {
    return null
  }
}

export interface EmailOptions {
  to: string
  subject: string
  text?: string
  html?: string
}

export async function sendEmailResend({ to, subject, text, html }: EmailOptions) {
  try {
    const resend = getResend()
    if (!resend) {
      // Graceful behavior: no throw, but indicate failure so caller can fallback (SMTP/dev)
      console.log('[RESEND:SKIP] API key missing — cannot send via Resend', { to, subject })
      return { success: false, messageId: undefined, provider: 'resend' as const, error: 'missing_api_key' as any }
    }

    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM || 'Felora <no-reply@felora.com>',
      to: [to],
      subject,
      html: html || text,
      text: text
    })

    if (error) {
      throw new Error(`Resend error: ${error.message}`)
    }
    
    console.log('✅ Email envoyé avec succès via Resend:', {
      id: data?.id,
      to: to,
      subject: subject
    })
    
    return {
      success: true,
      messageId: data?.id,
      provider: 'resend'
    }
  } catch (error) {
    console.error('❌ Erreur envoi email Resend:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue',
      provider: 'resend'
    }
  }
}

// Templates d'emails prédéfinis (même que email.ts)
export const emailTemplates = {
  welcome: (userName: string) => ({
    subject: '🎉 Bienvenue sur Felora !',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #FF6B9D 0%, #B794F6 50%, #4FD1C7 100%); padding: 20px; border-radius: 16px;">
        <div style="background: rgba(0,0,0,0.8); padding: 30px; border-radius: 12px; color: white;">
          <h1 style="color: #FF6B9D; text-align: center; margin-bottom: 30px;">
            ✨ Bienvenue sur Felora ! ✨
          </h1>
          <p style="font-size: 18px; line-height: 1.6;">
            Salut <strong>${userName}</strong> ! 👋
          </p>
          <p style="line-height: 1.6;">
            Ton compte Felora est maintenant activé ! Tu peux dès maintenant :
          </p>
          <ul style="line-height: 2; font-size: 16px;">
            <li>🔍 Découvrir les profils vérifiés</li>
            <li>💬 Chatter de manière sécurisée (E2EE)</li>
            <li>🎁 Envoyer des cadeaux virtuels</li>
            <li>📍 Explorer la carte interactive</li>
          </ul>
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://felora.com" style="background: linear-gradient(135deg, #FF6B9D, #B794F6); color: white; padding: 15px 30px; text-decoration: none; border-radius: 50px; font-weight: bold; display: inline-block;">
              🚀 Commencer l'exploration
            </a>
          </div>
          <p style="font-size: 14px; color: #ccc; text-align: center; margin-top: 30px;">
            Felora - Rencontres premium en Suisse 🇨🇭
          </p>
        </div>
      </div>
    `
  }),

  verification: (code: string) => ({
    subject: '🔐 Code de vérification Felora',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; background: #0D0D0D; padding: 30px; border-radius: 16px; border: 1px solid #FF6B9D;">
        <h1 style="color: #FF6B9D; text-align: center; margin-bottom: 30px;">
          🔐 Code de vérification
        </h1>
        <div style="background: rgba(255, 107, 157, 0.1); padding: 20px; border-radius: 12px; text-align: center; margin: 30px 0;">
          <div style="font-size: 36px; font-weight: bold; color: #FF6B9D; letter-spacing: 8px; font-family: monospace;">
            ${code}
          </div>
        </div>
        <p style="color: #F8F9FA; text-align: center; line-height: 1.6;">
          Ce code expire dans <strong>10 minutes</strong>
        </p>
        <p style="color: #ccc; font-size: 14px; text-align: center; margin-top: 30px;">
          Si tu n'as pas demandé ce code, ignore cet email.
        </p>
      </div>
    `
  }),

  notification: (title: string, message: string, link?: string | null) => {
    // Déterminer l'icône basée sur le titre ou le message
    let icon = '📢'
    let color = '#4FD1C7'

    if (title.toLowerCase().includes('alert') || title.toLowerCase().includes('attention')) {
      icon = '⚠️'
      color = '#FFD700'
    } else if (title.toLowerCase().includes('error') || title.toLowerCase().includes('erreur')) {
      icon = '❌'
      color = '#FF4444'
    } else if (title.toLowerCase().includes('success') || title.toLowerCase().includes('succès')) {
      icon = '✅'
      color = '#4FD1C7'
    } else if (title.toLowerCase().includes('info') || title.toLowerCase().includes('information')) {
      icon = 'ℹ️'
      color = '#B794F6'
    } else if (title.toLowerCase().includes('message')) {
      icon = '💬'
      color = '#06B6D4'
    }

    return {
      subject: `${icon} ${title}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0D0D0D; padding: 30px; border-radius: 16px; border: 1px solid ${color};">
          <div style="text-align: center; margin-bottom: 20px;">
            <div style="font-size: 60px; margin-bottom: 10px;">
              ${icon}
            </div>
            <h1 style="color: ${color}; margin: 0; font-size: 24px;">
              ${title}
            </h1>
          </div>
          <div style="background: rgba(255, 255, 255, 0.05); padding: 20px; border-radius: 12px; margin: 20px 0;">
            <p style="color: #F8F9FA; line-height: 1.6; margin: 0; white-space: pre-line;">
              ${message}
            </p>
          </div>
          ${link ? `
          <div style="text-align: center; margin: 30px 0;">
            <a href="${link}" style="background: linear-gradient(135deg, ${color}, #FF6B9D); color: white; padding: 15px 30px; text-decoration: none; border-radius: 50px; font-weight: bold; display: inline-block;">
              📱 Voir sur Felora
            </a>
          </div>
          ` : ''}
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid rgba(255, 255, 255, 0.1);">
            <p style="color: #888; font-size: 12px; text-align: center; margin: 0;">
              Felora - Plateforme premium de rencontres en Suisse 🇨🇭<br/>
              <a href="https://felora.ch/settings" style="color: #4FD1C7; text-decoration: none;">Gérer mes notifications</a>
            </p>
          </div>
        </div>
      `
    }
  }
}
