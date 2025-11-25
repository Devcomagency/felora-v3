'use client'

import React, { useState, useEffect, useRef, useCallback, useTransition } from 'react'
import { useRouter as useNextRouter, usePathname as useNextPathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useSession, signOut } from 'next-auth/react'
import Image from 'next/image'
import {
  Home, Search, MessageCircle, User, Settings, Bell, Menu,
  Map, Globe, LogIn, UserPlus, BarChart3, Calendar, Heart, Plus
} from 'lucide-react'
import NotificationBell from '@/components/notifications/NotificationBell'
import dynamic from 'next/dynamic'
import { toast } from 'sonner'
import { useTranslations, useLocale } from 'next-intl'
import { useRouter, usePathname } from '@/i18n/routing'
import { languageMetadata } from '@/i18n/routing'
import { useNotificationsWithSSE } from '@/hooks/useNotifications'

// Convertir languageMetadata en array pour le sélecteur
const languages = Object.entries(languageMetadata).map(([code, meta]) => ({
  code,
  label: meta.label,
  flag: meta.flag,
  native: meta.native,
  rtl: meta.rtl
}))

export default function StaticNavBar() {
  const router = useRouter()
  const pathname = usePathname()
  const nextRouter = useNextRouter()
  const nextPathname = useNextPathname()
  const locale = useLocale()
  const t = useTranslations('navigation')
  const tCommon = useTranslations('common')
  const [isPending, startTransition] = useTransition()

  const isMessages = nextPathname?.startsWith('/messages')
  const isAdmin = nextPathname?.startsWith('/admin')
  const isMap = nextPathname?.startsWith('/map')
  const { data: session, status } = useSession()
  const isAuthenticated = status === 'authenticated'
  const user = session?.user as any

  // États pour le menu burger - AVANT le return conditionnel
  const [showMenu, setShowMenu] = useState(false)
  const [showLanguageSelector, setShowLanguageSelector] = useState(false)
  const [unreadConversations, setUnreadConversations] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelected = (file: File | null) => {
    if (!file) return

    console.log('📸 Fichier capturé depuis navbar:', file.name, file.type)

    // Créer Object URL
    const objectURL = URL.createObjectURL(file)

    // Stocker dans sessionStorage
    sessionStorage.setItem('pendingFileURL', objectURL)
    sessionStorage.setItem('pendingFileName', file.name)
    sessionStorage.setItem('pendingFileType', file.type)
    sessionStorage.setItem('pendingFileSize', file.size.toString())

    // Stocker dans window
    ;(window as any).__pendingFile = file
    ;(window as any).__pendingFileURL = objectURL

    // Rediriger vers l'éditeur
    nextRouter.push('/camera?fromUpload=true')
  }

  // Ouvrir la caméra native via input file
  const openNativeCamera = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  const handleFavoritesClick = useCallback(() => {
    if (!isAuthenticated) {
      console.log('🔒 [FAVORITES] Utilisateur non connecté, affichage toast')
      toast.info(tCommon('loginRequired') || 'Connectez-vous pour accéder à vos favoris', {
        duration: 4000,
      })
      setShowMenu(false)
      return
    }
    nextRouter.push('/favorites')
    setShowMenu(false)
  }, [isAuthenticated, nextRouter, setShowMenu, tCommon])

  // 🔥 SUPPRIMÉ : Badge de notification simulé avec Math.random()
  // Maintenant géré par NotificationBell avec le hook unifié useNotifications

  // 🚀 Utiliser SSE pour les notifications messages en temps réel
  const { notifications: messageNotifications, refresh: refreshMessages } = useNotificationsWithSSE({
    channel: 'messages',
    refreshInterval: 10000 // Fallback polling toutes les 10s
  })

  // Unread badge for messages (compte les conversations non lues + notifications MESSAGE_RECEIVED non lues)
  useEffect(() => {
    if (!isAuthenticated) { setUnreadConversations(0); return }
    let stopped = false
    const computeUnread = async () => {
      try {
        // Récupérer les conversations
        const res = await fetch('/api/e2ee/conversations/list')
        if (!res.ok) return
        const data = await res.json()
        const convs = Array.isArray(data?.conversations) ? data.conversations : []

        // Compter : conversations avec unreadCount > 0 OU notifications non lues
        const convCount = convs.reduce((acc: number, c: any) => acc + (c.unreadCount > 0 ? 1 : 0), 0)
        const unreadMessageNotifsCount = messageNotifications.filter((n: any) => !n.read).length
        const totalCount = Math.max(convCount, unreadMessageNotifsCount)

        if (!stopped) setUnreadConversations(totalCount)
      } catch {}
    }
    computeUnread()
    const interval = setInterval(computeUnread, 10000) // Réduire à 10s
    return () => { stopped = true; clearInterval(interval) }
  }, [isAuthenticated, messageNotifications])

  // 🔥 Écouter les événements globaux de rafraîchissement des conversations
  useEffect(() => {
    const handleRefresh = () => {
      refreshMessages() // Rafraîchir immédiatement le badge
    }

    window.addEventListener('felora:messages:refresh', handleRefresh)
    return () => window.removeEventListener('felora:messages:refresh', handleRefresh)
  }, [refreshMessages])

  // 🚀 OPTIMISÉ : Factoriser les listeners window (menu + langues)
  useEffect(() => {
    // Fermer le menu en cliquant à l'extérieur
    const handleClickOutside = (event: MouseEvent) => {
      if (showMenu) {
        const target = event.target as Element
        if (!target.closest('[data-menu]')) {
          setShowMenu(false)
        }
      }
    }

    // Contrôle global du menu via événements
    const onOpen = () => setShowMenu(true)
    const onClose = () => setShowMenu(false)
    const onToggle = () => setShowMenu((v) => !v)

    // Ajouter tous les listeners en une fois
    if (showMenu) {
      document.addEventListener('click', handleClickOutside)
    }
    window.addEventListener('felora:menu:open', onOpen as any)
    window.addEventListener('felora:menu:close', onClose as any)
    window.addEventListener('felora:menu:toggle', onToggle as any)

    // Cleanup
    return () => {
      document.removeEventListener('click', handleClickOutside)
      window.removeEventListener('felora:menu:open', onOpen as any)
      window.removeEventListener('felora:menu:close', onClose as any)
      window.removeEventListener('felora:menu:toggle', onToggle as any)
    }
  }, [showMenu])

  // Ne pas afficher la navbar sur les pages admin - APRÈS tous les hooks
  if (isAdmin) {
    return null
  }

  const handleLanguageChange = (langCode: string) => {
    setShowLanguageSelector(false)
    setShowMenu(false)

    // Définir le cookie de langue manuellement
    document.cookie = `NEXT_LOCALE=${langCode}; path=/; max-age=31536000; SameSite=Lax`

    // Recharger la page pour appliquer la nouvelle langue
    startTransition(() => {
      window.location.reload()
    })
  }

  const navItems = (() => {
    const role = (user as any)?.role
    const isEscortOrClub = role === 'ESCORT' || role === 'CLUB'

    const items: any[] = [
      { id: 'home', icon: Home, label: t('home'), href: '/', active: nextPathname === '/' },
      { id: 'search', icon: Search, label: t('search'), href: '/search', active: nextPathname === '/search' },
    ]

    // Ajouter le bouton + au milieu pour escortes et clubs
    if (isEscortOrClub) {
      items.push({
        id: 'create',
        icon: Plus,
        label: tCommon('create') || 'Créer',
        onClick: () => {
          // Rediriger vers la page de publication
          nextRouter.push('/publish')
        },
        active: nextPathname === '/publish',
        special: true
      })
    }

    // Messages: visible pour tous sauf CLUB (les clubs n'ont pas accès à la messagerie)
    if (role !== 'CLUB') {
      items.push({ id: 'messages', icon: MessageCircle, label: t('messages'), href: '/messages', active: nextPathname === '/messages' })
    }

    // Profil: visible uniquement pour ESCORT et CLUB
    if (role === 'ESCORT') {
      // Rediriger vers le profil PUBLIC de l'escort
      const escortProfileId = (user as any)?.escortProfileId || (user as any)?.escortProfile?.id
      const profileHref = escortProfileId ? `/profile/${escortProfileId}` : '/dashboard-escort/profil'
      items.push({ id: 'profile', icon: User, label: t('profile'), href: profileHref, active: nextPathname?.startsWith('/profile') || nextPathname?.startsWith('/dashboard-escort') })
    } else if (role === 'CLUB') {
      // Rediriger vers le profil PUBLIC du club
      const clubHandle = (user as any)?.clubHandle || (user as any)?.clubProfile?.handle
      const profileHref = clubHandle ? `/profile-test/club/${clubHandle}` : '/club/profile'
      items.push({ id: 'profile', icon: User, label: t('profile'), href: profileHref, active: nextPathname?.startsWith('/profile') || nextPathname?.startsWith('/club') })
    }
    // ✅ Pas d'onglet profil pour les clients/non-connectés

    return items
  })()

  const currentLang = languages.find(lang => lang.code === locale)

  return (
    <>
      {/* Navigation Bar - Style TikTok moderne - Cachée en mode caméra */}
      <div data-static-nav="true" className="fixed bottom-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-lg border-t border-white/5 transition-transform duration-300">
        <div className="flex items-center justify-around h-16 px-2">
          {navItems.map(item => {
            const Icon = item.icon
            const shouldShow = !item.requiresAuth || isAuthenticated
            
            if (!shouldShow) return null

            return (
              <motion.button
                key={item.id}
                whileTap={{ scale: 0.9 }}
                whileHover={item.special ? { scale: 1.05, boxShadow: '0 8px 16px rgba(255, 107, 157, 0.4)' } : {}}
                onClick={() => item.onClick ? item.onClick() : nextRouter.push(item.href)}
                className={`
                  relative flex flex-col items-center justify-center px-3 py-2 rounded-xl
                  transition-all duration-300 min-w-[60px]
                  ${item.special
                    ? 'border border-[#FF6B9D]/50 text-white'
                    : item.active
                      ? 'text-[#FF6B9D] bg-[#FF6B9D]/10'
                      : 'text-white/70 hover:text-white hover:bg-white/5'
                  }
                `}
                style={item.special ? {
                  background: 'linear-gradient(to right, rgba(255, 107, 157, 0.3), rgba(183, 148, 246, 0.2))',
                  boxShadow: '0 4px 12px rgba(255, 107, 157, 0.2)'
                } : undefined}
              >
                <Icon size={item.special ? 24 : 22} className={item.special ? "" : "mb-1"} />
                {!item.special && <span className="text-xs font-medium">{item.label}</span>}
                {item.id === 'messages' && unreadConversations > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-pink-500 text-white text-[10px] flex items-center justify-center">
                    {unreadConversations > 9 ? '9+' : unreadConversations}
                  </span>
                )}
              </motion.button>
            )
          })}
        </div>
      </div>


      {/* Notification Bell - Uniquement pour les utilisateurs connectés (pas admin, pas /messages, pas /map) */}
      {!isMessages && !isMap && isAuthenticated && !pathname?.startsWith('/admin') && (
        <div className="fixed top-4 right-16 z-[1002]">
          <NotificationBell />
        </div>
      )}

      {/* Bouton menu burger - caché sur /messages et /map */}
      {!isMessages && !isMap && (
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setShowMenu(!showMenu)}
        data-menu
        className="fixed top-4 right-4 w-10 h-10 flex items-center justify-center rounded-xl bg-black/60 backdrop-blur-sm border border-white/10 hover:bg-black/70 hover:border-white/20 transition-all duration-200 text-white z-[1002] shadow-[0_4px_16px_rgba(0,0,0,0.35)]"
      >
        <div className="flex flex-col items-center justify-center w-4 h-4">
          <motion.span
            animate={{
              rotate: showMenu ? 45 : 0,
              y: showMenu ? 2 : -2
            }}
            className="w-4 h-0.5 bg-current rounded-full origin-center"
          />
          <motion.span
            animate={{
              opacity: showMenu ? 0 : 1,
              scale: showMenu ? 0 : 1
            }}
            className="w-4 h-0.5 bg-current rounded-full my-0.5"
          />
          <motion.span
            animate={{
              rotate: showMenu ? -45 : 0,
              y: showMenu ? -2 : 2
            }}
            className="w-4 h-0.5 bg-current rounded-full origin-center"
          />
        </div>

        {/* Badge de notification supprimé (géré par NotificationBell) */}
      </motion.button>
      )}

      {/* Menu hamburger - Design moderne 2025 */}
      <AnimatePresence>
        {!isMessages && showMenu && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ type: "spring", duration: 0.2, bounce: 0 }}
            data-menu
            className="fixed top-16 right-2 sm:right-4 w-72 max-w-[calc(100vw-1rem)] z-[1003]"
          >
            <div className="bg-white/[0.02] backdrop-blur-2xl border border-white/[0.08] rounded-2xl shadow-2xl shadow-black/20 overflow-hidden">
              
              {/* Header du menu */}
              <div className="px-4 py-3 border-b border-white/[0.06]">
                <div className="flex items-center gap-3">
                  {isAuthenticated && user?.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name || 'User'}
                      className="w-8 h-8 rounded-full object-cover border border-white/20"
                    />
                  ) : (
                    <Image
                      src="/logo-principal.png"
                      alt="Felora"
                      width={isAuthenticated && user?.role === 'CLIENT' ? 40 : 50}
                      height={isAuthenticated && user?.role === 'CLIENT' ? 40 : 50}
                      className="rounded-full object-cover"
                    />
                  )}
                  <div>
                    <h3 className="text-white font-medium text-sm">
                      {isAuthenticated && user?.name ? user.name.toUpperCase() : 'FELORA'}
                    </h3>
                    <p className="text-white/60 text-xs">
                      {isAuthenticated ? (user?.role === 'ESCORT' ? 'Escort' : user?.role === 'CLUB' ? 'Club' : 'Client') : 'Plateforme Premium'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Menu Items */}
              <div className="p-2">
                
                {/* Navigation principale */}
                <div className="space-y-1 mb-2">
                  <motion.button
                    whileHover={{ backgroundColor: "rgba(255, 255, 255, 0.04)" }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => { nextRouter.push('/'); setShowMenu(false) }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-white/90 hover:text-white transition-colors text-left"
                  >
                    <Home size={18} className="text-white/70" />
                    <span className="text-sm font-medium">{t('home')}</span>
                  </motion.button>
                  <motion.button
                    whileHover={{ backgroundColor: "rgba(255, 255, 255, 0.04)" }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => { nextRouter.push('/search'); setShowMenu(false) }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-white/90 hover:text-white transition-colors text-left"
                  >
                    <Search size={18} className="text-white/70" />
                    <span className="text-sm font-medium">{t('search')}</span>
                  </motion.button>

                  <motion.button
                    whileHover={{ backgroundColor: "rgba(255, 255, 255, 0.04)" }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => { nextRouter.push('/map'); setShowMenu(false) }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-white/90 hover:text-white transition-colors text-left"
                  >
                    <Map size={18} className="text-white/70" />
                    <span className="text-sm font-medium">{t('map')}</span>
                  </motion.button>

                  <motion.button
                    whileHover={{ backgroundColor: "rgba(255, 255, 255, 0.04)" }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleFavoritesClick}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-white/90 hover:text-white transition-colors text-left"
                  >
                    <Heart size={18} className="text-white/70" />
                    <span className="text-sm font-medium">{t('favorites')}</span>
                  </motion.button>

                  <motion.button
                    whileHover={{ backgroundColor: "rgba(255, 255, 255, 0.04)" }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowLanguageSelector(!showLanguageSelector)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-white/90 hover:text-white transition-colors text-left"
                  >
                    <Globe size={18} className="text-white/70" />
                    <div className="flex items-center gap-2 flex-1">
                      <span className="text-sm font-medium">{tCommon('language') || 'Langue'}</span>
                      <span className="text-xs">{currentLang?.flag}</span>
                    </div>
                    <motion.svg
                      animate={{ rotate: showLanguageSelector ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                      className="text-white/50"
                    >
                      <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </motion.svg>
                  </motion.button>

                  {/* Sous-menu langues intégré - Déroulant dans le menu */}
                  <AnimatePresence>
                    {showLanguageSelector && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="pl-9 pr-2 py-1 max-h-64 overflow-y-auto custom-scrollbar">
                          {languages.map((lang) => (
                            <motion.button
                              key={lang.code}
                              whileHover={{ backgroundColor: "rgba(255, 255, 255, 0.04)" }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => handleLanguageChange(lang.code)}
                              className={`
                                w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left transition-colors
                                ${locale === lang.code
                                  ? 'text-pink-300 bg-pink-500/10 border border-pink-500/20'
                                  : 'text-white/80 hover:text-white'
                                }
                              `}
                              dir={lang.rtl ? 'rtl' : 'ltr'}
                            >
                              <span className="text-base">{lang.flag}</span>
                              <div className="flex flex-col flex-1 min-w-0">
                                <span className="text-xs font-medium truncate">{lang.native}</span>
                                {lang.native !== lang.label && (
                                  <span className="text-[10px] text-white/40 truncate">{lang.label}</span>
                                )}
                              </div>
                              {locale === lang.code && (
                                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="text-pink-400 flex-shrink-0">
                                  <path d="M13.5 4.5L6 12L2.5 8.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                              )}
                            </motion.button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {isAuthenticated && (
                    <motion.button
                      whileHover={{ backgroundColor: "rgba(255, 255, 255, 0.04)" }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => { nextRouter.push('/settings'); setShowMenu(false) }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-white/90 hover:text-white transition-colors text-left"
                    >
                      <Settings size={18} className="text-white/70" />
                      <span className="text-sm font-medium">{t('settings')}</span>
                    </motion.button>
                  )}
                </div>

                {/* Authentification */}
                {!isAuthenticated ? (
                  <div className="space-y-1 pt-2 border-t border-white/[0.06]">
                    <motion.button
                      whileHover={{ backgroundColor: "rgba(255, 107, 157, 0.15)" }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => { nextRouter.push('/register'); setShowMenu(false) }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left bg-gradient-to-r from-pink-500/10 to-purple-500/10 border border-pink-500/20"
                    >
                      <UserPlus size={18} className="text-pink-400" />
                      <span className="text-sm font-medium text-pink-300">{t('register')}</span>
                    </motion.button>

                    <motion.button
                      whileHover={{ backgroundColor: "rgba(255, 255, 255, 0.04)" }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => { nextRouter.push('/login'); setShowMenu(false) }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-white/90 hover:text-white transition-colors text-left"
                    >
                      <LogIn size={18} className="text-white/70" />
                      <span className="text-sm font-medium">{t('login')}</span>
                    </motion.button>

                    <motion.a
                      href="mailto:support@felora.com?subject=Contact"
                      whileHover={{ backgroundColor: "rgba(255, 255, 255, 0.04)" }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setShowMenu(false)}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-white/90 hover:text-white transition-colors text-left"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white/70">
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                        <polyline points="22,6 12,13 2,6" />
                      </svg>
                      <span className="text-sm font-medium">{tCommon('contactUs') || 'Nous contacter'}</span>
                    </motion.a>
                  </div>
                ) : (
                  <div className="space-y-1 pt-2 border-t border-white/[0.06]">
                    {/* Toggle admin v2 */}
                    {user?.role === 'ADMIN' && (
                      <motion.button
                        whileHover={{ backgroundColor: "rgba(255, 255, 255, 0.04)" }}
                        whileTap={{ scale: 0.98 }}
                      onClick={() => { nextRouter.push('/dashboard-escort/statistiques'); setShowMenu(false) }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-white/90 hover:text-white transition-colors text-left"
                      >
                        <BarChart3 size={18} className="text-white/70" />
                        <span className="text-sm font-medium">Essayer la nouvelle version (v2)</span>
                      </motion.button>
                    )}
                    {/* Mon profil pour escortes */}
                    {user?.role === 'ESCORT' && (
                      <motion.button
                        whileHover={{ backgroundColor: "rgba(255, 255, 255, 0.04)" }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => { nextRouter.push('/dashboard-escort/profil'); setShowMenu(false) }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-white/90 hover:text-white transition-colors text-left"
                      >
                        <User size={18} className="text-white/70" />
                        <span className="text-sm font-medium">{tCommon('myProfile') || 'Mon profil'}</span>
                      </motion.button>
                    )}
                    {/* Mon profil pour clubs */}
                    {user?.role === 'CLUB' && (
                      <motion.button
                        whileHover={{ backgroundColor: "rgba(255, 255, 255, 0.04)" }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => { nextRouter.push('/club/profile'); setShowMenu(false) }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-white/90 hover:text-white transition-colors text-left"
                      >
                        <User size={18} className="text-white/70" />
                        <span className="text-sm font-medium">{tCommon('myProfile') || 'Mon profil'}</span>
                      </motion.button>
                    )}

                    {/* Déconnexion */}
                    <motion.button
                      whileHover={{ backgroundColor: "rgba(239, 68, 68, 0.1)" }}
                      whileTap={{ scale: 0.98 }}
                      onClick={async () => { try { await signOut({ callbackUrl: '/' }) } catch {}; setShowMenu(false) }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-400/90 hover:text-red-400 transition-colors text-left"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-red-400/70">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                        <polyline points="16,17 21,12 16,7"/>
                        <line x1="21" y1="12" x2="9" y2="12"/>
                      </svg>
                      <span className="text-sm font-medium">{t('logout')}</span>
                    </motion.button>
                  </div>
                )}

                {/* Légal */}
                <div className="mt-3 pt-2 border-t border-white/[0.06]">
                  <div className="px-3 py-1 text-xs text-white/50">{tCommon('legal') || 'Légal'}</div>
                  <div className="flex items-center gap-2 px-3 py-1">
                    <button onClick={() => { nextRouter.push('/legal/privacy'); setShowMenu(false) }} className="text-xs text-white/70 hover:text-white underline">{tCommon('privacy') || 'Confidentialité'}</button>
                    <span className="text-white/30">•</span>
                    <button onClick={() => { nextRouter.push('/legal/terms'); setShowMenu(false) }} className="text-xs text-white/70 hover:text-white underline">{tCommon('terms') || 'Conditions'}</button>
                    <span className="text-white/30">•</span>
                    <button onClick={() => { nextRouter.push('/legal/cookies'); setShowMenu(false) }} className="text-xs text-white/70 hover:text-white underline">{tCommon('cookies') || 'Cookies'}</button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input caché pour la caméra native */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,video/*"
        capture="environment"
        className="hidden"
        onChange={(e) => {
          console.log('📸 [StaticNavBar] onChange triggered, files:', e.target.files)
          const file = e.target.files?.[0]
          if (file) {
            console.log('📸 [StaticNavBar] File found:', file.name, file.type, file.size)
            handleFileSelected(file)
          } else {
            console.log('⚠️ [StaticNavBar] No file found in onChange')
          }
          e.target.value = '' // Reset pour permettre de re-sélectionner le même fichier
        }}
      />

      {/* Overlay pour fermer le menu */}
      <AnimatePresence>
        {!isMessages && showMenu && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowMenu(false)}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[1001]"
          />
        )}
      </AnimatePresence>

    </>
  )
}
