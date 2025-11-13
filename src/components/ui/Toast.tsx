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
  success: 'from-[#4FD1C7] to-[#00F5FF]',
  error: 'from-[#FF6B9D] to-[#B794F6]',
  warning: 'from-[#FFB347] to-[#FF6B9D]',
  info: 'from-[#7C3AED] to-[#B794F6]'
}

function ToastItem({ toast }: { toast: Toast }) {
  const removeToast = useToastStore((state) => state.removeToast)
  const Icon = toastIcons[toast.type]
  const colorClass = toastColors[toast.type]

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.15 } }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className="flex items-center gap-3 px-4 py-3 rounded-2xl shadow-xl backdrop-blur-xl border border-white/5"
      style={{
        background: 'rgba(13, 13, 13, 0.92)'
      }}
    >
      {/* Icône minimaliste */}
      <div className={`flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br ${colorClass} flex items-center justify-center`}>
        <Icon size={16} className="text-white" strokeWidth={2.5} />
      </div>

      {/* Message compact */}
      <p className="text-sm text-white/95 font-medium tracking-tight">
        {toast.message}
      </p>

      {/* Bouton fermer subtil */}
      <button
        onClick={() => removeToast(toast.id)}
        className="flex-shrink-0 ml-2 p-1 hover:bg-white/5 rounded-full transition-colors"
      >
        <X size={14} className="text-white/40 hover:text-white/70" strokeWidth={2} />
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
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[99999] flex flex-col gap-2 pointer-events-none w-full max-w-sm px-4">
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
