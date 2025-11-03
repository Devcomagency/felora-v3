'use client'

import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react'
import { Toast } from '@/hooks/useToast'

interface ToastNotificationProps {
  toast: Toast
  onClose: (id: number) => void
}

export default function ToastNotification({ toast, onClose }: ToastNotificationProps) {
  const icons = {
    success: <CheckCircle size={20} />,
    error: <AlertCircle size={20} />,
    info: <Info size={20} />,
    warning: <AlertTriangle size={20} />
  }

  const colors = {
    success: 'from-green-500/90 to-green-600/90 border-green-500/50',
    error: 'from-red-500/90 to-red-600/90 border-red-500/50',
    info: 'from-blue-500/90 to-blue-600/90 border-blue-500/50',
    warning: 'from-yellow-500/90 to-yellow-600/90 border-yellow-500/50'
  }

  return (
    <div
      className={`
        flex items-center gap-3 px-6 py-4 rounded-xl shadow-2xl border backdrop-blur-sm
        bg-gradient-to-r ${colors[toast.type]}
        animate-slide-in-right
      `}
    >
      <div className="text-white">
        {icons[toast.type]}
      </div>
      <p className="flex-1 text-white font-medium text-sm">
        {toast.message}
      </p>
      <button
        onClick={() => onClose(toast.id)}
        className="text-white/80 hover:text-white transition-colors"
        aria-label="Fermer"
      >
        <X size={18} />
      </button>
    </div>
  )
}
