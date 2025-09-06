'use client'

import { useState, useEffect } from 'react'
import { Bell } from 'lucide-react'

interface NotificationBellProps {
  userId: string
}

interface Notification {
  id: string
  type: 'message' | 'order' | 'payment' | 'system'
  title: string
  message: string
  timestamp: Date
  read: boolean
}

export default function NotificationBell({ userId }: NotificationBellProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [showDropdown, setShowDropdown] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    // Mock notifications pour le test
    const mockNotifications: Notification[] = [
      {
        id: '1',
        type: 'message',
        title: 'Nouveau message',
        message: 'Marc_Geneva vous a envoyé un message',
        timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 min ago
        read: false
      },
      {
        id: '2',
        type: 'order',
        title: 'Nouvelle commande',
        message: 'Commande de photo personnalisée - 150♦',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2h ago
        read: false
      },
      {
        id: '3',
        type: 'payment',
        title: 'Paiement reçu',
        message: 'Vous avez reçu 300♦',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
        read: true
      }
    ]

    setNotifications(mockNotifications)
    setUnreadCount(mockNotifications.filter(n => !n.read).length)
  }, [userId])

  const markAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
    )
    setUnreadCount(prev => Math.max(0, prev - 1))
  }

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    setUnreadCount(0)
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'message':
        return '💬'
      case 'order':
        return '🛍️'
      case 'payment':
        return '💰'
      case 'system':
        return '⚙️'
      default:
        return '🔔'
    }
  }

  const formatTime = (timestamp: Date) => {
    const now = new Date()
    const diff = now.getTime() - timestamp.getTime()
    const minutes = Math.floor(diff / (1000 * 60))
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (minutes < 1) return 'À l\'instant'
    if (minutes < 60) return `${minutes}min`
    if (hours < 24) return `${hours}h`
    return `${days}j`
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="p-2 text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-lg transition-colors relative"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {showDropdown && (
        <>
          <div 
            className="fixed inset-0 z-10"
            onClick={() => setShowDropdown(false)}
          />
          <div className="absolute right-0 mt-2 w-80 bg-gray-900 border border-gray-700 rounded-xl shadow-2xl z-20">
            <div className="p-4 border-b border-gray-700 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">Notifications</h3>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-sm text-purple-400 hover:text-purple-300 transition-colors"
                >
                  Tout marquer comme lu
                </button>
              )}
            </div>

            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-6 text-center text-gray-400">
                  Aucune notification
                </div>
              ) : (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    onClick={() => markAsRead(notification.id)}
                    className={`p-4 border-b border-gray-800 hover:bg-gray-800/50 cursor-pointer transition-colors ${
                      !notification.read ? 'bg-purple-500/5 border-l-2 border-l-purple-500' : ''
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="text-xl">{getNotificationIcon(notification.type)}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="text-sm font-medium text-white truncate">
                            {notification.title}
                          </h4>
                          <span className="text-xs text-gray-400">
                            {formatTime(notification.timestamp)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-300 line-clamp-2">
                          {notification.message}
                        </p>
                      </div>
                      {!notification.read && (
                        <div className="w-2 h-2 bg-purple-500 rounded-full flex-shrink-0"></div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-3 border-t border-gray-700">
              <button className="w-full text-sm text-purple-400 hover:text-purple-300 transition-colors">
                Voir toutes les notifications
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}