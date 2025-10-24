/**
 * MIME Validator - Validation stricte des types MIME
 * Système de sécurité pour valider les types de fichiers
 */

export interface MimeValidationResult {
  isValid: boolean
  detectedType: string
  declaredType: string
  confidence: number
  error?: string
  isImage: boolean
  isVideo: boolean
  isAudio: boolean
}

export interface MimeConfig {
  allowedImageTypes: string[]
  allowedVideoTypes: string[]
  allowedAudioTypes: string[]
  maxFileSize: number
  enableMagicNumberCheck: boolean
  enableContentValidation: boolean
}

export class MimeValidator {
  private static instance: MimeValidator
  private config: MimeConfig

  // Magic numbers pour la validation
  private static readonly MAGIC_NUMBERS = {
    // Images
    'image/jpeg': [0xFF, 0xD8, 0xFF],
    'image/png': [0x89, 0x50, 0x4E, 0x47],
    'image/gif': [0x47, 0x49, 0x46, 0x38],
    'image/webp': [0x52, 0x49, 0x46, 0x46],
    'image/avif': [0x00, 0x00, 0x00, 0x20, 0x66, 0x74, 0x79, 0x70],
    
    // Vidéos
    'video/mp4': [0x00, 0x00, 0x00, 0x20, 0x66, 0x74, 0x79, 0x70],
    'video/webm': [0x1A, 0x45, 0xDF, 0xA3],
    'video/quicktime': [0x00, 0x00, 0x00, 0x14, 0x66, 0x74, 0x79, 0x70],
    
    // Audio
    'audio/mpeg': [0xFF, 0xFB],
    'audio/wav': [0x52, 0x49, 0x46, 0x46],
    'audio/ogg': [0x4F, 0x67, 0x67, 0x53]
  }

  private constructor() {
    this.config = {
      allowedImageTypes: [
        'image/jpeg',
        'image/jpg', 
        'image/png',
        'image/gif',
        'image/webp',
        'image/avif'
      ],
      allowedVideoTypes: [
        'video/mp4',
        'video/webm',
        'video/quicktime',
        'video/x-msvideo' // .avi
      ],
      allowedAudioTypes: [
        'audio/mpeg',
        'audio/wav',
        'audio/ogg',
        'audio/mp4'
      ],
      maxFileSize: 50 * 1024 * 1024, // 50MB
      enableMagicNumberCheck: true,
      enableContentValidation: true
    }
  }

  static getInstance(): MimeValidator {
    if (!MimeValidator.instance) {
      MimeValidator.instance = new MimeValidator()
    }
    return MimeValidator.instance
  }

  /**
   * Valide un fichier avec validation stricte
   */
  async validateFile(file: File, declaredType?: string): Promise<MimeValidationResult> {
    const result: MimeValidationResult = {
      isValid: false,
      detectedType: '',
      declaredType: declaredType || file.type,
      confidence: 0,
      isImage: false,
      isVideo: false,
      isAudio: false
    }

    try {
      // 1. Vérifier la taille du fichier
      if (file.size > this.config.maxFileSize) {
        result.error = `Fichier trop volumineux (${Math.round(file.size / 1024 / 1024)}MB > ${Math.round(this.config.maxFileSize / 1024 / 1024)}MB)`
        return result
      }

      // 2. Vérifier le type déclaré
      if (declaredType && !this.isAllowedType(declaredType)) {
        result.error = `Type MIME non autorisé: ${declaredType}`
        return result
      }

      // 3. Détecter le type réel via magic numbers
      if (this.config.enableMagicNumberCheck) {
        const detectedType = await this.detectMimeType(file)
        result.detectedType = detectedType
        result.confidence = this.calculateConfidence(detectedType, file)

        // Vérifier la cohérence entre type déclaré et détecté
        if (declaredType && detectedType !== declaredType) {
          result.error = `Incohérence de type MIME: déclaré ${declaredType}, détecté ${detectedType}`
          return result
        }
      }

      // 4. Déterminer la catégorie
      const finalType = result.detectedType || declaredType || file.type
      result.isImage = this.isImageType(finalType)
      result.isVideo = this.isVideoType(finalType)
      result.isAudio = this.isAudioType(finalType)

      // 5. Validation finale
      if (!this.isAllowedType(finalType)) {
        result.error = `Type de fichier non supporté: ${finalType}`
        return result
      }

      result.isValid = true
      return result

    } catch (error) {
      result.error = `Erreur de validation: ${error}`
      return result
    }
  }

  /**
   * Détecte le type MIME réel via magic numbers
   */
  private async detectMimeType(file: File): Promise<string> {
    return new Promise((resolve) => {
      const reader = new FileReader()
      
      reader.onload = (e) => {
        const arrayBuffer = e.target?.result as ArrayBuffer
        const uint8Array = new Uint8Array(arrayBuffer)
        
        // Vérifier chaque magic number
        for (const [mimeType, magicNumbers] of Object.entries(MimeValidator.MAGIC_NUMBERS)) {
          if (this.checkMagicNumber(uint8Array, magicNumbers)) {
            resolve(mimeType)
            return
          }
        }
        
        // Type inconnu
        resolve('application/octet-stream')
      }
      
      reader.onerror = () => resolve('application/octet-stream')
      reader.readAsArrayBuffer(file.slice(0, 1024)) // Lire seulement les premiers 1KB
    })
  }

  /**
   * Vérifie un magic number
   */
  private checkMagicNumber(data: Uint8Array, magicNumbers: number[]): boolean {
    if (data.length < magicNumbers.length) return false
    
    for (let i = 0; i < magicNumbers.length; i++) {
      if (data[i] !== magicNumbers[i]) return false
    }
    
    return true
  }

  /**
   * Calcule la confiance de la détection
   */
  private calculateConfidence(detectedType: string, file: File): number {
    if (detectedType === 'application/octet-stream') return 0
    
    // Vérifier l'extension du fichier
    const extension = this.getFileExtension(file.name)
    const expectedExtensions = this.getExpectedExtensions(detectedType)
    
    if (expectedExtensions.includes(extension)) {
      return 0.9 // Haute confiance si extension correspond
    }
    
    return 0.7 // Confiance moyenne si seulement magic number
  }

  /**
   * Obtient l'extension d'un fichier
   */
  private getFileExtension(filename: string): string {
    return filename.split('.').pop()?.toLowerCase() || ''
  }

  /**
   * Obtient les extensions attendues pour un type MIME
   */
  private getExpectedExtensions(mimeType: string): string[] {
    const extensions: Record<string, string[]> = {
      'image/jpeg': ['jpg', 'jpeg'],
      'image/png': ['png'],
      'image/gif': ['gif'],
      'image/webp': ['webp'],
      'image/avif': ['avif'],
      'video/mp4': ['mp4'],
      'video/webm': ['webm'],
      'video/quicktime': ['mov', 'qt'],
      'audio/mpeg': ['mp3'],
      'audio/wav': ['wav'],
      'audio/ogg': ['ogg']
    }
    
    return extensions[mimeType] || []
  }

  /**
   * Vérifie si un type est autorisé
   */
  private isAllowedType(mimeType: string): boolean {
    return [
      ...this.config.allowedImageTypes,
      ...this.config.allowedVideoTypes,
      ...this.config.allowedAudioTypes
    ].includes(mimeType)
  }

  /**
   * Vérifie si c'est un type d'image
   */
  private isImageType(mimeType: string): boolean {
    return this.config.allowedImageTypes.includes(mimeType)
  }

  /**
   * Vérifie si c'est un type de vidéo
   */
  private isVideoType(mimeType: string): boolean {
    return this.config.allowedVideoTypes.includes(mimeType)
  }

  /**
   * Vérifie si c'est un type d'audio
   */
  private isAudioType(mimeType: string): boolean {
    return this.config.allowedAudioTypes.includes(mimeType)
  }

  /**
   * Met à jour la configuration
   */
  updateConfig(config: Partial<MimeConfig>): void {
    this.config = { ...this.config, ...config }
  }

  /**
   * Obtient la configuration actuelle
   */
  getConfig(): MimeConfig {
    return { ...this.config }
  }

  /**
   * Obtient les types autorisés
   */
  getAllowedTypes(): string[] {
    return [
      ...this.config.allowedImageTypes,
      ...this.config.allowedVideoTypes,
      ...this.config.allowedAudioTypes
    ]
  }
}

// Instance singleton
export const mimeValidator = MimeValidator.getInstance()

// Fonctions utilitaires
export const validateFileMime = (file: File, declaredType?: string) => {
  return mimeValidator.validateFile(file, declaredType)
}

export const isAllowedMimeType = (mimeType: string): boolean => {
  return mimeValidator['isAllowedType'](mimeType)
}
