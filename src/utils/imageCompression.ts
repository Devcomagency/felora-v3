import { MEDIA_CONSTANTS } from '@/constants/messaging'

export interface CompressionOptions {
  maxWidth?: number
  maxHeight?: number
  quality?: number
  maxSize?: number
}

export interface CompressionResult {
  file: File
  originalSize: number
  compressedSize: number
  compressionRatio: number
}

/**
 * Compresse une image en utilisant Canvas
 */
export async function compressImage(
  file: File,
  options: CompressionOptions = {}
): Promise<CompressionResult> {
  const {
    maxWidth = 1920,
    maxHeight = 1080,
    quality = MEDIA_CONSTANTS.COMPRESSION_QUALITY,
    maxSize = MEDIA_CONSTANTS.MAX_IMAGE_SIZE
  } = options

  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()

    img.onload = () => {
      try {
        // Calculer les nouvelles dimensions en gardant le ratio
        let { width, height } = img
        
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height)
          width *= ratio
          height *= ratio
        }

        // Configurer le canvas
        canvas.width = width
        canvas.height = height

        // Dessiner l'image redimensionnée
        ctx?.drawImage(img, 0, 0, width, height)

        // Convertir en blob avec compression
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Erreur lors de la compression'))
              return
            }

            // Si le fichier est encore trop gros, réduire la qualité
            if (blob.size > maxSize) {
              const newQuality = Math.max(0.1, quality * 0.7)
              canvas.toBlob(
                (compressedBlob) => {
                  if (!compressedBlob) {
                    reject(new Error('Erreur lors de la compression'))
                    return
                  }

                  const compressedFile = new File([compressedBlob], file.name, {
                    type: file.type,
                    lastModified: Date.now()
                  })

                  resolve({
                    file: compressedFile,
                    originalSize: file.size,
                    compressedSize: compressedBlob.size,
                    compressionRatio: (1 - compressedBlob.size / file.size) * 100
                  })
                },
                file.type,
                newQuality
              )
            } else {
              const compressedFile = new File([blob], file.name, {
                type: file.type,
                lastModified: Date.now()
              })

              resolve({
                file: compressedFile,
                originalSize: file.size,
                compressedSize: blob.size,
                compressionRatio: (1 - blob.size / file.size) * 100
              })
            }
          },
          file.type,
          quality
        )
      } catch (error) {
        reject(error)
      }
    }

    img.onerror = () => {
      reject(new Error('Erreur lors du chargement de l\'image'))
    }

    img.src = URL.createObjectURL(file)
  })
}

/**
 * Vérifie si une image a besoin d'être compressée
 */
export function needsCompression(file: File, maxSize: number = MEDIA_CONSTANTS.MAX_IMAGE_SIZE): boolean {
  return file.size > maxSize
}

/**
 * Compresse une image seulement si nécessaire
 */
export async function compressImageIfNeeded(
  file: File,
  options: CompressionOptions = {}
): Promise<CompressionResult> {
  const maxSize = options.maxSize || MEDIA_CONSTANTS.MAX_IMAGE_SIZE
  
  if (!needsCompression(file, maxSize)) {
    return {
      file,
      originalSize: file.size,
      compressedSize: file.size,
      compressionRatio: 0
    }
  }

  return compressImage(file, options)
}

/**
 * Crée une vignette d'image
 */
export async function createThumbnail(
  file: File,
  size: number = MEDIA_CONSTANTS.THUMBNAIL_SIZE
): Promise<string> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()

    img.onload = () => {
      try {
        // Calculer les dimensions de la vignette
        const { width, height } = img
        const ratio = Math.min(size / width, size / height)
        
        canvas.width = width * ratio
        canvas.height = height * ratio

        // Dessiner l'image redimensionnée
        ctx?.drawImage(img, 0, 0, canvas.width, canvas.height)

        // Convertir en data URL
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8)
        resolve(dataUrl)
      } catch (error) {
        reject(error)
      }
    }

    img.onerror = () => {
      reject(new Error('Erreur lors du chargement de l\'image'))
    }

    img.src = URL.createObjectURL(file)
  })
}
