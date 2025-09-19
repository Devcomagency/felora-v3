// Système de stockage adaptatif selon l'environnement

import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'

interface UploadResult {
  url: string
  success: boolean
  error?: string
  key?: string
}

export class MediaStorage {
  private static instance: MediaStorage
  private isProduction = process.env.NODE_ENV === 'production'
  
  static getInstance(): MediaStorage {
    if (!MediaStorage.instance) {
      MediaStorage.instance = new MediaStorage()
    }
    return MediaStorage.instance
  }

  async upload(file: File, folder: string = 'general'): Promise<UploadResult> {
    const provider = (process.env.STORAGE_PROVIDER || '').toLowerCase()

    // TEMPORAIRE: FORCE Base64 pour éviter erreurs R2
    console.log('🔧 [STORAGE FIX] Forcing Base64 upload, provider was:', provider)
    return await this.uploadBase64(file, folder)
    
    if (!this.isProduction || provider === 'local') {
      return await this.uploadLocal(file, folder)
    }
    
    // cloud providers (fallback)
    if (provider === 'cloudflare-r2') {
      return await this.uploadToCloud(file, folder)
    }
    
    // Default: Base64 for production reliability
    return await this.uploadBase64(file, folder)
  }

  // Stockage local pour le développement
  private async uploadLocal(file: File, folder: string): Promise<UploadResult> {
    try {
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)
      
      const fileName = `${Date.now()}-${file.name.replace(/\s+/g, '-')}`
      // Pour l'API existante /api/escort/media/[file], on stocke sous 'uploads/profiles'
      const uploadDir = join(process.cwd(), 'uploads', 'profiles')
      
      await mkdir(uploadDir, { recursive: true })
      
      const filePath = join(uploadDir, fileName)
      await writeFile(filePath, buffer)
      
      return {
        url: `/api/escort/media/${fileName}`,
        success: true,
        key: `${fileName}`
      }
    } catch (error) {
      return {
        url: '',
        success: false,
        error: error instanceof Error ? error.message : 'Upload failed'
      }
    }
  }

  // Stockage Base64 en BDD - 100% fiable
  private async uploadBase64(file: File, folder: string): Promise<UploadResult> {
    try {
      const bytes = await file.arrayBuffer()
      const base64 = Buffer.from(bytes).toString('base64')
      const dataUrl = `data:${file.type};base64,${base64}`
      
      const fileName = `${Date.now()}-${file.name.replace(/\s+/g, '-')}`
      
      return {
        url: dataUrl,
        success: true,
        key: fileName
      }
    } catch (error) {
      return {
        url: '',
        success: false,
        error: error instanceof Error ? error.message : 'Base64 upload failed'
      }
    }
  }

  // Stockage cloud pour la production - Prefer presign flow
  private async uploadToCloud(file: File, folder: string): Promise<UploadResult> {
    // Note: This is legacy direct upload. New uploads should use presign/confirm flow.
    // Keeping for backward compatibility with existing upload route.
    
    if (process.env.CLOUDFLARE_R2_ENDPOINT) {
      console.log('📦 Storage: Cloudflare R2 (legacy direct upload)')
      return await this.uploadToR2(file, folder)
    } else if (process.env.AWS_S3_BUCKET) {
      console.log('📦 Storage: AWS S3 (non implémenté)')
      return await this.uploadToS3(file, folder)
    } else {
      // Fallback vers base64 ou local selon la taille
      console.warn('⚠️ Production mode but no cloud storage configured')
      if (file.size <= 4 * 1024 * 1024) {
        return await this.uploadBase64(file, folder)
      } else {
        return await this.uploadLocal(file, folder)
      }
    }
  }

  private async uploadToR2(file: File, folder: string): Promise<UploadResult> {
    try {
      // Normaliser l'endpoint R2 (S3 API), ex: https://<account-id>.r2.cloudflarestorage.com
      let endpoint = process.env.CLOUDFLARE_R2_ENDPOINT || ''
      const accountId = process.env.CLOUDFLARE_R2_ACCOUNT_ID || ''
      if (!endpoint && accountId) {
        endpoint = `https://${accountId}.r2.cloudflarestorage.com`
      }
      if (endpoint && !endpoint.startsWith('https://')) {
        endpoint = `https://${endpoint.replace(/^https?:\/\//, '')}`
      }
      // Retirer tout trailing slash ou segment de bucket (doit être base host uniq.)
      endpoint = endpoint.replace(/\/$/, '')
      if (endpoint.includes('/')) {
        const u = new URL(endpoint)
        endpoint = `${u.protocol}//${u.host}`
      }
      const accessKey = process.env.CLOUDFLARE_R2_ACCESS_KEY
      const secretKey = process.env.CLOUDFLARE_R2_SECRET_KEY
      const bucketName = process.env.CLOUDFLARE_R2_BUCKET

      if (!endpoint || !accessKey || !secretKey || !bucketName) {
        throw new Error('Cloudflare R2 configuration missing')
      }

      // Dynamic import to avoid build errors if SDK not installed in dev
      const { S3Client, PutObjectCommand } = await import('@aws-sdk/client-s3')
      const { getSignedUrl } = await import('@aws-sdk/s3-request-presigner')

      const s3 = new S3Client({
        region: 'auto', // R2 uses 'auto' instead of us-east-1
        endpoint,
        credentials: { 
          accessKeyId: accessKey, 
          secretAccessKey: secretKey 
        },
        forcePathStyle: true, // Patch pack recommends true for R2
        requestHandler: {
          requestTimeout: 60000, // 60s pour gros fichiers
        }
      })

      const bytes = await file.arrayBuffer()
      const ext = (() => {
        const n = (file as any).name ? String((file as any).name) : ''
        const dot = n.lastIndexOf('.')
        if (dot > -1) return n.slice(dot + 1).toLowerCase()
        const t = file.type || ''
        if (t.includes('/')) return t.split('/')[1]
        return 'bin'
      })()
      const key = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

      await s3.send(new PutObjectCommand({
        Bucket: bucketName,
        Key: key,
        Body: Buffer.from(bytes),
        ContentType: file.type || 'application/octet-stream',
      }))

      // Generate a signed URL valid 7 days for previews
      const signedUrl = await getSignedUrl(s3 as any, new (await import('@aws-sdk/client-s3')).GetObjectCommand({
        Bucket: bucketName,
        Key: key,
      }) as any, { expiresIn: 60 * 60 * 24 * 7 })

      return { url: signedUrl, success: true, key }
    } catch (error) {
      console.error('❌ R2 upload failed:', {
        name: (error as any)?.name,
        message: (error as any)?.message,
        code: (error as any)?.Code || (error as any)?.code,
        statusCode: (error as any)?.$response?.statusCode,
        endpoint: process.env.CLOUDFLARE_R2_ENDPOINT?.substring(0, 50) + '...',
        bucket: process.env.CLOUDFLARE_R2_BUCKET,
        hasAccessKey: !!process.env.CLOUDFLARE_R2_ACCESS_KEY,
        hasSecretKey: !!process.env.CLOUDFLARE_R2_SECRET_KEY
      })
      return {
        url: '',
        success: false,
        error: error instanceof Error ? error.message : 'R2 upload failed'
      }
    }
  }

  private async uploadToS3(file: File, folder: string): Promise<UploadResult> {
    // TODO: Implémenter AWS S3
    return {
      url: '',
      success: false,
      error: 'S3 upload not implemented yet'
    }
  }

  // Nettoyage des anciens fichiers (cronjob)
  async cleanupOldFiles(olderThanDays: number = 30): Promise<void> {
    // TODO: Implémenter nettoyage automatique
    console.log(`🧹 Cleanup files older than ${olderThanDays} days`)
  }
}

export const mediaStorage = MediaStorage.getInstance()
