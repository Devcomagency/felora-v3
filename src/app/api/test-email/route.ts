import { NextRequest, NextResponse } from 'next/server'
import { sendEmail, emailTemplates } from '@/lib/email'

export async function GET(req: NextRequest) {
  try {
    console.log('🧪 Test d\'envoi d\'email...')
    
    // Vérifier les variables d'environnement
    console.log('📧 SMTP Config:')
    console.log('- SMTP_HOST:', process.env.SMTP_HOST)
    console.log('- SMTP_PORT:', process.env.SMTP_PORT) 
    console.log('- SMTP_USER:', process.env.SMTP_USER)
    console.log('- SMTP_PASS:', process.env.SMTP_PASS ? 'SET' : 'NOT SET')
    console.log('- SMTP_FROM:', process.env.SMTP_FROM)
    
    // Test d'envoi
    const welcomeEmail = emailTemplates.welcome('Test User')
    const result = await sendEmail({
      to: 'n.a.hasnaoui@gmail.com', // Email de test
      subject: `[TEST] ${welcomeEmail.subject}`,
      html: welcomeEmail.html
    })
    
    console.log('📨 Résultat envoi email:', result)
    
    return NextResponse.json({
      success: result.success,
      message: result.success ? 'Email envoyé avec succès!' : 'Erreur envoi email',
      error: result.error || null,
      messageId: result.messageId || null,
      config: {
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        user: process.env.SMTP_USER,
        passSet: !!process.env.SMTP_PASS,
        from: process.env.SMTP_FROM
      }
    })
    
  } catch (error: any) {
    console.error('💥 Exception test email:', error)
    return NextResponse.json({
      success: false,
      message: 'Exception lors du test',
      error: error.message
    }, { status: 500 })
  }
}