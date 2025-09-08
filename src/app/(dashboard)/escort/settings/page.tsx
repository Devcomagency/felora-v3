'use client'

import { useState } from 'react'
import DashboardLayout from '../../../../components/dashboard-v2/DashboardLayout'
import { useAuth } from '../../../../contexts/AuthContext'
import { 
  Settings, 
  Bell, 
  Shield, 
  Eye, 
  MessageCircle, 
  CreditCard, 
  Globe,
  Moon,
  Sun,
  Volume2,
  VolumeX,
  Lock,
  Mail,
  Phone
} from 'lucide-react'

export default function EscortSettingsPage() {
  const { user } = useAuth()
  const [activeSection, setActiveSection] = useState('notifications')
  
  // États pour les paramètres
  const [settings, setSettings] = useState({
    notifications: {
      email: true,
      push: true,
      sms: false,
      newMessages: true,
      newOrders: true,
      profileViews: false,
      marketing: false
    },
    privacy: {
      showOnline: false,
      profileVisible: true,
      allowMessages: true,
      showLocation: true,
      hideFromSearch: false
    },
    preferences: {
      darkMode: true,
      language: 'fr',
      currency: 'CHF',
      soundEffects: true,
      autoReply: false
    },
    security: {
      twoFactor: false,
      loginAlerts: true,
      sessionTimeout: 30
    }
  })

  const updateSetting = (section: string, key: string, value: boolean | string | number) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value
      }
    }))
  }

  const sections = [
    { key: 'notifications', label: 'Notifications', icon: <Bell size={20} /> },
    { key: 'privacy', label: 'Confidentialité', icon: <Eye size={20} /> },
    { key: 'security', label: 'Sécurité', icon: <Shield size={20} /> },
    { key: 'preferences', label: 'Préférences', icon: <Settings size={20} /> },
    { key: 'account', label: 'Compte', icon: <Lock size={20} /> }
  ]

  return (
    <DashboardLayout 
      title="Paramètres" 
      subtitle="Personnalisez votre expérience et sécurisez votre compte"
    >
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Menu latéral */}
        <div className="lg:col-span-1">
          <div className="bg-gray-800/40 backdrop-blur-sm border border-gray-700/50 rounded-xl p-4 sticky top-4">
            <nav className="space-y-2">
              {sections.map((section) => (
                <button
                  key={section.key}
                  onClick={() => setActiveSection(section.key)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-all ${
                    activeSection === section.key
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                      : 'text-gray-300 hover:text-white hover:bg-gray-700/30'
                  }`}
                >
                  {section.icon}
                  <span className="font-medium">{section.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Contenu */}
        <div className="lg:col-span-3">
          <div className="bg-gray-800/40 backdrop-blur-sm border border-gray-700/50 rounded-xl p-8">
            {activeSection === 'notifications' && (
              <div>
                <h2 className="text-2xl font-bold text-white mb-6">Notifications</h2>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4">Canaux de notification</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Mail className="text-blue-400" size={20} />
                          <div>
                            <div className="text-white font-medium">Notifications par email</div>
                            <div className="text-sm text-gray-400">Recevoir les notifications importantes</div>
                          </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={settings.notifications.email}
                            onChange={(e) => updateSetting('notifications', 'email', e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-purple-500 peer-checked:to-pink-500"></div>
                        </label>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Bell className="text-green-400" size={20} />
                          <div>
                            <div className="text-white font-medium">Notifications push</div>
                            <div className="text-sm text-gray-400">Notifications instantanées sur l&apos;appareil</div>
                          </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={settings.notifications.push}
                            onChange={(e) => updateSetting('notifications', 'push', e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-purple-500 peer-checked:to-pink-500"></div>
                        </label>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Phone className="text-orange-400" size={20} />
                          <div>
                            <div className="text-white font-medium">Notifications SMS</div>
                            <div className="text-sm text-gray-400">Messages pour les événements urgents</div>
                          </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={settings.notifications.sms}
                            onChange={(e) => updateSetting('notifications', 'sms', e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-purple-500 peer-checked:to-pink-500"></div>
                        </label>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4">Types de notifications</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <MessageCircle className="text-blue-400" size={20} />
                          <div>
                            <div className="text-white font-medium">Nouveaux messages</div>
                            <div className="text-sm text-gray-400">Quand un client vous écrit</div>
                          </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={settings.notifications.newMessages}
                            onChange={(e) => updateSetting('notifications', 'newMessages', e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-purple-500 peer-checked:to-pink-500"></div>
                        </label>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <CreditCard className="text-green-400" size={20} />
                          <div>
                            <div className="text-white font-medium">Nouvelles commandes</div>
                            <div className="text-sm text-gray-400">Commandes personnalisées reçues</div>
                          </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={settings.notifications.newOrders}
                            onChange={(e) => updateSetting('notifications', 'newOrders', e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-purple-500 peer-checked:to-pink-500"></div>
                        </label>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Eye className="text-purple-400" size={20} />
                          <div>
                            <div className="text-white font-medium">Vues de profil</div>
                            <div className="text-sm text-gray-400">Quand quelqu'un visite votre profil</div>
                          </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={settings.notifications.profileViews}
                            onChange={(e) => updateSetting('notifications', 'profileViews', e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-purple-500 peer-checked:to-pink-500"></div>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'privacy' && (
              <div>
                <h2 className="text-2xl font-bold text-white mb-6">Confidentialité</h2>
                
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-white font-medium">Afficher le statut en ligne</div>
                      <div className="text-sm text-gray-400">Les autres peuvent voir si vous êtes connectée</div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.privacy.showOnline}
                        onChange={(e) => updateSetting('privacy', 'showOnline', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-purple-500 peer-checked:to-pink-500"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-white font-medium">Profil visible publiquement</div>
                      <div className="text-sm text-gray-400">Apparaître dans les résultats de recherche</div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.privacy.profileVisible}
                        onChange={(e) => updateSetting('privacy', 'profileVisible', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-purple-500 peer-checked:to-pink-500"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-white font-medium">Autoriser les messages</div>
                      <div className="text-sm text-gray-400">Recevoir des messages de nouveaux clients</div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.privacy.allowMessages}
                        onChange={(e) => updateSetting('privacy', 'allowMessages', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-purple-500 peer-checked:to-pink-500"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-white font-medium">Afficher la localisation</div>
                      <div className="text-sm text-gray-400">Montrer votre ville sur le profil</div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.privacy.showLocation}
                        onChange={(e) => updateSetting('privacy', 'showLocation', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-purple-500 peer-checked:to-pink-500"></div>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'security' && (
              <div>
                <h2 className="text-2xl font-bold text-white mb-6">Sécurité</h2>
                
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-white font-medium">Authentification à deux facteurs</div>
                      <div className="text-sm text-gray-400">Protection supplémentaire de votre compte</div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.security.twoFactor}
                        onChange={(e) => updateSetting('security', 'twoFactor', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-purple-500 peer-checked:to-pink-500"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-white font-medium">Alertes de connexion</div>
                      <div className="text-sm text-gray-400">Être notifiée des nouvelles connexions</div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.security.loginAlerts}
                        onChange={(e) => updateSetting('security', 'loginAlerts', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-purple-500 peer-checked:to-pink-500"></div>
                    </label>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Délai d&apos;expiration de session</label>
                    <select 
                      value={settings.security.sessionTimeout}
                      onChange={(e) => updateSetting('security', 'sessionTimeout', parseInt(e.target.value))}
                      className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white focus:border-purple-500 focus:outline-none"
                    >
                      <option value={15}>15 minutes</option>
                      <option value={30}>30 minutes</option>
                      <option value={60}>1 heure</option>
                      <option value={240}>4 heures</option>
                      <option value={0}>Jamais</option>
                    </select>
                  </div>

                  <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
                    <h4 className="text-red-400 font-medium mb-2">Zone de danger</h4>
                    <div className="space-y-3">
                      <button className="w-full py-2 px-4 bg-gray-700/50 hover:bg-red-600/20 border border-gray-600/50 hover:border-red-500/50 rounded-lg text-gray-300 hover:text-red-400 transition-colors">
                        Changer le mot de passe
                      </button>
                      <button className="w-full py-2 px-4 bg-gray-700/50 hover:bg-red-600/20 border border-gray-600/50 hover:border-red-500/50 rounded-lg text-gray-300 hover:text-red-400 transition-colors">
                        Supprimer le compte
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'preferences' && (
              <div>
                <h2 className="text-2xl font-bold text-white mb-6">Préférences</h2>
                
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {settings.preferences.darkMode ? <Moon className="text-blue-400" size={20} /> : <Sun className="text-yellow-400" size={20} />}
                      <div>
                        <div className="text-white font-medium">Mode sombre</div>
                        <div className="text-sm text-gray-400">Interface en mode sombre</div>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.preferences.darkMode}
                        onChange={(e) => updateSetting('preferences', 'darkMode', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-purple-500 peer-checked:to-pink-500"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {settings.preferences.soundEffects ? <Volume2 className="text-green-400" size={20} /> : <VolumeX className="text-red-400" size={20} />}
                      <div>
                        <div className="text-white font-medium">Effets sonores</div>
                        <div className="text-sm text-gray-400">Sons pour les notifications</div>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.preferences.soundEffects}
                        onChange={(e) => updateSetting('preferences', 'soundEffects', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-purple-500 peer-checked:to-pink-500"></div>
                    </label>
                  </div>

                  <div>
                    <label className="flex items-center space-x-3 mb-2">
                      <Globe className="text-purple-400" size={20} />
                      <span className="text-white font-medium">Langue</span>
                    </label>
                    <select 
                      value={settings.preferences.language}
                      onChange={(e) => updateSetting('preferences', 'language', e.target.value)}
                      className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white focus:border-purple-500 focus:outline-none"
                    >
                      <option value="fr">Français</option>
                      <option value="en">English</option>
                      <option value="de">Deutsch</option>
                      <option value="it">Italiano</option>
                    </select>
                  </div>

                  <div>
                    <label className="flex items-center space-x-3 mb-2">
                      <CreditCard className="text-green-400" size={20} />
                      <span className="text-white font-medium">Devise</span>
                    </label>
                    <select 
                      value={settings.preferences.currency}
                      onChange={(e) => updateSetting('preferences', 'currency', e.target.value)}
                      className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white focus:border-purple-500 focus:outline-none"
                    >
                      <option value="CHF">CHF (Franc Suisse)</option>
                      <option value="EUR">EUR (Euro)</option>
                      <option value="USD">USD (Dollar)</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'account' && (
              <div>
                <h2 className="text-2xl font-bold text-white mb-6">Informations du compte</h2>
                
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                      <input
                        type="email"
                        value={user?.email || ''}
                        disabled
                        className="w-full px-4 py-3 bg-gray-700/30 border border-gray-600/50 rounded-xl text-gray-400 cursor-not-allowed"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Téléphone</label>
                      <input
                        type="tel"
                        defaultValue={user?.phone || ''}
                        className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white focus:border-purple-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Nom d'artiste</label>
                    <input
                      type="text"
                      defaultValue={user?.stageName || ''}
                      className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white focus:border-purple-500 focus:outline-none"
                    />
                  </div>

                  <div className="flex justify-end pt-6">
                    <button className="px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all">
                      Sauvegarder les modifications
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}