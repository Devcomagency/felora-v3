'use client'

import { useState, useEffect, useRef } from 'react'
import { Bell, X, ExternalLink, AlertCircle } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { useNotifications, type Notification } from '@/hooks/useNotifications'
import { useRouter } from 'next/navigation'

/**
 * Valide et sécurise un lien de notification
 * Retourne le lien s'il est sûr, null sinon
 */
function validateNotificationLink(link: string | null | undefined): string | null {
  if (!link) return null

  try {
    // Accepter les liens relatifs (même domaine)
    if (link.startsWith('/')) {
      return link
    }

    // Vérifier les liens absolus
    const url = new URL(link)
    const currentHost = typeof window !== 'undefined' ? window.location.hostname : ''

    // N'accepter que les liens du même domaine ou localhost
    const isAllowed =
      url.hostname === currentHost ||
      url.hostname === 'localhost' ||
      url.hostname === '127.0.0.1' ||
      url.hostname.endsWith('.felora.ch')

    return isAllowed ? link : null
  } catch {
    // URL invalide
    return null
  }
}

export default function NotificationBell() {
  const { data: session } = useSession()
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // 🚀 Utiliser le hook unifié avec filtre "system" (exclut MESSAGE_RECEIVED)
  const {
    notifications,
    unreadCount,
    isLoading: loading,
    markAsRead,
    markAllAsRead
  } = useNotifications()

  // Fermer le dropdown si on clique à l'extérieur
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleNotificationClick = async (notif: Notification) => {
    // Marquer comme lue (optimistic update via le hook)
    if (!notif.read) {
      try {
        await markAsRead(notif.id)
      } catch (error) {
        console.error('Erreur marquage notification:', error)
      }
    }

    // Si la notification a un lien, le valider puis rediriger
    if (notif.link) {
      const validLink = validateNotificationLink(notif.link)

      if (validLink) {
        // Utiliser router.push pour la navigation client-side
        if (validLink.startsWith('/')) {
          setIsOpen(false)
          router.push(validLink)
        } else {
          // Lien externe sécurisé
          window.location.href = validLink
        }
      } else {
        // Lien non sécurisé : afficher la modal avec un avertissement
        setSelectedNotification({
          ...notif,
          message: `${notif.message}\n\n⚠️ Le lien associé n'est pas sécurisé et a été bloqué.`
        })
      }
    } else {
      // Pas de lien : ouvrir la modal
      setSelectedNotification(notif)
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead()
    } catch (error) {
      console.error('Erreur marquage notifications:', error)
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'KYC_APPROVED':
        return '✅'
      case 'KYC_REJECTED':
        return '❌'
      case 'ACCOUNT_BANNED':
        return '🚫'
      case 'MESSAGE_RECEIVED':
        return '💬'
      case 'SUBSCRIPTION_NEW':
        return '💎'
      case 'SUBSCRIPTION_EXPIRED':
        return '⏰'
      default:
        return '🔔'
    }
  }

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'KYC_APPROVED':
        return 'bg-green-500/10 border-green-500/20'
      case 'KYC_REJECTED':
        return 'bg-red-500/10 border-red-500/20'
      case 'ACCOUNT_BANNED':
        return 'bg-red-500/10 border-red-500/20'
      case 'MESSAGE_RECEIVED':
        return 'bg-blue-500/10 border-blue-500/20'
      case 'SUBSCRIPTION_NEW':
        return 'bg-purple-500/10 border-purple-500/20'
      case 'SUBSCRIPTION_EXPIRED':
        return 'bg-orange-500/10 border-orange-500/20'
      default:
        return 'bg-white/5 border-white/10'
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'À l\'instant'
    if (diffMins < 60) return `Il y a ${diffMins}min`
    if (diffHours < 24) return `Il y a ${diffHours}h`
    if (diffDays < 7) return `Il y a ${diffDays}j`
    return date.toLocaleDateString('fr-FR')
  }

  if (!session?.user) return null

  return (
    <>
      <div className="relative" ref={dropdownRef}>
        {/* Bouton cloche */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="relative p-2 hover:bg-white/10 rounded-lg transition-colors"
        >
          <Bell size={24} className="text-white" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        {/* Dropdown des notifications - Responsive */}
        {isOpen && (
          <div className="fixed sm:absolute right-2 sm:right-0 top-16 sm:top-auto sm:mt-2 w-[calc(100vw-1rem)] sm:w-96 max-h-[calc(100vh-5rem)] sm:max-h-[600px] bg-black/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl overflow-hidden z-[9999]">
            {/* Header */}
            <div className="p-4 border-b border-white/10 flex items-center justify-between sticky top-0 bg-black/95 backdrop-blur-xl z-10">
              <h3 className="text-lg font-bold text-white">Notifications</h3>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  disabled={loading}
                  className="text-xs sm:text-sm text-purple-400 hover:text-purple-300 disabled:opacity-50 whitespace-nowrap"
                >
                  Tout marquer comme lu
                </button>
              )}
            </div>

            {/* Liste des notifications */}
            <div className="overflow-y-auto" style={{ maxHeight: 'calc(100vh - 14rem)' }}>
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-white/60">
                  <Bell size={48} className="mx-auto mb-4 opacity-50" />
                  <p>Aucune notification</p>
                </div>
              ) : (
                notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className={`p-3 sm:p-4 border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer ${
                      !notif.read ? 'bg-white/5' : ''
                    } ${notif.link ? 'hover:bg-purple-500/10' : ''}`}
                    onClick={() => handleNotificationClick(notif)}
                  >
                    <div className="flex gap-2 sm:gap-3">
                      <div className={`flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-full border ${getNotificationColor(notif.type)} flex items-center justify-center text-base sm:text-xl`}>
                        {getNotificationIcon(notif.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-1 flex-1">
                            <h4 className="font-semibold text-white text-xs sm:text-sm line-clamp-1">{notif.title}</h4>
                            {notif.link && (
                              <ExternalLink size={14} className="text-purple-400 flex-shrink-0" />
                            )}
                          </div>
                          {!notif.read && (
                            <span className="flex-shrink-0 w-2 h-2 bg-purple-500 rounded-full mt-1"></span>
                          )}
                        </div>
                        <p className="text-xs sm:text-sm text-white/70 mt-1 line-clamp-2">{notif.message}</p>
                        <div className="flex items-center justify-between gap-2 mt-1 sm:mt-2">
                          <p className="text-[10px] sm:text-xs text-white/40">{formatDate(notif.createdAt)}</p>
                          {notif.link ? (
                            <span className="text-[10px] sm:text-xs text-purple-400">Cliquer pour ouvrir →</span>
                          ) : (
                            <span className="text-[10px] sm:text-xs text-white/40">Cliquer pour détails</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="p-3 border-t border-white/10 text-center sticky bottom-0 bg-black/95 backdrop-blur-xl">
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-sm text-purple-400 hover:text-purple-300"
                >
                  Fermer
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal pour voir le message complet */}
      {selectedNotification && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[9999] flex items-center justify-center p-4"
          onClick={() => setSelectedNotification(null)}
        >
          <div
            className="bg-gradient-to-br from-black/95 to-black/90 border border-white/10 rounded-2xl max-w-lg w-full shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header du modal */}
            <div className={`p-4 sm:p-6 border-b border-white/10 ${getNotificationColor(selectedNotification.type)}`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1">
                  <div className="flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-full border border-white/20 flex items-center justify-center text-2xl sm:text-3xl">
                    {getNotificationIcon(selectedNotification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg sm:text-xl font-bold text-white">{selectedNotification.title}</h3>
                    <p className="text-xs sm:text-sm text-white/60 mt-1">{formatDate(selectedNotification.createdAt)}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedNotification(null)}
                  className="flex-shrink-0 p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X size={20} className="text-white/70" />
                </button>
              </div>
            </div>

            {/* Corps du modal */}
            <div className="p-4 sm:p-6">
              <p className="text-sm sm:text-base text-white/90 leading-relaxed whitespace-pre-wrap">
                {selectedNotification.message}
              </p>
            </div>

            {/* Footer du modal */}
            <div className="p-4 sm:p-6 border-t border-white/10 flex gap-3 justify-end">
              {selectedNotification.link && (
                <button
                  onClick={() => {
                    window.location.href = selectedNotification.link!
                  }}
                  className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors text-sm font-medium"
                >
                  Voir plus
                </button>
              )}
              <button
                onClick={() => setSelectedNotification(null)}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors text-sm font-medium"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
