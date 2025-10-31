'use client'

import React, { useState } from 'react'
import { Search, Filter, X, Save, Calendar, MapPin } from 'lucide-react'
import { getCategoryOptions, getCategoryLabel } from '@/lib/constants/escort-categories'

export interface FilterState {
  searchQuery: string
  role: string
  status: string
  subscription: string
  dateFrom: string
  dateTo: string
  lastLoginFrom: string
  lastLoginTo: string
  city: string
  canton: string
  category: string
}

interface UserFiltersProps {
  filters: FilterState
  onFiltersChange: (filters: FilterState) => void
  onSaveFilters?: (name: string, filters: FilterState) => void
  savedFilters?: Array<{ name: string, filters: FilterState }>
}

export default function UserFilters({ filters, onFiltersChange, onSaveFilters, savedFilters = [] }: UserFiltersProps) {
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [saveFilterName, setSaveFilterName] = useState('')

  const updateFilter = (key: keyof FilterState, value: string) => {
    onFiltersChange({ ...filters, [key]: value })
  }

  const clearAllFilters = () => {
    onFiltersChange({
      searchQuery: '',
      role: 'ALL',
      status: 'ALL',
      subscription: 'ALL',
      dateFrom: '',
      dateTo: '',
      lastLoginFrom: '',
      lastLoginTo: '',
      city: '',
      canton: '',
      category: 'ALL'
    })
  }

  const hasActiveFilters = () => {
    return filters.searchQuery !== '' ||
           filters.role !== 'ALL' ||
           filters.status !== 'ALL' ||
           filters.subscription !== 'ALL' ||
           filters.dateFrom !== '' ||
           filters.dateTo !== '' ||
           filters.lastLoginFrom !== '' ||
           filters.lastLoginTo !== '' ||
           filters.city !== '' ||
           filters.canton !== '' ||
           filters.category !== 'ALL'
  }

  const handleSaveFilters = () => {
    if (saveFilterName.trim() && onSaveFilters) {
      onSaveFilters(saveFilterName.trim(), filters)
      setSaveFilterName('')
    }
  }

  return (
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter size={20} className="text-purple-400" />
          <h2 className="text-lg font-semibold text-white">Filtres</h2>
          {hasActiveFilters() && (
            <span className="px-2 py-1 text-xs bg-purple-500/20 text-purple-400 rounded-full">
              Actifs
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {hasActiveFilters() && (
            <button
              onClick={clearAllFilters}
              className="flex items-center gap-2 px-3 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors text-sm"
            >
              <X size={16} />
              <span>Effacer</span>
            </button>
          )}
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="px-3 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg transition-colors text-sm"
          >
            {showAdvanced ? 'Filtres simples' : 'Filtres avancés'}
          </button>
        </div>
      </div>

      {/* Filtres rapides prédéfinis */}
      {savedFilters.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <span className="text-xs text-white/60 mr-2">Filtres sauvegardés:</span>
          {savedFilters.map((saved, index) => (
            <button
              key={index}
              onClick={() => onFiltersChange(saved.filters)}
              className="px-3 py-1 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 rounded-lg text-xs transition-colors"
            >
              {saved.name}
            </button>
          ))}
        </div>
      )}

      {/* Filtres de base */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Recherche */}
        <div className="lg:col-span-2">
          <label className="block text-sm text-white/60 mb-2">Rechercher</label>
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
            <input
              type="text"
              placeholder="Email, nom, ID..."
              value={filters.searchQuery}
              onChange={(e) => updateFilter('searchQuery', e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-white placeholder-white/40 focus:outline-none focus:border-purple-500"
            />
          </div>
        </div>

        {/* Filtre Rôle */}
        <div>
          <label className="block text-sm text-white/60 mb-2">Rôle</label>
          <select
            value={filters.role}
            onChange={(e) => updateFilter('role', e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
          >
            <option value="ALL">Tous les rôles</option>
            <option value="ESCORT">Escort</option>
            <option value="CLUB">Club</option>
            <option value="CLIENT">Client</option>
          </select>
        </div>

        {/* Filtre Statut */}
        <div>
          <label className="block text-sm text-white/60 mb-2">Statut</label>
          <select
            value={filters.status}
            onChange={(e) => updateFilter('status', e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
          >
            <option value="ALL">Tous les statuts</option>
            <option value="ACTIVE">Actifs</option>
            <option value="BANNED">Bannis</option>
            <option value="VERIFIED">Vérifiés</option>
            <option value="UNVERIFIED">Non vérifiés</option>
          </select>
        </div>
      </div>

      {/* Filtres avancés */}
      {showAdvanced && (
        <div className="space-y-4 pt-4 border-t border-white/10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Abonnement */}
            <div>
              <label className="block text-sm text-white/60 mb-2">Abonnement</label>
              <select
                value={filters.subscription}
                onChange={(e) => updateFilter('subscription', e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
              >
                <option value="ALL">Tous</option>
                <option value="ACTIVE">Actifs</option>
                <option value="EXPIRED">Expirés</option>
                <option value="NONE">Sans abonnement</option>
              </select>
            </div>

            {/* Catégorie (pour les escortes) */}
            <div>
              <label className="block text-sm text-white/60 mb-2">Catégorie</label>
              <select
                value={filters.category}
                onChange={(e) => updateFilter('category', e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
              >
                <option value="ALL">Toutes</option>
                {getCategoryOptions().map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Ville */}
            <div>
              <label className="block text-sm text-white/60 mb-2">
                <MapPin size={14} className="inline mr-1" />
                Ville
              </label>
              <input
                type="text"
                placeholder="Genève, Lausanne..."
                value={filters.city}
                onChange={(e) => updateFilter('city', e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white placeholder-white/40 focus:outline-none focus:border-purple-500"
              />
            </div>

            {/* Canton */}
            <div>
              <label className="block text-sm text-white/60 mb-2">Canton</label>
              <select
                value={filters.canton}
                onChange={(e) => updateFilter('canton', e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
              >
                <option value="">Tous les cantons</option>
                <option value="GE">Genève</option>
                <option value="VD">Vaud</option>
                <option value="VS">Valais</option>
                <option value="NE">Neuchâtel</option>
                <option value="FR">Fribourg</option>
                <option value="BE">Berne</option>
                <option value="ZH">Zurich</option>
                <option value="TI">Tessin</option>
              </select>
            </div>
          </div>

          {/* Plages de dates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Date d'inscription */}
            <div>
              <label className="block text-sm text-white/60 mb-2">
                <Calendar size={14} className="inline mr-1" />
                Date d'inscription
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => updateFilter('dateFrom', e.target.value)}
                  className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-500"
                  placeholder="Du"
                />
                <input
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => updateFilter('dateTo', e.target.value)}
                  className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-500"
                  placeholder="Au"
                />
              </div>
            </div>

            {/* Dernière connexion */}
            <div>
              <label className="block text-sm text-white/60 mb-2">
                <Calendar size={14} className="inline mr-1" />
                Dernière connexion
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="date"
                  value={filters.lastLoginFrom}
                  onChange={(e) => updateFilter('lastLoginFrom', e.target.value)}
                  className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-500"
                  placeholder="Du"
                />
                <input
                  type="date"
                  value={filters.lastLoginTo}
                  onChange={(e) => updateFilter('lastLoginTo', e.target.value)}
                  className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-500"
                  placeholder="Au"
                />
              </div>
            </div>
          </div>

          {/* Sauvegarder les filtres */}
          {onSaveFilters && hasActiveFilters() && (
            <div className="pt-4 border-t border-white/10">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Nom du filtre..."
                  value={saveFilterName}
                  onChange={(e) => setSaveFilterName(e.target.value)}
                  className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white placeholder-white/40 focus:outline-none focus:border-purple-500"
                />
                <button
                  onClick={handleSaveFilters}
                  disabled={!saveFilterName.trim()}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save size={16} />
                  <span>Sauvegarder</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Filtres rapides */}
      <div className="flex flex-wrap gap-2 pt-2">
        <span className="text-xs text-white/60 mr-2">Filtres rapides:</span>
        <button
          onClick={() => onFiltersChange({ ...filters, status: 'VERIFIED', role: 'ESCORT', category: 'ALL' })}
          className="px-3 py-1 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg text-xs transition-colors"
        >
          Escorts vérifiées
        </button>
        <button
          onClick={() => onFiltersChange({ ...filters, status: 'UNVERIFIED', role: 'ESCORT', category: 'ALL' })}
          className="px-3 py-1 bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 rounded-lg text-xs transition-colors"
        >
          ⚠️ Escorts NON vérifiées
        </button>
        <button
          onClick={() => onFiltersChange({ ...filters, status: 'BANNED', role: 'ALL', category: 'ALL' })}
          className="px-3 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg text-xs transition-colors"
        >
          Bannis
        </button>
        <button
          onClick={() => {
            const weekAgo = new Date()
            weekAgo.setDate(weekAgo.getDate() - 7)
            onFiltersChange({ ...filters, dateFrom: weekAgo.toISOString().split('T')[0], dateTo: '', category: 'ALL' })
          }}
          className="px-3 py-1 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg text-xs transition-colors"
        >
          Nouveaux (7j)
        </button>
        <button
          onClick={() => onFiltersChange({ ...filters, subscription: 'ACTIVE', role: 'ALL', category: 'ALL' })}
          className="px-3 py-1 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 rounded-lg text-xs transition-colors"
        >
          Abonnés actifs
        </button>
      </div>

      {/* Filtres rapides par catégorie */}
      <div className="flex flex-wrap gap-2 pt-2 border-t border-white/10">
        <span className="text-xs text-white/60 mr-2">Par catégorie:</span>
        <button
          onClick={() => onFiltersChange({ ...filters, role: 'ESCORT', category: 'MASSEUSE', status: 'ALL' })}
          className="px-3 py-1 bg-pink-500/20 hover:bg-pink-500/30 text-pink-400 rounded-lg text-xs transition-colors"
        >
          Masseuses
        </button>
        <button
          onClick={() => onFiltersChange({ ...filters, role: 'ESCORT', category: 'TRANSSEXUELLE', status: 'ALL' })}
          className="px-3 py-1 bg-pink-500/20 hover:bg-pink-500/30 text-pink-400 rounded-lg text-xs transition-colors"
        >
          Transsexuelles
        </button>
        <button
          onClick={() => onFiltersChange({ ...filters, role: 'ESCORT', category: 'DOMINATRICE', status: 'ALL' })}
          className="px-3 py-1 bg-pink-500/20 hover:bg-pink-500/30 text-pink-400 rounded-lg text-xs transition-colors"
        >
          Dominatrices
        </button>
        <button
          onClick={() => onFiltersChange({ ...filters, role: 'ESCORT', category: 'ESCORT', status: 'ALL' })}
          className="px-3 py-1 bg-pink-500/20 hover:bg-pink-500/30 text-pink-400 rounded-lg text-xs transition-colors"
        >
          Escorts
        </button>
        <button
          onClick={() => onFiltersChange({ ...filters, role: 'ESCORT', category: 'AUTRE', status: 'ALL' })}
          className="px-3 py-1 bg-pink-500/20 hover:bg-pink-500/30 text-pink-400 rounded-lg text-xs transition-colors"
        >
          Autres
        </button>
      </div>
    </div>
  )
}
