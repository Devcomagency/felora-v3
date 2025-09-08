"use client"

import { useState, useCallback } from 'react'
import { videoCompressor, CompressionResult } from '@/lib/video-compression'

interface UseVideoCompressionReturn {
  compressVideo: (file: File, maxSizeMB?: number) => Promise<CompressionResult>
  isCompressing: boolean
  progress: number
  error: string | null
  result: CompressionResult | null
  reset: () => void
}

export const useVideoCompression = (): UseVideoCompressionReturn => {
  const [isCompressing, setIsCompressing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<CompressionResult | null>(null)

  const compressVideo = useCallback(async (file: File, maxSizeMB = 3.8): Promise<CompressionResult> => {
    try {
      setIsCompressing(true)
      setProgress(0)
      setError(null)
      setResult(null)

      // Simulation du progrès pendant la compression
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + Math.random() * 20, 95))
      }, 500)

      const compressionResult = await videoCompressor.compressVideo(file, {
        maxSizeMB,
        quality: 0.85,
        maxWidthOrHeight: 1080
      })

      clearInterval(progressInterval)
      setProgress(100)
      setResult(compressionResult)
      
      return compressionResult

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur de compression inconnue'
      setError(errorMessage)
      throw err

    } finally {
      setIsCompressing(false)
    }
  }, [])

  const reset = useCallback(() => {
    setIsCompressing(false)
    setProgress(0)
    setError(null)
    setResult(null)
  }, [])

  return {
    compressVideo,
    isCompressing,
    progress,
    error,
    result,
    reset
  }
}