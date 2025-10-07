/**
 * Service de génération de signed URLs pour sécuriser les médias
 * Les URLs signées expirent après un certain temps pour éviter le hotlinking
 */

import { createHmac } from 'crypto'

// Clé secrète pour signer les URLs (à définir dans .env)
const SECRET_KEY = process.env.MEDIA_SIGNATURE_SECRET || 'felora-default-secret-key-change-in-production'

// Durée de validité des URLs signées (en secondes)
const DEFAULT_EXPIRY = 3600 // 1 heure

/**
 * Génère une signature HMAC pour une URL
 */
function generateSignature(url: string, expiry: number): string {
  const message = `${url}:${expiry}`
  return createHmac('sha256', SECRET_KEY)
    .update(message)
    .digest('base64url')
}

/**
 * Vérifie si une signature est valide
 */
export function verifySignature(url: string, expiry: number, signature: string): boolean {
  // Vérifier l'expiration
  if (Date.now() > expiry * 1000) {
    return false
  }

  // Vérifier la signature
  const expectedSignature = generateSignature(url, expiry)
  return signature === expectedSignature
}

/**
 * Génère une URL signée pour un média
 */
export function generateSignedUrl(
  originalUrl: string,
  options: {
    expirySeconds?: number
    userId?: string
  } = {}
): string {
  const { expirySeconds = DEFAULT_EXPIRY, userId } = options

  // Calculer le timestamp d'expiration
  const expiry = Math.floor(Date.now() / 1000) + expirySeconds

  // Générer la signature
  const signature = generateSignature(originalUrl, expiry)

  // Construire l'URL signée
  const url = new URL(originalUrl, process.env.NEXTAUTH_URL || 'http://localhost:3000')
  url.searchParams.set('signature', signature)
  url.searchParams.set('expiry', expiry.toString())

  if (userId) {
    url.searchParams.set('userId', userId)
  }

  return url.toString()
}

/**
 * Vérifie et extrait l'URL originale d'une URL signée
 */
export function verifySignedUrl(signedUrl: string): {
  valid: boolean
  originalUrl?: string
  error?: string
} {
  try {
    const url = new URL(signedUrl)
    const signature = url.searchParams.get('signature')
    const expiryStr = url.searchParams.get('expiry')

    if (!signature || !expiryStr) {
      return { valid: false, error: 'Missing signature or expiry' }
    }

    const expiry = parseInt(expiryStr, 10)

    // Reconstruire l'URL originale (sans les paramètres de signature)
    url.searchParams.delete('signature')
    url.searchParams.delete('expiry')
    url.searchParams.delete('userId')
    const originalUrl = url.toString()

    // Vérifier la signature
    const isValid = verifySignature(originalUrl, expiry, signature)

    if (!isValid) {
      return { valid: false, error: 'Invalid signature or expired' }
    }

    return { valid: true, originalUrl }
  } catch (error) {
    return { valid: false, error: 'Invalid URL format' }
  }
}

/**
 * Middleware pour vérifier les URLs signées dans les routes API
 */
export function requireSignedUrl(url: string): boolean {
  const result = verifySignedUrl(url)
  return result.valid
}
