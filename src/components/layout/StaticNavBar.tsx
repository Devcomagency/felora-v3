'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useSession, signOut } from 'next-auth/react'
import Image from 'next/image'
import {
  Home, Search, MessageCircle, User, Settings, Bell, Menu,
  Map, Globe, LogIn, UserPlus, BarChart3, Calendar, Heart, Plus
} from 'lucide-react'
import NotificationBell from '@/components/notifications/NotificationBell'
import dynamic from 'next/dynamic'

const languages = [
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
  { code: 'it', label: 'Italiano', flag: '🇮🇹' }
]

const CameraHTML5 = dynamic(() => import('../camera/CameraHTML5'), { ssr: false })

export default function StaticNavBar() {
  const router = useRouter()
  const pathname = usePathname()
  const isMessages = pathname?.startsWith('/messages')
  const isAdmin = pathname?.startsWith('/admin')
  const { data: session, status } = useSession()
  const isAuthenticated = status === 'authenticated'
  const user = session?.user as any

  // États pour le menu burger - AVANT le return conditionnel
  const [showMenu, setShowMenu] = useState(false)
  const [showLanguageSelector, setShowLanguageSelector] = useState(false)
  const [showCameraMenu, setShowCameraMenu] = useState(false)
  const [currentLanguage, setCurrentLanguage] = useState('fr')
  const [hasNotifications, setHasNotifications] = useState(false)
  const [unreadConversations, setUnreadConversations] = useState(0)
  const [showCameraOverlay, setShowCameraOverlay] = useState(false)
  const [cameraMode, setCameraMode] = useState<'photo' | 'video' | null>(null)
  const galleryInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelected = (file: File | null) => {
    if (!file) return

    // Stocker le fichier dans window (survit à la navigation client-side de Next.js)
    ;(window as any).__pendingFile = file

    // Flag pour indiquer qu'un fichier attend
    sessionStorage.setItem('hasPendingFile', 'true')

    // Rediriger vers l'éditeur
    router.push('/camera?fromUpload=true')
  }

  const openCamera = (mode: 'photo' | 'video') => {
    setShowCameraMenu(false)
    setCameraMode(mode)
    setShowCameraOverlay(true)
  }

  const openGalleryPicker = () => {
    setShowCameraMenu(false)
    requestAnimationFrame(() => galleryInputRef.current?.click())
  }

  // Charger la langue sauvegardée
  useEffect(() => {
    const savedLanguage = localStorage.getItem('felora-language')
    if (savedLanguage) {
      setCurrentLanguage(savedLanguage)
    }
  }, [])

  // Simuler des notifications pour les utilisateurs connectés
  useEffect(() => {
    if (isAuthenticated) {
      const checkNotifications = () => {
        setHasNotifications(Math.random() > 0.7) // 30% de chance d'avoir des notifications
      }

      checkNotifications()
      const interval = setInterval(checkNotifications, 30000) // Vérifier toutes les 30s

      return () => clearInterval(interval)
    }
  }, [isAuthenticated])

  // Unread badge for messages (naïf: conversations with updatedAt > last-seen from localStorage)
  useEffect(() => {
    if (!isAuthenticated) { setUnreadConversations(0); return }
    let stopped = false
    const computeUnread = async () => {
      try {
        const res = await fetch('/api/e2ee/conversations/list')
        if (!res.ok) return
        const data = await res.json()
        const convs = Array.isArray(data?.conversations) ? data.conversations : []
        const count = convs.reduce((acc: number, c: any) => acc + (c.unreadCount > 0 ? 1 : 0), 0)
        if (!stopped) setUnreadConversations(count)
      } catch {}
    }
    computeUnread()
    const interval = setInterval(computeUnread, 30000)
    return () => { stopped = true; clearInterval(interval) }
  }, [isAuthenticated])

  // Fermer le menu en cliquant à l'extérieur
  useEffect(() => {
    if (showMenu) {
      const handleClickOutside = (event: MouseEvent) => {
        const target = event.target as Element
        if (!target.closest('[data-menu]')) {
          setShowMenu(false)
        }
      }

      document.addEventListener('click', handleClickOutside)
      return () => document.removeEventListener('click', handleClickOutside)
    }
  }, [showMenu])

  // Contrôle global du menu via événements (pour bouton burger dans les pages)
  useEffect(() => {
    const onOpen = () => setShowMenu(true)
    const onClose = () => setShowMenu(false)
    const onToggle = () => setShowMenu((v) => !v)
    window.addEventListener('felora:menu:open', onOpen as any)
    window.addEventListener('felora:menu:close', onClose as any)
    window.addEventListener('felora:menu:toggle', onToggle as any)
    return () => {
      window.removeEventListener('felora:menu:open', onOpen as any)
      window.removeEventListener('felora:menu:close', onClose as any)
      window.removeEventListener('felora:menu:toggle', onToggle as any)
    }
  }, [])

  // Ne pas afficher la navbar sur les pages admin - APRÈS tous les hooks
  if (isAdmin) {
    return null
  }

  const handleLanguageChange = (langCode: string) => {
    setCurrentLanguage(langCode)
    localStorage.setItem('felora-language', langCode)
    setShowLanguageSelector(false)
    // Ici on pourrait ajouter la logique de traduction
  }

  const navItems = (() => {
    const role = (user as any)?.role
    const isEscortOrClub = role === 'ESCORT' || role === 'CLUB'

    const items: any[] = [
      { id: 'home', icon: Home, label: 'Accueil', href: '/', active: pathname === '/' },
      { id: 'search', icon: Search, label: 'Recherche', href: '/search', active: pathname === '/search' },
    ]

    // Ajouter le bouton + au milieu pour escortes et clubs
    if (isEscortOrClub) {
      items.push({
        id: 'create',
        icon: Plus,
        label: 'Créer',
        onClick: () => {
          // Ouvrir le menu de sélection Photo/Vidéo
          setShowCameraMenu(true)
        },
        active: pathname === '/camera',
        special: true
      })
    }

    // Messages: visible pour tous sauf CLUB (les clubs n'ont pas accès à la messagerie)
    if (role !== 'CLUB') {
      items.push({ id: 'messages', icon: MessageCircle, label: 'Messages', href: '/messages', active: pathname === '/messages' })
    }

    // Profil: visible uniquement pour ESCORT et CLUB
    if (role === 'ESCORT') {
      // Rediriger vers le profil PUBLIC de l'escort
      const escortProfileId = (user as any)?.escortProfileId || (user as any)?.escortProfile?.id
      const profileHref = escortProfileId ? `/profile/${escortProfileId}` : '/dashboard-escort/profil'
      items.push({ id: 'profile', icon: User, label: 'Profil', href: profileHref, active: pathname?.startsWith('/profile') || pathname?.startsWith('/dashboard-escort') })
    } else if (role === 'CLUB') {
      // Rediriger vers le profil PUBLIC du club
      const clubHandle = (user as any)?.clubHandle || (user as any)?.clubProfile?.handle
      const profileHref = clubHandle ? `/profile-test/club/${clubHandle}` : '/club/profile'
      items.push({ id: 'profile', icon: User, label: 'Profil', href: profileHref, active: pathname?.startsWith('/profile') || pathname?.startsWith('/club') })
    }
    // ✅ Pas d'onglet profil pour les clients/non-connectés

    return items
  })()

  const currentLang = languages.find(lang => lang.code === currentLanguage)

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
                onClick={() => item.onClick ? item.onClick() : router.push(item.href)}
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


      {/* Notification Bell - Uniquement pour les utilisateurs connectés (pas admin, pas /messages) */}
      {!isMessages && isAuthenticated && !pathname?.startsWith('/admin') && (
        <div className="fixed top-4 right-16 z-[1002]">
          <NotificationBell />
        </div>
      )}

      {/* Bouton menu burger - caché sur /messages */}
      {!isMessages && (
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
        
        {/* Badge de notification */}
        {hasNotifications && (
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-[#FF6B9D] rounded-full border border-black" />
        )}
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
                    onClick={() => { router.push('/'); setShowMenu(false) }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-white/90 hover:text-white transition-colors text-left"
                  >
                    <Home size={18} className="text-white/70" />
                    <span className="text-sm font-medium">Accueil</span>
                  </motion.button>
                  <motion.button
                    whileHover={{ backgroundColor: "rgba(255, 255, 255, 0.04)" }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => { router.push('/search'); setShowMenu(false) }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-white/90 hover:text-white transition-colors text-left"
                  >
                    <Search size={18} className="text-white/70" />
                    <span className="text-sm font-medium">Recherche</span>
                  </motion.button>

                  <motion.button
                    whileHover={{ backgroundColor: "rgba(255, 255, 255, 0.04)" }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => { router.push('/map'); setShowMenu(false) }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-white/90 hover:text-white transition-colors text-left"
                  >
                    <Map size={18} className="text-white/70" />
                    <span className="text-sm font-medium">Carte</span>
                  </motion.button>

                  <motion.button
                    whileHover={{ backgroundColor: "rgba(255, 255, 255, 0.04)" }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowLanguageSelector(!showLanguageSelector)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-white/90 hover:text-white transition-colors text-left"
                  >
                    <Globe size={18} className="text-white/70" />
                    <div className="flex items-center gap-2 flex-1">
                      <span className="text-sm font-medium">Langue</span>
                      <span className="text-xs">{currentLang?.flag}</span>
                    </div>
                  </motion.button>

                  {(() => {
                    const isClubContext = (user?.role === 'CLUB') || pathname?.startsWith('/club')
                    const settingsHref = isClubContext ? '/club/settings' : (user?.role === 'ESCORT' ? '/escort/settings' : '/settings')
                    const settingsLabel = isClubContext ? 'Paramètres (Club)' : 'Paramètres'
                    return (
                      <motion.button
                        whileHover={{ backgroundColor: "rgba(255, 255, 255, 0.04)" }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => { router.push(settingsHref); setShowMenu(false) }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-white/90 hover:text-white transition-colors text-left"
                      >
                        <Settings size={18} className="text-white/70" />
                        <span className="text-sm font-medium">{settingsLabel}</span>
                      </motion.button>
                    )
                  })()}
                </div>

                {/* Authentification */}
                {!isAuthenticated ? (
                  <div className="space-y-1 pt-2 border-t border-white/[0.06]">
                    <motion.button
                      whileHover={{ backgroundColor: "rgba(255, 107, 157, 0.15)" }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => { router.push('/register'); setShowMenu(false) }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left bg-gradient-to-r from-pink-500/10 to-purple-500/10 border border-pink-500/20"
                    >
                      <UserPlus size={18} className="text-pink-400" />
                      <span className="text-sm font-medium text-pink-300">S'inscrire</span>
                    </motion.button>

                    <motion.button
                      whileHover={{ backgroundColor: "rgba(255, 255, 255, 0.04)" }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => { router.push('/login'); setShowMenu(false) }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-white/90 hover:text-white transition-colors text-left"
                    >
                      <LogIn size={18} className="text-white/70" />
                      <span className="text-sm font-medium">Se connecter</span>
                    </motion.button>
                  </div>
                ) : (
                  <div className="space-y-1 pt-2 border-t border-white/[0.06]">
                    {/* Toggle admin v2 */}
                    {user?.role === 'ADMIN' && (
                      <motion.button
                        whileHover={{ backgroundColor: "rgba(255, 255, 255, 0.04)" }}
                        whileTap={{ scale: 0.98 }}
                      onClick={() => { router.push('/dashboard-escort/statistiques'); setShowMenu(false) }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-white/90 hover:text-white transition-colors text-left"
                      >
                        <BarChart3 size={18} className="text-white/70" />
                        <span className="text-sm font-medium">Essayer la nouvelle version (v2)</span>
                      </motion.button>
                    )}
                    {/* Dashboard pour escortes */}
                    {user?.role === 'ESCORT' && (
                      <>
                        <motion.button
                          whileHover={{ backgroundColor: "rgba(255, 255, 255, 0.04)" }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => { router.push('/dashboard-escort/profil'); setShowMenu(false) }}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-white/90 hover:text-white transition-colors text-left"
                        >
                          <BarChart3 size={18} className="text-white/70" />
                          <span className="text-sm font-medium">Dashboard</span>
                        </motion.button>

                        <motion.button
                          whileHover={{ backgroundColor: "rgba(255, 255, 255, 0.04)" }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => { router.push('/dashboard-escort/activite'); setShowMenu(false) }}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-white/90 hover:text-white transition-colors text-left"
                        >
                          <Calendar size={18} className="text-white/70" />
                          <span className="text-sm font-medium">Agenda</span>
                        </motion.button>
                      </>
                    )}
                    {/* Dashboard pour clubs */}
                    {user?.role === 'CLUB' && (
                      <motion.button
                        whileHover={{ backgroundColor: "rgba(255, 255, 255, 0.04)" }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => { router.push('/club/profile'); setShowMenu(false) }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-white/90 hover:text-white transition-colors text-left"
                      >
                        <BarChart3 size={18} className="text-white/70" />
                        <span className="text-sm font-medium">Dashboard</span>
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
                      <span className="text-sm font-medium">Déconnexion</span>
                    </motion.button>
                  </div>
                )}

                {/* Légal */}
                <div className="mt-3 pt-2 border-t border-white/[0.06]">
                  <div className="px-3 py-1 text-xs text-white/50">Légal</div>
                  <div className="flex items-center gap-2 px-3 py-1">
                    <button onClick={() => { router.push('/legal/privacy'); setShowMenu(false) }} className="text-xs text-white/70 hover:text-white underline">Confidentialité</button>
                    <span className="text-white/30">•</span>
                    <button onClick={() => { router.push('/legal/terms'); setShowMenu(false) }} className="text-xs text-white/70 hover:text-white underline">Conditions</button>
                    <span className="text-white/30">•</span>
                    <button onClick={() => { router.push('/legal/cookies'); setShowMenu(false) }} className="text-xs text-white/70 hover:text-white underline">Cookies</button>
                  </div>
                </div>
              </div>
            </div>

            {/* Sous-menu langues */}
            <AnimatePresence>
              {showLanguageSelector && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="mt-2 bg-white/[0.02] backdrop-blur-2xl border border-white/[0.08] rounded-xl shadow-xl shadow-black/20 overflow-hidden"
                >
                  {languages.map((lang) => (
                    <motion.button
                      key={lang.code}
                      whileHover={{ backgroundColor: "rgba(255, 255, 255, 0.04)" }}
                      onClick={() => handleLanguageChange(lang.code)}
                      className={`
                        w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors
                        ${currentLanguage === lang.code 
                          ? 'text-pink-300 bg-pink-500/10' 
                          : 'text-white/80 hover:text-white'
                        }
                      `}
                    >
                      <span className="text-lg">{lang.flag}</span>
                      <span className="text-sm font-medium">{lang.label}</span>
                    </motion.button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {showCameraOverlay && cameraMode && (
          <CameraHTML5
            initialMode={cameraMode}
            onClose={() => {
              setShowCameraOverlay(false)
              setCameraMode(null)
            }}
            onCapture={(file) => {
              setShowCameraOverlay(false)
              setCameraMode(null)
              handleFileSelected(file)
            }}
          />
        )}
      </AnimatePresence>
      <input
        ref={galleryInputRef}
        type="file"
        accept="image/*,video/*"
        className="hidden"
        multiple={false}
        onChange={(event) => {
          const file = event.target.files?.[0] || null
          handleFileSelected(file)
          event.target.value = ''
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

      {/* Menu Créer (Photo/Vidéo) */}
      <AnimatePresence>
        {showCameraMenu && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCameraMenu(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9998]"
            />

            {/* Action Sheet */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 z-[9999] pb-safe"
            >
              <div className="bg-gradient-to-b from-[#1A1A1A] to-[#0D0D0D] border-t border-white/10 rounded-t-3xl shadow-2xl">
                {/* Header */}
                <div className="px-6 py-4 border-b border-white/5">
                  <h3 className="text-lg font-semibold text-white">Créer un contenu</h3>
                  <p className="text-sm text-white/60 mt-1">Choisissez le type de média</p>
                </div>

                {/* Options */}
                <div className="p-4 space-y-2">
                  {/* Photo */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => openCamera('photo')}
                    className="w-full flex items-center gap-4 p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl transition-all group"
                  >
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <div className="flex-1 text-left">
                      <h4 className="font-semibold text-white group-hover:text-cyan-400 transition-colors">Photo</h4>
                      <p className="text-sm text-white/60">Prendre une photo</p>
                    </div>
                    <svg className="w-5 h-5 text-white/40 group-hover:text-white/60 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </motion.button>

                  {/* Vidéo */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => openCamera('video')}
                    className="w-full flex items-center gap-4 p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl transition-all group"
                  >
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div className="flex-1 text-left">
                      <h4 className="font-semibold text-white group-hover:text-pink-400 transition-colors">Vidéo</h4>
                      <p className="text-sm text-white/60">Filmer une vidéo</p>
                    </div>
                    <svg className="w-5 h-5 text-white/40 group-hover:text-white/60 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </motion.button>

                  {/* Upload */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={openGalleryPicker}
                    className="w-full flex items-center gap-4 p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl transition-all group"
                  >
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-violet-500 flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                    </div>
                    <div className="flex-1 text-left">
                      <h4 className="font-semibold text-white group-hover:text-purple-400 transition-colors">Upload</h4>
                      <p className="text-sm text-white/60">Importer photo/vidéo</p>
                    </div>
                    <svg className="w-5 h-5 text-white/40 group-hover:text-white/60 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </motion.button>
                </div>

                {/* Annuler */}
                <div className="p-4 pt-2">
                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowCameraMenu(false)}
                    className="w-full py-3 text-white/80 hover:text-white font-medium transition-colors"
                  >
                    Annuler
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
