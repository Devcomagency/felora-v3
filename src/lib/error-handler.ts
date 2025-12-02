import { NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'

/**
 * 🔐 SÉCURITÉ : Handler d'erreurs sécurisé pour les API routes
 *
 * Empêche la fuite d'informations sensibles dans les messages d'erreur
 * en production (stack traces, noms de tables, requêtes SQL, etc.)
 */

interface ErrorHandlerOptions {
  /**
   * Contexte de l'erreur pour les logs internes
   */
  context?: string

  /**
   * Statut HTTP par défaut si non déterminable
   */
  defaultStatus?: number

  /**
   * Exposer les détails en développement
   */
  exposeDetails?: boolean
}

/**
 * Gère les erreurs de manière sécurisée et retourne une réponse NextResponse
 */
export function handleApiError(
  error: unknown,
  options: ErrorHandlerOptions = {}
): NextResponse {
  const {
    context = 'API',
    defaultStatus = 500,
    exposeDetails = process.env.NODE_ENV === 'development'
  } = options

  // Logger l'erreur complète côté serveur (pour debugging)
  console.error(`[${context}] Error:`, error)

  // Déterminer le type d'erreur et la réponse appropriée
  let status = defaultStatus
  let userMessage = 'Une erreur est survenue'
  let errorCode = 'INTERNAL_ERROR'

  // Erreurs Prisma
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case 'P2002':
        status = 409
        userMessage = 'Cette ressource existe déjà'
        errorCode = 'DUPLICATE_ENTRY'
        break
      case 'P2025':
        status = 404
        userMessage = 'Ressource non trouvée'
        errorCode = 'NOT_FOUND'
        break
      case 'P2003':
        status = 400
        userMessage = 'Données invalides ou référence manquante'
        errorCode = 'INVALID_REFERENCE'
        break
      default:
        status = 500
        userMessage = 'Erreur de base de données'
        errorCode = 'DATABASE_ERROR'
    }
  }
  // Erreurs de validation Prisma
  else if (error instanceof Prisma.PrismaClientValidationError) {
    status = 400
    userMessage = 'Données invalides'
    errorCode = 'VALIDATION_ERROR'
  }
  // Erreurs standard JavaScript
  else if (error instanceof Error) {
    // Ne jamais exposer le message d'erreur complet en production
    if (exposeDetails) {
      userMessage = error.message
    }

    // Détecter certains types d'erreurs courantes
    if (error.message.includes('ECONNREFUSED')) {
      status = 503
      userMessage = 'Service temporairement indisponible'
      errorCode = 'SERVICE_UNAVAILABLE'
    } else if (error.message.includes('ETIMEDOUT')) {
      status = 504
      userMessage = 'Délai d\'attente dépassé'
      errorCode = 'TIMEOUT'
    } else if (error.message.includes('ENOTFOUND')) {
      status = 503
      userMessage = 'Service externe inaccessible'
      errorCode = 'EXTERNAL_SERVICE_ERROR'
    }
  }

  // Construire la réponse
  const response: any = {
    success: false,
    error: userMessage,
    code: errorCode
  }

  // En développement, ajouter des détails supplémentaires
  if (exposeDetails && error instanceof Error) {
    response.details = {
      message: error.message,
      stack: error.stack?.split('\n').slice(0, 5) // Limiter la stack trace
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      response.details.prismaCode = error.code
      response.details.meta = error.meta
    }
  }

  return NextResponse.json(response, { status })
}

/**
 * Messages d'erreur sécurisés pour différents cas d'usage
 */
export const SecureErrorMessages = {
  // Auth
  UNAUTHORIZED: 'Authentification requise',
  FORBIDDEN: 'Accès interdit',
  INVALID_CREDENTIALS: 'Identifiants incorrects',
  SESSION_EXPIRED: 'Session expirée, veuillez vous reconnecter',

  // Validation
  INVALID_INPUT: 'Données invalides',
  MISSING_REQUIRED_FIELDS: 'Champs obligatoires manquants',
  INVALID_FORMAT: 'Format de données invalide',

  // Resources
  NOT_FOUND: 'Ressource non trouvée',
  ALREADY_EXISTS: 'Cette ressource existe déjà',
  CONFLICT: 'Conflit avec une ressource existante',

  // Operations
  OPERATION_FAILED: 'Opération échouée',
  UPDATE_FAILED: 'Mise à jour échouée',
  DELETE_FAILED: 'Suppression échouée',
  CREATE_FAILED: 'Création échouée',

  // Rate limiting
  RATE_LIMIT_EXCEEDED: 'Trop de requêtes, veuillez patienter',

  // Upload
  FILE_TOO_LARGE: 'Fichier trop volumineux',
  INVALID_FILE_TYPE: 'Type de fichier non autorisé',
  UPLOAD_FAILED: 'Échec de l\'upload',

  // External services
  EXTERNAL_SERVICE_ERROR: 'Service externe temporairement indisponible',
  PAYMENT_FAILED: 'Paiement échoué',

  // Generic
  INTERNAL_ERROR: 'Une erreur est survenue',
  MAINTENANCE: 'Service en maintenance'
} as const

/**
 * Créer une erreur API standardisée
 */
export function createApiError(
  message: string,
  status: number = 400,
  code?: string
): NextResponse {
  return NextResponse.json({
    success: false,
    error: message,
    code: code || 'API_ERROR'
  }, { status })
}

/**
 * Exemple d'utilisation dans une API route :
 *
 * export async function POST(req: NextRequest) {
 *   try {
 *     // ... votre code
 *     return NextResponse.json({ success: true, data })
 *   } catch (error) {
 *     return handleApiError(error, { context: 'POST /api/example' })
 *   }
 * }
 */
