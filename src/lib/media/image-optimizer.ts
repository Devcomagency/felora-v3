/**
 * Image Optimizer - Compression et optimisation des images
 * Système de compression automatique pour améliorer les performances
 */

export interface ImageOptimizationConfig {
  maxWidth: number
  maxHeight: number
  quality: number
  format: 'jpeg' | 'webp' | 'avif'
  enableCompression: boolean
}

export interface OptimizedImage {
  originalSize: number
  optimizedSize: number
  compressionRatio: number
  dataUrl: string
  width: number
  height: number
}

export class ImageOptimizer {
  private static instance: ImageOptimizer
  private config: ImageOptimizationConfig

  private constructor() {
    this.config = {
      maxWidth: 1920,
      maxHeight: 1080,
      quality: 0.8,
      format: 'webp',
      enableCompression: true
    }
  }

  static getInstance(): ImageOptimizer {
    if (!ImageOptimizer.instance) {
      ImageOptimizer.instance = new ImageOptimizer()
    }
    return ImageOptimizer.instance
  }

  /**
   * Optimise une image (côté client)
   */
  async optimizeImage(file: File, config?: Partial<ImageOptimizationConfig>): Promise<OptimizedImage> {
    const finalConfig = { ...this.config, ...config }
    
    if (!finalConfig.enableCompression) {
      return this.createUnoptimizedImage(file)
    }

    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      const img = new Image()

      img.onload = () => {
        try {
          // Calculer les nouvelles dimensions
          const { width, height } = this.calculateDimensions(
            img.width,
            img.height,
            finalConfig.maxWidth,
            finalConfig.maxHeight
          )

          // Configurer le canvas
          canvas.width = width
          canvas.height = height

          // Dessiner l'image redimensionnée
          ctx?.drawImage(img, 0, 0, width, height)

          // Convertir en format optimisé
          const dataUrl = canvas.toDataURL(
            `image/${finalConfig.format}`,
            finalConfig.quality
          )

          const originalSize = file.size
          const optimizedSize = this.estimateDataUrlSize(dataUrl)
          const compressionRatio = (originalSize - optimizedSize) / originalSize

          resolve({
            originalSize,
            optimizedSize,
            compressionRatio,
            dataUrl,
            width,
            height
          })
        } catch (error) {
          reject(new Error(`Image optimization failed: ${error}`))
        }
      }

      img.onerror = () => {
        reject(new Error('Failed to load image'))
      }

      img.src = URL.createObjectURL(file)
    })
  }

  /**
   * Calcule les dimensions optimales
   */
  private calculateDimensions(
    originalWidth: number,
    originalHeight: number,
    maxWidth: number,
    maxHeight: number
  ): { width: number; height: number } {
    let { width, height } = { width: originalWidth, height: originalHeight }

    // Redimensionner si nécessaire
    if (width > maxWidth || height > maxHeight) {
      const aspectRatio = width / height
      
      if (width > height) {
        width = Math.min(maxWidth, width)
        height = width / aspectRatio
      } else {
        height = Math.min(maxHeight, height)
        width = height * aspectRatio
      }
    }

    return { width: Math.round(width), height: Math.round(height) }
  }

  /**
   * Estime la taille d'une data URL
   */
  private estimateDataUrlSize(dataUrl: string): number {
    // Approximation basée sur la longueur de la data URL
    return Math.round((dataUrl.length * 3) / 4)
  }

  /**
   * Crée une image non optimisée (fallback)
   */
  private createUnoptimizedImage(file: File): Promise<OptimizedImage> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string
        resolve({
          originalSize: file.size,
          optimizedSize: file.size,
          compressionRatio: 0,
          dataUrl,
          width: 0,
          height: 0
        })
      }
      
      reader.onerror = () => reject(new Error('Failed to read file'))
      reader.readAsDataURL(file)
    })
  }

  /**
   * Vérifie si une image a besoin d'optimisation
   */
  needsOptimization(file: File): boolean {
    if (!this.config.enableCompression) return false
    
    // Vérifier la taille du fichier
    const maxFileSize = 2 * 1024 * 1024 // 2MB
    if (file.size > maxFileSize) return true
    
    // Vérifier le type de fichier
    const supportedTypes = ['image/jpeg', 'image/png', 'image/webp']
    if (!supportedTypes.includes(file.type)) return false
    
    return true
  }

  /**
   * Obtient les statistiques d'optimisation
   */
  getOptimizationStats(): { totalSaved: number; averageRatio: number } {
    // TODO: Implémenter le tracking des statistiques
    return { totalSaved: 0, averageRatio: 0 }
  }

  /**
   * Met à jour la configuration
   */
  updateConfig(config: Partial<ImageOptimizationConfig>): void {
    this.config = { ...this.config, ...config }
  }

  /**
   * Obtient la configuration actuelle
   */
  getConfig(): ImageOptimizationConfig {
    return { ...this.config }
  }
}

// Instance singleton
export const imageOptimizer = ImageOptimizer.getInstance()

// Fonctions utilitaires
export const optimizeImage = (file: File, config?: Partial<ImageOptimizationConfig>) => {
  return imageOptimizer.optimizeImage(file, config)
}

export const needsOptimization = (file: File): boolean => {
  return imageOptimizer.needsOptimization(file)
}
