"use client"

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useNotification } from '@/components/providers/NotificationProvider'
import { Bell, Eye, Shield, Settings as SettingsIcon, CreditCard, Globe, Moon, Sun, Volume2, VolumeX, Lock, Mail, Phone } from 'lucide-react'

type SectionKey = 'notifications' | 'privacy' | 'security' | 'preferences' | 'account'

export default function ParametresPage() {
  const { user } = useAuth()
  const { success, error } = useNotification()
  const [activeSection, setActiveSection] = useState<SectionKey>('notifications')

  const [settings, setSettings] = useState({
    notifications: {
      email: true,
      push: true,
      sms: false,
      newMessages: true,
      newOrders: true,
      profileViews: false,
      marketing: false,
    },
    privacy: {
      showOnline: false,
      profileVisible: true,
      allowMessages: true,
      showLocation: true,
      hideFromSearch: false,
    },
    preferences: {
      darkMode: true,
      language: 'fr',
      currency: 'CHF',
      soundEffects: true,
      autoReply: false,
    },
    security: {
      twoFactor: false,
      loginAlerts: true,
      sessionTimeout: 30,
    },
  })

  const updateSetting = (section: keyof typeof settings, key: string, value: any) => {
    setSettings((prev) => ({
      ...prev,
      [section]: { ...prev[section], [key]: value },
    }))
  }

  const saveAll = async () => {
    try {
      // TODO: POST /api/me/settings (mock)
      await new Promise((r) => setTimeout(r, 400))
      success('Paramètres enregistrés', 'Vos préférences ont été sauvegardées')
    } catch (e: any) {
      error('Échec', 'Impossible de sauvegarder pour le moment')
    }
  }

  const sections: Array<{ key: SectionKey; label: string; icon: JSX.Element }> = [
    { key: 'notifications', label: 'Notifications', icon: <Bell size={18} /> },
    { key: 'privacy', label: 'Confidentialité', icon: <Eye size={18} /> },
    { key: 'security', label: 'Sécurité', icon: <Shield size={18} /> },
    { key: 'preferences', label: 'Préférences', icon: <SettingsIcon size={18} /> },
    { key: 'account', label: 'Compte', icon: <Lock size={18} /> },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-white">Paramètres</h1>
        <p className="text-sm text-white/70">Personnalisez votre expérience et sécurisez votre compte</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-gray-800/40 border border-gray-700/50 rounded-xl p-2 sticky top-[118px]">
            <nav className="space-y-1">
              {sections.map((s) => (
                <button
                  key={s.key}
                  onClick={() => setActiveSection(s.key)}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left ${
                    activeSection === s.key ? 'bg-white/10 text-white' : 'text-white/70 hover:bg-white/5'
                  }`}
                >
                  {s.icon}
                  <span className="text-sm">{s.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          <div className="bg-gray-800/40 border border-gray-700/50 rounded-xl p-4">
            {activeSection === 'notifications' && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold">Notifications</h2>
                <SectionRow
                  icon={<Mail size={18} className="text-blue-400" />}
                  title="Notifications par email"
                  description="Recevoir les notifications importantes"
                >
                  <Toggle
                    checked={settings.notifications.email}
                    onChange={(v) => updateSetting('notifications', 'email', v)}
                  />
                </SectionRow>
                <SectionRow
                  icon={<Bell size={18} className="text-pink-400" />}
                  title="Notifications push"
                  description="Sur votre navigateur ou mobile"
                >
                  <Toggle
                    checked={settings.notifications.push}
                    onChange={(v) => updateSetting('notifications', 'push', v)}
                  />
                </SectionRow>
                <SectionRow
                  icon={<Phone size={18} className="text-green-400" />}
                  title="SMS"
                  description="Alertes critiques par SMS"
                >
                  <Toggle
                    checked={settings.notifications.sms}
                    onChange={(v) => updateSetting('notifications', 'sms', v)}
                  />
                </SectionRow>
                <div className="pt-2">
                  <h3 className="text-sm text-white/80 mb-2">Types de notifications</h3>
                  <div className="space-y-3">
                    <ToggleRow
                      title="Nouveaux messages"
                      description="Quand un client vous écrit"
                      checked={settings.notifications.newMessages}
                      onChange={(v) => updateSetting('notifications', 'newMessages', v)}
                    />
                    <ToggleRow
                      title="Nouvelles commandes"
                      description="Commandes personnalisées reçues"
                      checked={settings.notifications.newOrders}
                      onChange={(v) => updateSetting('notifications', 'newOrders', v)}
                    />
                    <ToggleRow
                      title="Vues de profil"
                      description="Quand quelqu'un visite votre profil"
                      checked={settings.notifications.profileViews}
                      onChange={(v) => updateSetting('notifications', 'profileViews', v)}
                    />
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'privacy' && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold">Confidentialité</h2>
                <ToggleRow
                  title="Afficher le statut en ligne"
                  description="Les autres peuvent voir si vous êtes connectée"
                  checked={settings.privacy.showOnline}
                  onChange={(v) => updateSetting('privacy', 'showOnline', v)}
                />
                <ToggleRow
                  title="Profil visible publiquement"
                  description="Apparaître dans les résultats de recherche"
                  checked={settings.privacy.profileVisible}
                  onChange={(v) => updateSetting('privacy', 'profileVisible', v)}
                />
                <ToggleRow
                  title="Autoriser les messages"
                  description="Recevoir des messages de nouveaux clients"
                  checked={settings.privacy.allowMessages}
                  onChange={(v) => updateSetting('privacy', 'allowMessages', v)}
                />
                <ToggleRow
                  title="Afficher la localisation"
                  description="Montrer votre ville sur le profil"
                  checked={settings.privacy.showLocation}
                  onChange={(v) => updateSetting('privacy', 'showLocation', v)}
                />
                <ToggleRow
                  title="Masquer des recherches"
                  description="Ne pas apparaître dans les listes publiques"
                  checked={settings.privacy.hideFromSearch}
                  onChange={(v) => updateSetting('privacy', 'hideFromSearch', v)}
                />
              </div>
            )}

            {activeSection === 'security' && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold">Sécurité</h2>
                <ToggleRow
                  title="Authentification à deux facteurs"
                  description="Protection supplémentaire de votre compte"
                  checked={settings.security.twoFactor}
                  onChange={(v) => updateSetting('security', 'twoFactor', v)}
                />
                <ToggleRow
                  title="Alertes de connexion"
                  description="Me prévenir lors des connexions inhabituelles"
                  checked={settings.security.loginAlerts}
                  onChange={(v) => updateSetting('security', 'loginAlerts', v)}
                />
                <div>
                  <label className="block text-xs text-white/70 mb-1">Déconnexion automatique</label>
                  <select
                    value={settings.security.sessionTimeout}
                    onChange={(e) => updateSetting('security', 'sessionTimeout', Number(e.target.value))}
                    className="px-3 py-2 bg-black border border-white/10 rounded-lg text-sm"
                  >
                    <option value={15}>15 minutes</option>
                    <option value={30}>30 minutes</option>
                    <option value={60}>1 heure</option>
                    <option value={180}>3 heures</option>
                  </select>
                </div>
                <div className="pt-2">
                  <button onClick={() => success('Mot de passe', 'Lien de réinitialisation envoyé (mock)')} className="px-3 py-2 rounded-lg bg-white/10 border border-white/10 text-sm hover:bg-white/15">Réinitialiser le mot de passe</button>
                </div>
              </div>
            )}

            {activeSection === 'preferences' && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold">Préférences</h2>
                <ToggleRow
                  title="Mode sombre"
                  description="Améliore le confort visuel"
                  checked={settings.preferences.darkMode}
                  onChange={(v) => updateSetting('preferences', 'darkMode', v)}
                  leftIcon={settings.preferences.darkMode ? <Moon size={16} className="text-yellow-300"/> : <Sun size={16} className="text-amber-300"/>}
                />
                <div>
                  <label className="flex items-center gap-2 mb-1 text-white/80 text-sm"><Globe size={16} className="text-purple-400"/> Langue</label>
                  <select
                    value={settings.preferences.language}
                    onChange={(e) => updateSetting('preferences', 'language', e.target.value)}
                    className="px-3 py-2 bg-black border border-white/10 rounded-lg text-sm w-full"
                  >
                    <option value="fr">Français</option>
                    <option value="en">English</option>
                    <option value="de">Deutsch</option>
                    <option value="it">Italiano</option>
                  </select>
                </div>
                <div>
                  <label className="flex items-center gap-2 mb-1 text-white/80 text-sm"><CreditCard size={16} className="text-green-400"/> Devise</label>
                  <select
                    value={settings.preferences.currency}
                    onChange={(e) => updateSetting('preferences', 'currency', e.target.value)}
                    className="px-3 py-2 bg-black border border-white/10 rounded-lg text-sm w-full"
                  >
                    <option value="CHF">CHF (Franc Suisse)</option>
                    <option value="EUR">EUR (Euro)</option>
                    <option value="USD">USD (Dollar)</option>
                  </select>
                </div>
                <ToggleRow
                  title="Effets sonores"
                  description="Sons pour les notifications"
                  checked={settings.preferences.soundEffects}
                  onChange={(v) => updateSetting('preferences', 'soundEffects', v)}
                  leftIcon={settings.preferences.soundEffects ? <Volume2 size={16} className="text-emerald-400"/> : <VolumeX size={16} className="text-white/50"/>}
                />
              </div>
            )}

            {activeSection === 'account' && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold">Compte</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-white/60 mb-1">Email</label>
                    <input
                      type="email"
                      value={user?.email || ''}
                      disabled
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white/70"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-white/60 mb-1">Téléphone</label>
                    <input
                      type="tel"
                      placeholder="+41 79 123 45 67"
                      className="w-full px-3 py-2 bg-black border border-white/10 rounded-lg text-white"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-white/60 mb-1">Nom d'artiste</label>
                  <input
                    type="text"
                    placeholder="Votre pseudo public"
                    className="w-full px-3 py-2 bg-black border border-white/10 rounded-lg text-white"
                  />
                </div>
              </div>
            )}

            <div className="pt-6 flex items-center justify-end">
              <button onClick={saveAll} className="px-4 py-2 rounded-lg bg-pink-600 hover:bg-pink-700 text-white text-sm">Sauvegarder les modifications</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function SectionRow({ icon, title, description, children }: { icon?: React.ReactNode, title: string, description?: string, children?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between p-3 rounded-lg hover:bg-white/5">
      <div className="flex items-center gap-3">
        {icon}
        <div>
          <div className="text-white text-sm font-medium">{title}</div>
          {description && <div className="text-xs text-white/60">{description}</div>}
        </div>
      </div>
      <div>{children}</div>
    </div>
  )
}

function Toggle({ checked, onChange }: { checked: boolean, onChange: (value: boolean) => void }) {
  return (
    <label className="relative inline-flex items-center cursor-pointer">
      <input type="checkbox" checked={checked} onChange={(e)=>onChange(e.target.checked)} className="sr-only peer" />
      <div className="w-11 h-6 bg-gray-600 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-purple-500 peer-checked:to-pink-500"></div>
    </label>
  )
}

function ToggleRow({ title, description, checked, onChange, leftIcon }: { title: string, description?: string, checked: boolean, onChange: (v:boolean)=>void, leftIcon?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between p-3 rounded-lg hover:bg-white/5">
      <div className="flex items-center gap-2">
        {leftIcon}
        <div>
          <div className="text-white text-sm font-medium">{title}</div>
          {description && <div className="text-xs text-white/60">{description}</div>}
        </div>
      </div>
      <Toggle checked={checked} onChange={onChange} />
    </div>
  )
}

