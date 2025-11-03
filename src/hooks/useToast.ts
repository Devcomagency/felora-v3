import { useState, useCallback } from 'react'

export interface Toast {
  id: number
  message: string
  type: 'success' | 'error' | 'info' | 'warning'
}

export const useToast = () => {
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = useCallback((message: string, type: Toast['type'] = 'info') => {
    const id = Date.now()
    setToasts(prev => [...prev, { id, message, type }])

    // Auto-remove after 4 seconds
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 4000)
  }, [])

  const removeToast = useCallback((id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  return { toasts, addToast, removeToast }
}
