import { create } from 'zustand'

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

export const useUploadStore = create<UploadState>((set) => ({
  videoId: null,
  thumbnailUrl: null,
  fileName: '',
  pendingData: null,
  isUploading: false,

  setUpload: (data) => set({
    videoId: data.videoId,
    thumbnailUrl: data.thumbnailUrl,
    fileName: data.fileName,
    pendingData: data.pendingData,
    isUploading: true
  }),

  clearUpload: () => set({
    videoId: null,
    thumbnailUrl: null,
    fileName: '',
    pendingData: null,
    isUploading: false
  })
}))
