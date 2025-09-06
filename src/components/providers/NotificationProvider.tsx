'use client'

import React, { createContext, useContext } from 'react'
import NotificationSystem, { useNotifications } from '../features/notifications/NotificationSystem'

interface NotificationContextType {
  success: (title: string, message?: string, duration?: number) => string
  error: (title: string, message?: string, duration?: number) => string
  warning: (title: string, message?: string, duration?: number) => string
  info: (title: string, message?: string, duration?: number) => string
  addNotification: (notification: {
    type: 'success' | 'error' | 'warning' | 'info'
    title: string
    message?: string
    duration?: number
    action?: {
      label: string
      onClick: () => void
    }
  }) => string
  removeNotification: (id: string) => void
  clearAllNotifications: () => void
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const {
    notifications,
    addNotification,
    removeNotification,
    clearAllNotifications,
    success,
    error,
    warning,
    info
  } = useNotifications()

  const contextValue: NotificationContextType = {
    success,
    error,
    warning,
    info,
    addNotification,
    removeNotification,
    clearAllNotifications
  }

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
      <NotificationSystem 
        notifications={notifications} 
        onRemove={removeNotification}
      />
    </NotificationContext.Provider>
  )
}

export function useNotification() {
  const context = useContext(NotificationContext)
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider')
  }
  return context
}

// Utilitaires de notification globales
export const notify = {
  success: (title: string, message?: string) => {
    if (typeof window !== 'undefined') {
      const event = new CustomEvent('felora:notify', {
        detail: { type: 'success', title, message }
      })
      window.dispatchEvent(event)
    }
  },
  error: (title: string, message?: string) => {
    if (typeof window !== 'undefined') {
      const event = new CustomEvent('felora:notify', {
        detail: { type: 'error', title, message }
      })
      window.dispatchEvent(event)
    }
  },
  warning: (title: string, message?: string) => {
    if (typeof window !== 'undefined') {
      const event = new CustomEvent('felora:notify', {
        detail: { type: 'warning', title, message }
      })
      window.dispatchEvent(event)
    }
  },
  info: (title: string, message?: string) => {
    if (typeof window !== 'undefined') {
      const event = new CustomEvent('felora:notify', {
        detail: { type: 'info', title, message }
      })
      window.dispatchEvent(event)
    }
  }
}