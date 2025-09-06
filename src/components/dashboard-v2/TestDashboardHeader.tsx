'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Bell, Search, Menu, X } from 'lucide-react'

interface TestDashboardHeaderProps {
  userType?: 'escort' | 'club'
}

export default function TestDashboardHeader({ userType = 'escort' }: TestDashboardHeaderProps) {
  const router = useRouter()
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)

  const testUser = {
    name: userType === 'escort' ? 'Test Escort' : 'Test Club',
    email: 'test@felora.ch',
    role: userType.toUpperCase()
  }

  return (
    <header className="sticky top-0 z-30 bg-black/95 backdrop-blur-xl border-b border-gray-800/50">
      <div className="ml-64 px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Recherche */}
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Rechercher..."
                className="w-full pl-10 pr-4 py-2 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-lg transition-colors relative">
              <Bell size={20} />
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                3
              </span>
            </button>

            {/* Menu utilisateur */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-3 p-2 hover:bg-gray-800/50 rounded-lg transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-semibold text-sm">
                  T
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-sm font-medium text-white">
                    {testUser.name}
                  </p>
                  <p className="text-xs text-gray-400">
                    {userType === 'escort' ? 'Escorte' : 'Club'} (TEST)
                  </p>
                </div>
              </button>

              {/* Dropdown */}
              {showUserMenu && (
                <>
                  <div 
                    className="fixed inset-0 z-10"
                    onClick={() => setShowUserMenu(false)}
                  />
                  <div className="absolute right-0 mt-2 w-56 bg-gray-900 border border-gray-700 rounded-xl shadow-2xl z-20">
                    <div className="p-4 border-b border-gray-700">
                      <p className="text-sm font-medium text-white">
                        {testUser.name}
                      </p>
                      <p className="text-xs text-gray-400">
                        {testUser.email}
                      </p>
                    </div>
                    
                    <div className="py-2">
                      <button
                        onClick={() => {
                          router.push('/dashboard-test')
                          setShowUserMenu(false)
                        }}
                        className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:text-white hover:bg-gray-800 transition-colors"
                      >
                        Retour aux tests
                      </button>
                      
                      <button
                        onClick={() => {
                          router.push('/')
                          setShowUserMenu(false)
                        }}
                        className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:text-white hover:bg-gray-800 transition-colors"
                      >
                        Voir le site
                      </button>
                      
                      <button
                        onClick={() => {
                          // Pas de vraie déconnexion en mode test
                          alert('Mode test - pas de déconnexion')
                          setShowUserMenu(false)
                        }}
                        className="w-full px-4 py-2 text-left text-sm text-red-400 hover:text-red-300 hover:bg-gray-800 transition-colors"
                      >
                        Déconnexion (test)
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              className="lg:hidden p-2 text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-lg transition-colors"
              onClick={() => setShowMobileMenu(!showMobileMenu)}
            >
              {showMobileMenu ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {showMobileMenu && (
        <div className="lg:hidden bg-gray-900 border-t border-gray-800">
          <div className="px-4 py-4 space-y-2">
            <button
              onClick={() => {
                router.push('/dashboard-test')
                setShowMobileMenu(false)
              }}
              className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
            >
              Retour aux tests
            </button>
            <button
              onClick={() => {
                router.push('/')
                setShowMobileMenu(false)
              }}
              className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
            >
              Voir le site
            </button>
            <button
              onClick={() => {
                // Pas de vraie déconnexion en mode test
                alert('Mode test - pas de déconnexion')
                setShowMobileMenu(false)
              }}
              className="block w-full text-left px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-gray-800 rounded-lg transition-colors"
            >
              Déconnexion (test)
            </button>
          </div>
        </div>
      )}
    </header>
  )
}