import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

interface UploadState {
  videoId: string | null
  thumbnailUrl: string | null
  fileName: string
  pendingData: {
    description?: string
    visibility: string
    price?: number
    location?: string
  } | null
  isUploading: boolean
  progress: number
  status: 'uploading' | 'processing' | 'success' | 'error' | null
  message: string
  setUpload: (data: {
    videoId: string
    thumbnailUrl: string | null
    fileName: string
    pendingData: any
  }) => void
  setProgress: (progress: number, message?: string) => void
  setStatus: (status: 'uploading' | 'processing' | 'success' | 'error', message?: string) => void
  clearUpload: () => void
}

export const useUploadStore = create<UploadState>()(
  persist(
    (set) => ({
      videoId: null,
      thumbnailUrl: null,
      fileName: '',
      pendingData: null,
      isUploading: false,
      progress: 0,
      status: null,
      message: '',

      setUpload: (data) => {
        console.log('📦 Store: setUpload appelé', data)
        set({
          videoId: data.videoId,
          thumbnailUrl: data.thumbnailUrl,
          fileName: data.fileName,
          pendingData: data.pendingData,
          isUploading: true,
          progress: 0,
          status: 'uploading',
          message: 'Upload en cours...'
        })
      },

      setProgress: (progress, message) => {
        set((state) => ({
          progress,
          message: message || state.message
        }))
      },

      setStatus: (status, message) => {
        set({
          status,
          message: message || ''
        })
      },

      clearUpload: () => {
        console.log('🧹 Store: clearUpload appelé')
        set({
          videoId: null,
          thumbnailUrl: null,
          fileName: '',
          pendingData: null,
          isUploading: false,
          progress: 0,
          status: null,
          message: ''
        })
      }
    }),
    {
      name: 'felora-upload-storage',
      storage: createJSONStorage(() => sessionStorage),
    }
  )
)
