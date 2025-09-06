'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  User, 
  Image, 
  ShoppingBag, 
  MessageCircle, 
  BarChart3, 
  Wallet, 
  Settings,
  Users,
  ChevronDown,
  ChevronRight
} from 'lucide-react'

interface NavItem {
  name: string
  icon: React.ReactNode
  path?: string
  subItems?: { name: string; path: string }[]
}

interface TestDashboardSidebarProps {
  userType?: 'escort' | 'club'
}

export default function TestDashboardSidebar({ userType = 'escort' }: TestDashboardSidebarProps) {
  const pathname = usePathname()
  const [expandedItems, setExpandedItems] = useState<string[]>([])
  const isEscort = userType === 'escort'

  // Navigation pour Escort
  const escortNavItems: NavItem[] = [
    {
      name: 'Mon Profil',
      icon: <User size={20} />,
      path: '/dashboard-test/escort/profile'
    },
    {
      name: 'Médias',
      icon: <Image size={20} />,
      path: '/dashboard-test/escort/media'
    },
    {
      name: 'Commandes',
      icon: <ShoppingBag size={20} />,
      path: '/dashboard-test/escort/orders'
    },
    {
      name: 'Messages',
      icon: <MessageCircle size={20} />,
      path: '/dashboard-test/escort/messages'
    },
    {
      name: 'Statistiques',
      icon: <BarChart3 size={20} />,
      path: '/dashboard-test/escort/stats'
    },
    {
      name: 'Portefeuille',
      icon: <Wallet size={20} />,
      path: '/dashboard-test/escort/wallet'
    },
    {
      name: 'Paramètres',
      icon: <Settings size={20} />,
      path: '/dashboard-test/escort/settings'
    }
  ]

  // Navigation pour Club
  const clubNavItems: NavItem[] = [
    {
      name: 'Mon Profil',
      icon: <User size={20} />,
      path: '/dashboard-test/club/profile'
    },
    {
      name: 'Mes Escorts',
      icon: <Users size={20} />,
      path: '/dashboard-test/club/escorts'
    },
    {
      name: 'Messages',
      icon: <MessageCircle size={20} />,
      path: '/dashboard-test/club/messages'
    },
    {
      name: 'Statistiques',
      icon: <BarChart3 size={20} />,
      path: '/dashboard-test/club/stats'
    },
    {
      name: 'Portefeuille',
      icon: <Wallet size={20} />,
      path: '/dashboard-test/club/wallet'
    },
    {
      name: 'Paramètres',
      icon: <Settings size={20} />,
      path: '/dashboard-test/club/settings'
    }
  ]

  const navItems = isEscort ? escortNavItems : clubNavItems

  const toggleExpanded = (itemName: string) => {
    setExpandedItems(prev => 
      prev.includes(itemName) 
        ? prev.filter(name => name !== itemName)
        : [...prev, itemName]
    )
  }

  const isActive = (path: string) => pathname === path

  return (
    <aside className="fixed top-0 left-0 z-40 w-64 h-screen bg-gray-900/95 backdrop-blur-xl border-r border-gray-800/50">
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-center p-6 border-b border-gray-800/50">
          <Link href="/dashboard-test" className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center font-bold text-lg">
              F
            </div>
            <div>
              <div className="text-xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                FELORA
              </div>
              <div className="text-xs text-gray-400">
                {isEscort ? 'Dashboard Escort' : 'Dashboard Club'} (TEST)
              </div>
            </div>
          </Link>
        </div>

        {/* Test User Info */}
        <div className="p-4 border-b border-gray-800/30">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-semibold">
              T
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {isEscort ? 'Test Escort' : 'Test Club'}
              </p>
              <p className="text-xs text-gray-400 truncate">
                test@felora.ch
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <div key={item.name}>
              {item.path ? (
                // Simple link
                <Link
                  href={item.path}
                  className={`flex items-center px-3 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                    isActive(item.path)
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                      : 'text-gray-300 hover:text-white hover:bg-gray-800/50'
                  }`}
                >
                  <span className="mr-3">{item.icon}</span>
                  {item.name}
                </Link>
              ) : (
                // Item avec sous-menus
                <div>
                  <button
                    onClick={() => toggleExpanded(item.name)}
                    className="flex items-center justify-between w-full px-3 py-3 text-sm font-medium text-gray-300 rounded-xl hover:text-white hover:bg-gray-800/50 transition-all duration-200"
                  >
                    <div className="flex items-center">
                      <span className="mr-3">{item.icon}</span>
                      {item.name}
                    </div>
                    {expandedItems.includes(item.name) ? (
                      <ChevronDown size={16} />
                    ) : (
                      <ChevronRight size={16} />
                    )}
                  </button>
                  
                  {expandedItems.includes(item.name) && item.subItems && (
                    <div className="ml-6 mt-2 space-y-1">
                      {item.subItems.map((subItem) => (
                        <Link
                          key={subItem.path}
                          href={subItem.path}
                          className={`flex items-center px-3 py-2 text-sm rounded-lg transition-all duration-200 ${
                            isActive(subItem.path)
                              ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-300 border-l-2 border-purple-400'
                              : 'text-gray-400 hover:text-white hover:bg-gray-800/30'
                          }`}
                        >
                          {subItem.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-800/30">
          <Link
            href="/dashboard-test"
            className="flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-800/50 rounded-lg transition-colors"
          >
            Retour aux tests
          </Link>
        </div>
      </div>
    </aside>
  )
}