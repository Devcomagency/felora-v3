'use client'

import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, XCircle, AlertCircle, Info, X } from 'lucide-react'
import { create } from 'zustand'

export type ToastType = 'success' | 'error' | 'warning' | 'info'

export interface Toast {
  id: string
  type: ToastType
  message: string
  duration?: number
}

interface ToastStore {
  toasts: Toast[]
  addToast: (toast: Omit<Toast, 'id'>) => void
  removeToast: (id: string) => void
}

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  addToast: (toast) => {
    const id = `${Date.now()}-${Math.random()}`
    set((state) => ({
      toasts: [...state.toasts, { ...toast, id }]
    }))

    // Auto-remove après duration (défaut 5s)
    const duration = toast.duration ?? 5000
    if (duration > 0) {
      setTimeout(() => {
        set((state) => ({
          toasts: state.toasts.filter((t) => t.id !== id)
        }))
      }, duration)
    }
  },
  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id)
    }))
  }
}))

// Hook simplifié pour afficher des toasts
export function useToast() {
  const addToast = useToastStore((state) => state.addToast)

  return {
    success: (message: string, duration?: number) => addToast({ type: 'success', message, duration }),
    error: (message: string, duration?: number) => addToast({ type: 'error', message, duration }),
    warning: (message: string, duration?: number) => addToast({ type: 'warning', message, duration }),
    info: (message: string, duration?: number) => addToast({ type: 'info', message, duration })
  }
}

const toastIcons = {
  success: CheckCircle2,
  error: XCircle,
  warning: AlertCircle,
  info: Info
}

const toastColors = {
  success: 'from-green-500 to-emerald-600',
  error: 'from-red-500 to-rose-600',
  warning: 'from-yellow-500 to-orange-600',
  info: 'from-blue-500 to-cyan-600'
}

function ToastItem({ toast }: { toast: Toast }) {
  const removeToast = useToastStore((state) => state.removeToast)
  const Icon = toastIcons[toast.type]
  const colorClass = toastColors[toast.type]

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: 100, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className="flex items-start gap-3 w-full max-w-md p-4 rounded-xl shadow-2xl backdrop-blur-xl border border-white/10"
      style={{
        background: 'rgba(20, 20, 30, 0.95)'
      }}
    >
      {/* Icône avec gradient */}
      <div className={`flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br ${colorClass} flex items-center justify-center`}>
        <Icon size={20} className="text-white" />
      </div>

      {/* Message */}
      <div className="flex-1 pt-1">
        <p className="text-sm text-white font-medium leading-relaxed">
          {toast.message}
        </p>
      </div>

      {/* Bouton fermer */}
      <button
        onClick={() => removeToast(toast.id)}
        className="flex-shrink-0 p-1 hover:bg-white/10 rounded-lg transition-colors"
      >
        <X size={16} className="text-gray-400 hover:text-white" />
      </button>
    </motion.div>
  )
}

/**
 * Conteneur de toasts à placer dans le layout racine
 */
export default function ToastContainer() {
  const toasts = useToastStore((state) => state.toasts)

  return (
    <div className="fixed top-4 right-4 z-[99999] flex flex-col gap-3 pointer-events-none">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <div key={toast.id} className="pointer-events-auto">
            <ToastItem toast={toast} />
          </div>
        ))}
      </AnimatePresence>
    </div>
  )
}
