import nodemailer from 'nodemailer'

// Configuration du transporteur SMTP
const transporter = nodemailer.createTransporter({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_PORT === '465', // true pour 465, false pour les autres ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  tls: {
    rejectUnauthorized: false // Pour éviter les erreurs SSL en développement
  }
})

export interface EmailOptions {
  to: string
  subject: string
  text?: string
  html?: string
}

export async function sendEmail({ to, subject, text, html }: EmailOptions) {
  try {
    // Vérification de la configuration
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
      throw new Error('Configuration SMTP manquante dans les variables d\'environnement')
    }

    const mailOptions = {
      from: process.env.SMTP_FROM || 'Felora <no-reply@felora.local>',
      to,
      subject,
      text,
      html: html || text
    }

    const info = await transporter.sendMail(mailOptions)
    
    console.log('✅ Email envoyé avec succès:', {
      messageId: info.messageId,
      to: to,
      subject: subject
    })
    
    return {
      success: true,
      messageId: info.messageId,
      preview: nodemailer.getTestMessageUrl(info) // URL Mailtrap si disponible
    }
  } catch (error) {
    console.error('❌ Erreur envoi email:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    }
  }
}

// Templates d'emails prédéfinis
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
            <a href="https://felora.local" style="background: linear-gradient(135deg, #FF6B9D, #B794F6); color: white; padding: 15px 30px; text-decoration: none; border-radius: 50px; font-weight: bold; display: inline-block;">
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

  passwordReset: (resetLink: string) => ({
    subject: '🔑 Réinitialisation de mot de passe Felora',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0D0D0D; padding: 30px; border-radius: 16px; border: 1px solid #4FD1C7;">
        <h1 style="color: #4FD1C7; text-align: center; margin-bottom: 30px;">
          🔑 Réinitialisation de mot de passe
        </h1>
        <p style="color: #F8F9FA; line-height: 1.6; text-align: center;">
          Tu as demandé à réinitialiser ton mot de passe Felora.
        </p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetLink}" style="background: linear-gradient(135deg, #4FD1C7, #B794F6); color: white; padding: 15px 30px; text-decoration: none; border-radius: 50px; font-weight: bold; display: inline-block;">
            🔄 Changer mon mot de passe
          </a>
        </div>
        <p style="color: #ccc; font-size: 14px; text-align: center;">
          Ce lien expire dans 1 heure.<br/>
          Si tu n'as pas fait cette demande, ignore cet email.
        </p>
      </div>
    `
  }),

  giftReceived: (senderName: string, giftName: string, giftEmoji: string) => ({
    subject: `🎁 ${senderName} t'a envoyé un cadeau !`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #FFD700 0%, #FF6B9D 100%); padding: 20px; border-radius: 16px;">
        <div style="background: rgba(0,0,0,0.9); padding: 30px; border-radius: 12px; color: white; text-align: center;">
          <div style="font-size: 80px; margin-bottom: 20px;">
            ${giftEmoji}
          </div>
          <h1 style="color: #FFD700; margin-bottom: 20px;">
            Tu as reçu un cadeau ! 🎉
          </h1>
          <p style="font-size: 20px; margin-bottom: 30px;">
            <strong>${senderName}</strong> t'a envoyé : <strong>${giftName}</strong>
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://felora.local/messages" style="background: linear-gradient(135deg, #FF6B9D, #FFD700); color: black; padding: 15px 30px; text-decoration: none; border-radius: 50px; font-weight: bold; display: inline-block;">
              💬 Voir les messages
            </a>
          </div>
        </div>
      </div>
    `
  })
}