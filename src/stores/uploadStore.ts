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
  setUpload: (data: {
    videoId: string
    thumbnailUrl: string | null
    fileName: string
    pendingData: any
  }) => void
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

      setUpload: (data) => {
        console.log('📦 Store: setUpload appelé', data)
        set({
          videoId: data.videoId,
          thumbnailUrl: data.thumbnailUrl,
          fileName: data.fileName,
          pendingData: data.pendingData,
          isUploading: true
        })
      },

      clearUpload: () => {
        console.log('🧹 Store: clearUpload appelé')
        set({
          videoId: null,
          thumbnailUrl: null,
          fileName: '',
          pendingData: null,
          isUploading: false
        })
      }
    }),
    {
      name: 'felora-upload-storage',
      storage: createJSONStorage(() => sessionStorage),
    }
  )
)
