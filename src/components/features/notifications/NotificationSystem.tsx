'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Bell, Check, AlertCircle, Info } from 'lucide-react'

export type NotificationType = 'success' | 'error' | 'warning' | 'info'

export interface Notification {
  id: string
  type: NotificationType
  title: string
  message?: string
  duration?: number
  action?: {
    label: string
    onClick: () => void
  }
}

interface NotificationSystemProps {
  notifications: Notification[]
  onRemove: (id: string) => void
}

const NotificationIcon = ({ type }: { type: NotificationType }) => {
  const icons = {
    success: <Check size={20} />,
    error: <AlertCircle size={20} />,
    warning: <AlertCircle size={20} />,
    info: <Info size={20} />
  }
  return icons[type]
}

const NotificationItem = ({ notification, onRemove }: { 
  notification: Notification
  onRemove: (id: string) => void 
}) => {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    if (notification.duration && notification.duration > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false)
        setTimeout(() => onRemove(notification.id), 300)
      }, notification.duration)

      return () => clearTimeout(timer)
    }
  }, [notification.duration, notification.id, onRemove])

  const getNotificationColors = (type: NotificationType) => {
    switch (type) {
      case 'success':
        return {
          bg: 'bg-emerald-900/20',
          border: 'border-emerald-500/30',
          text: 'text-emerald-300',
          icon: 'text-emerald-400'
        }
      case 'error':
        return {
          bg: 'bg-red-900/20',
          border: 'border-red-500/30',
          text: 'text-red-300',
          icon: 'text-red-400'
        }
      case 'warning':
        return {
          bg: 'bg-amber-900/20',
          border: 'border-amber-500/30',
          text: 'text-amber-300',
          icon: 'text-amber-400'
        }
      case 'info':
        return {
          bg: 'bg-blue-900/20',
          border: 'border-blue-500/30',
          text: 'text-blue-300',
          icon: 'text-blue-400'
        }
    }
  }

  const colors = getNotificationColors(notification.type)

  if (!isVisible) return null

  return (
    <motion.div
      initial={{ opacity: 0, x: 300, scale: 0.3 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 300, scale: 0.5, transition: { duration: 0.2 } }}
      className={`
        relative w-full max-w-sm p-4 rounded-xl backdrop-blur-lg border
        ${colors.bg} ${colors.border}
        shadow-xl shadow-black/20
      `}
    >
      <div className="flex items-start gap-3">
        <div className={`flex-shrink-0 ${colors.icon}`}>
          <NotificationIcon type={notification.type} />
        </div>
        
        <div className="flex-1 min-w-0">
          <h4 className={`text-sm font-semibold ${colors.text}`}>
            {notification.title}
          </h4>
          {notification.message && (
            <p className="mt-1 text-xs text-white/70 leading-relaxed">
              {notification.message}
            </p>
          )}
          
          {notification.action && (
            <button
              onClick={notification.action.onClick}
              className={`
                mt-2 px-3 py-1 text-xs font-medium rounded-lg
                ${colors.text} bg-white/5 hover:bg-white/10
                border border-white/10 hover:border-white/20
                transition-all duration-200
              `}
            >
              {notification.action.label}
            </button>
          )}
        </div>

        <button
          onClick={() => {
            setIsVisible(false)
            setTimeout(() => onRemove(notification.id), 300)
          }}
          className="flex-shrink-0 p-1 rounded-lg text-white/40 hover:text-white/60 hover:bg-white/5 transition-colors"
        >
          <X size={16} />
        </button>
      </div>
    </motion.div>
  )
}

export default function NotificationSystem({ notifications, onRemove }: NotificationSystemProps) {
  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
      <AnimatePresence mode="popLayout">
        {notifications.map((notification) => (
          <div key={notification.id} className="pointer-events-auto">
            <NotificationItem 
              notification={notification} 
              onRemove={onRemove}
            />
          </div>
        ))}
      </AnimatePresence>
    </div>
  )
}

// Hook personnalisé pour utiliser le système de notifications
export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([])

  const addNotification = (notification: Omit<Notification, 'id'>) => {
    const id = Math.random().toString(36).substring(2) + Date.now().toString(36)
    const newNotification: Notification = {
      ...notification,
      id,
      duration: notification.duration ?? 5000
    }
    
    setNotifications(prev => [...prev, newNotification])
    return id
  }

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  const clearAllNotifications = () => {
    setNotifications([])
  }

  // Méthodes de commodité
  const success = (title: string, message?: string, duration?: number) =>
    addNotification({ type: 'success', title, message, duration })

  const error = (title: string, message?: string, duration?: number) =>
    addNotification({ type: 'error', title, message, duration })

  const warning = (title: string, message?: string, duration?: number) =>
    addNotification({ type: 'warning', title, message, duration })

  const info = (title: string, message?: string, duration?: number) =>
    addNotification({ type: 'info', title, message, duration })

  return {
    notifications,
    addNotification,
    removeNotification,
    clearAllNotifications,
    success,
    error,
    warning,
    info
  }
}