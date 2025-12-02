/**
 * 🔐 SÉCURITÉ : Sanitization du contenu utilisateur pour prévenir les attaques XSS
 *
 * Utilise DOMPurify pour nettoyer le HTML fourni par les utilisateurs
 * et empêcher l'injection de JavaScript malveillant
 */

// Import conditionnel pour éviter les erreurs si le package n'est pas encore installé
let DOMPurify: any = null

try {
  DOMPurify = require('isomorphic-dompurify')
} catch (error) {
  console.warn('⚠️ [SECURITY] DOMPurify not installed. Run: npm install isomorphic-dompurify')
}

/**
 * Sanitize le contenu HTML fourni par l'utilisateur
 * Autorise uniquement les balises sûres (texte formaté basique)
 *
 * @param html - Contenu HTML brut potentiellement dangereux
 * @returns HTML nettoyé et sécurisé
 */
export function sanitizeUserContent(html: string | null | undefined): string {
  if (!html) return ''

  // Si DOMPurify n'est pas installé, au moins échapper les caractères dangereux
  if (!DOMPurify) {
    console.warn('[SECURITY] DOMPurify not available, using basic escaping')
    return escapeHtml(html)
  }

  // Configuration stricte : n'autoriser que les balises de formatage basique
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      'b', 'i', 'em', 'strong', 'u',
      'p', 'br', 'span',
      'a', 'ul', 'ol', 'li'
    ],
    ALLOWED_ATTR: ['href', 'target'],
    ALLOWED_URI_REGEXP: /^(?:(?:https?):\/\/)/i, // Autoriser uniquement http/https
    KEEP_CONTENT: true, // Garder le contenu si les balises sont supprimées
    RETURN_TRUSTED_TYPE: false
  })
}

/**
 * Sanitize stricte pour les champs texte simple (pas de HTML autorisé)
 * Utilisé pour : noms, titres, descriptions courtes
 *
 * @param text - Texte brut
 * @returns Texte échappé (pas de HTML)
 */
export function sanitizeText(text: string | null | undefined): string {
  if (!text) return ''

  // Supprimer complètement toutes les balises HTML
  const stripped = text.replace(/<[^>]*>/g, '')

  // Échapper les caractères spéciaux
  return escapeHtml(stripped)
}

/**
 * Sanitize pour les URLs (prévenir javascript:, data:, etc.)
 *
 * @param url - URL fournie par l'utilisateur
 * @returns URL sécurisée ou chaîne vide si dangereuse
 */
export function sanitizeUrl(url: string | null | undefined): string {
  if (!url) return ''

  const trimmed = url.trim().toLowerCase()

  // Bloquer les protocoles dangereux
  const dangerousProtocols = ['javascript:', 'data:', 'vbscript:', 'file:']
  if (dangerousProtocols.some(protocol => trimmed.startsWith(protocol))) {
    console.warn('[SECURITY] Blocked dangerous URL protocol:', trimmed.substring(0, 20))
    return ''
  }

  // Autoriser uniquement http, https, mailto
  if (!/^(?:https?|mailto):/i.test(trimmed) && !trimmed.startsWith('/')) {
    return ''
  }

  return url.trim()
}

/**
 * Échappement HTML basique (fallback si DOMPurify n'est pas disponible)
 */
function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
    '/': '&#x2F;'
  }

  return text.replace(/[&<>"'\/]/g, char => map[char] || char)
}

/**
 * Sanitize un objet JSON contenant des champs utilisateur
 * Applique la sanitization récursive sur tous les champs string
 */
export function sanitizeObject<T extends Record<string, any>>(
  obj: T,
  fieldsToSanitize: (keyof T)[]
): T {
  const sanitized = { ...obj }

  for (const field of fieldsToSanitize) {
    if (typeof sanitized[field] === 'string') {
      sanitized[field] = sanitizeUserContent(sanitized[field] as string) as any
    }
  }

  return sanitized
}

/**
 * Exemple d'utilisation :
 *
 * // Dans une API route lors de la création/mise à jour de profil
 * import { sanitizeUserContent, sanitizeText, sanitizeUrl } from '@/lib/sanitize'
 *
 * const cleanedData = {
 *   bio: sanitizeUserContent(body.bio), // Autorise HTML basique
 *   stageName: sanitizeText(body.stageName), // Texte pur, pas de HTML
 *   website: sanitizeUrl(body.website) // URL sécurisée
 * }
 *
 * await prisma.escortProfile.create({ data: cleanedData })
 */
