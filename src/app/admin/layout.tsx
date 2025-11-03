'use client'

import React, { useState } from 'react'
import { usePathname } from 'next/navigation'
import {
  Shield, Users, UserCircle, Building2, Image, AlertTriangle,
  CreditCard, Gem, Gift, MessageSquare, BarChart3, Settings,
  Mail, Lock, FileText, Headphones, Target, ChevronDown, ChevronRight, LogOut
} from 'lucide-react'

interface NavSection {
  title: string
  icon: React.ElementType
  href?: string
  badge?: string
  children?: { title: string; href: string }[]
}

const navSections: NavSection[] = [
  {
    title: 'KYC & Vérification',
    icon: Shield,
    href: '/admin/kyc'
  },
  {
    title: 'Gestion Utilisateurs',
    icon: Users,
    href: '/admin/users'
  },
  {
    title: 'Gestion Clubs',
    icon: Building2,
    href: '/admin/clubs'
  },
  {
    title: 'Modération Médias',
    icon: Image,
    href: '/admin/media'
  },
  {
    title: 'Signalements',
    icon: AlertTriangle,
    href: '/admin/reports'
  },
  {
    title: 'Paiements',
    icon: CreditCard,
    children: [
      { title: 'Transactions', href: '/admin/payments' },
      { title: 'Historique', href: '/admin/payments/history' },
      { title: 'Remboursements', href: '/admin/payments/refunds' },
      { title: 'Statistiques', href: '/admin/payments/stats' }
    ]
  },
  {
    title: 'Système Diamonds',
    icon: Gem,
    children: [
      { title: 'Prix des packs', href: '/admin/diamonds/pricing' },
      { title: 'Historique achats', href: '/admin/diamonds/purchases' },
      { title: 'Créditer diamonds', href: '/admin/diamonds/credit' }
    ]
  },
  {
    title: 'Gestion Cadeaux',
    icon: Gift,
    children: [
      { title: 'Liste cadeaux', href: '/admin/gifts' },
      { title: 'Créer cadeau', href: '/admin/gifts/create' },
      { title: 'Statistiques', href: '/admin/gifts/stats' }
    ]
  },
  {
    title: 'Modération Messages',
    icon: MessageSquare,
    children: [
      { title: 'Conversations signalées', href: '/admin/messages/reported' },
      { title: 'Spam détecté', href: '/admin/messages/spam' },
      { title: 'Statistiques', href: '/admin/messages/stats' }
    ]
  },
  {
    title: 'Analytics',
    icon: BarChart3,
    children: [
      { title: 'Dashboard', href: '/admin/analytics' },
      { title: 'Utilisateurs', href: '/admin/analytics/users' },
      { title: 'Revenus', href: '/admin/analytics/revenue' },
      { title: 'Contenu', href: '/admin/analytics/content' }
    ]
  },
  {
    title: 'Paramètres App',
    icon: Settings,
    children: [
      { title: 'Catégories', href: '/admin/settings/categories' },
      { title: 'Services', href: '/admin/settings/services' },
      { title: 'Zones géo', href: '/admin/settings/locations' },
      { title: 'Paiements', href: '/admin/settings/payment-methods' }
    ]
  },
  {
    title: 'Communications',
    icon: Mail,
    children: [
      { title: 'Emails en masse', href: '/admin/comms/emails' },
      { title: 'Notifications push', href: '/admin/comms/push' },
      { title: 'Annonces', href: '/admin/comms/announcements' },
      { title: 'Templates', href: '/admin/comms/templates' }
    ]
  },
  {
    title: 'Sécurité & Logs',
    icon: Lock,
    children: [
      { title: 'Logs activité', href: '/admin/security/logs' },
      { title: 'Connexions suspectes', href: '/admin/security/suspicious' },
      { title: 'Export RGPD', href: '/admin/security/gdpr' }
    ]
  },
  {
    title: 'Contenu & Pages',
    icon: FileText,
    children: [
      { title: 'CGU/CGV', href: '/admin/content/terms' },
      { title: 'Confidentialité', href: '/admin/content/privacy' },
      { title: 'FAQ', href: '/admin/content/faq' },
      { title: 'Bannières', href: '/admin/content/banners' }
    ]
  },
  {
    title: 'Support Client',
    icon: Headphones,
    children: [
      { title: 'Tickets', href: '/admin/support/tickets' },
      { title: 'Messages', href: '/admin/support/messages' },
      { title: 'Historique', href: '/admin/support/history' }
    ]
  },
  {
    title: 'Marketing',
    icon: Target,
    children: [
      { title: 'Codes promo', href: '/admin/marketing/promos' },
      { title: 'Campagnes', href: '/admin/marketing/campaigns' },
      { title: 'Statistiques', href: '/admin/marketing/stats' }
    ]
  }
]

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const [expandedSections, setExpandedSections] = useState<string[]>([])
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const toggleSection = (title: string) => {
    setExpandedSections(prev =>
      prev.includes(title)
        ? prev.filter(t => t !== title)
        : [...prev, title]
    )
  }

  const isActive = (href: string) => pathname === href
  const isSectionActive = (section: NavSection) => {
    if (section.href) return isActive(section.href)
    return section.children?.some(child => isActive(child.href)) || false
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black" data-hide-menu="true" data-admin-layout="true">
      {/* Header - Always visible with toggle button */}
      <div className="fixed top-0 left-0 right-0 z-40 bg-black/95 backdrop-blur-xl border-b border-white/10">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            {/* Toggle sidebar button */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              title={sidebarOpen ? 'Masquer le menu' : 'Afficher le menu'}
            >
              <div className="w-6 h-6 flex flex-col justify-center gap-1">
                <span className={`w-full h-0.5 bg-white rounded-full transition-transform ${sidebarOpen ? 'rotate-45 translate-y-1.5' : ''}`}></span>
                <span className={`w-full h-0.5 bg-white rounded-full transition-opacity ${sidebarOpen ? 'opacity-0' : ''}`}></span>
                <span className={`w-full h-0.5 bg-white rounded-full transition-transform ${sidebarOpen ? '-rotate-45 -translate-y-1.5' : ''}`}></span>
              </div>
            </button>

            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <span className="text-white font-bold text-sm">F</span>
            </div>
            <div>
              <h1 className="text-sm font-bold text-white">Felora Admin</h1>
              <p className="text-xs text-gray-400">Dashboard</p>
            </div>
          </div>

          {/* Admin info on desktop */}
          <div className="hidden md:flex items-center gap-3">
            <div className="text-right">
              <div className="text-xs font-medium text-white">Admin</div>
              <div className="text-xs text-gray-400">Connecté</div>
            </div>
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center">
              <span className="text-white font-medium text-xs">A</span>
            </div>
            <button
              onClick={() => {
                localStorage.removeItem('felora-admin-auth')
                window.location.reload()
              }}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              title="Déconnexion"
            >
              <LogOut size={16} className="text-gray-400 hover:text-white" />
            </button>
          </div>
        </div>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed left-0 top-0 h-full w-64 bg-black/95 backdrop-blur-xl border-r border-white/10 z-50 flex flex-col transition-transform duration-300 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        {/* Logo */}
        <div className="p-6 border-b border-white/10 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <span className="text-white font-bold text-lg">F</span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">Felora Admin</h1>
              <p className="text-xs text-gray-400">Dashboard</p>
            </div>
          </div>
        </div>

        {/* Navigation - Scrollable */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-1 pb-20">
          {navSections.map((section) => {
            const Icon = section.icon
            const isExpanded = expandedSections.includes(section.title)
            const sectionActive = isSectionActive(section)

            return (
              <div key={section.title}>
                {section.children ? (
                  <>
                    <button
                      onClick={() => toggleSection(section.title)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all ${
                        sectionActive
                          ? 'bg-purple-500/20 text-purple-300'
                          : 'text-gray-400 hover:bg-white/5 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Icon size={16} />
                        <span className="font-medium">{section.title}</span>
                      </div>
                      {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                    </button>

                    {isExpanded && (
                      <div className="ml-6 mt-1 space-y-1">
                        {section.children.map((child) => (
                          <a
                            key={child.href}
                            href={child.href}
                            onClick={() => setSidebarOpen(false)}
                            className={`block px-3 py-1.5 rounded-lg text-xs transition-all ${
                              isActive(child.href)
                                ? 'bg-purple-500/20 text-purple-300 font-medium'
                                : 'text-gray-400 hover:bg-white/5 hover:text-white'
                            }`}
                          >
                            {child.title}
                          </a>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <a
                    href={section.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all ${
                      isActive(section.href!)
                        ? 'bg-purple-500/20 text-purple-300 font-medium'
                        : 'text-gray-400 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Icon size={16} />
                      <span>{section.title}</span>
                    </div>
                    <ChevronRight size={14} />
                  </a>
                )}
              </div>
            )
          })}
        </nav>

        {/* Admin info + Logout - Fixed at bottom */}
        <div className="flex-shrink-0 p-4 border-t border-white/10 bg-black/95">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center">
                <span className="text-white font-medium text-xs">A</span>
              </div>
              <div>
                <div className="text-xs font-medium text-white">Admin</div>
                <div className="text-xs text-gray-400">Connecté</div>
              </div>
            </div>
            <button
              onClick={() => {
                localStorage.removeItem('felora-admin-auth')
                window.location.reload()
              }}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              title="Déconnexion"
            >
              <LogOut size={16} className="text-gray-400 hover:text-white" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className={`transition-all duration-300 pt-16 ${sidebarOpen ? 'ml-64' : 'ml-0'}`}>
        {children}
      </main>
    </div>
  )
}