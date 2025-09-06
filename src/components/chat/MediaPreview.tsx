'use client'

import { X, File, Image as ImageIcon, Video, Music } from 'lucide-react'

interface MediaPreviewProps {
  file: File
  preview?: string
  onRemove: () => void
}

export default function MediaPreview({ file, preview, onRemove }: MediaPreviewProps) {
  const getFileIcon = () => {
    if (file.type.startsWith('image/')) return <ImageIcon size={20} className="text-blue-400" />
    if (file.type.startsWith('video/')) return <Video size={20} className="text-red-400" />
    if (file.type.startsWith('audio/')) return <Music size={20} className="text-green-400" />
    return <File size={20} className="text-gray-400" />
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
  }

  return (
    <div className="relative bg-gray-700/50 rounded-lg p-3 border border-gray-600/50">
      {/* Remove button */}
      <button
        onClick={onRemove}
        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center text-white transition-colors z-10"
      >
        <X size={14} />
      </button>

      <div className="flex items-start space-x-3">
        {/* Preview or Icon */}
        <div className="flex-shrink-0">
          {preview ? (
            <img
              src={preview}
              alt="Preview"
              className="w-16 h-16 object-cover rounded-lg"
            />
          ) : (
            <div className="w-16 h-16 bg-gray-600 rounded-lg flex items-center justify-center">
              {getFileIcon()}
            </div>
          )}
        </div>

        {/* File info */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-white truncate">{file.name}</p>
          <p className="text-xs text-gray-400">{formatFileSize(file.size)}</p>
          <p className="text-xs text-gray-500">{file.type}</p>
        </div>
      </div>
    </div>
  )
}