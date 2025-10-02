'use client'

import { useEffect, useState } from 'react'
import { Clock, MapPin, X, Star } from 'lucide-react'

interface AddressHistoryItem {
  id: string
  address: string
  coordinates?: { lat: number; lng: number }
  timestamp: number
  usedCount: number
  isFavorite?: boolean
}

interface AddressHistoryProps {
  onSelect: (address: string, coordinates?: { lat: number; lng: number }) => void
  onClear?: () => void
  className?: string
  maxItems?: number
}

const STORAGE_KEY = 'felora_address_history'

export default function AddressHistory({ 
  onSelect, 
  onClear, 
  className = '',
  maxItems = 5
}: AddressHistoryProps) {
  const [history, setHistory] = useState<AddressHistoryItem[]>([])
  const [showHistory, setShowHistory] = useState(false)

  useEffect(() => {
    loadHistory()
  }, [])

  const loadHistory = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        setHistory(parsed.slice(0, maxItems))
      }
    } catch (error) {
      console.error('Erreur chargement historique:', error)
    }
  }

  const saveHistory = (newHistory: AddressHistoryItem[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newHistory))
      setHistory(newHistory.slice(0, maxItems))
    } catch (error) {
      console.error('Erreur sauvegarde historique:', error)
    }
  }

  const addToHistory = (address: string, coordinates?: { lat: number; lng: number }) => {
    if (!address || address.length < 5) return

    const existingIndex = history.findIndex(item => item.address === address)
    let newHistory = [...history]

    if (existingIndex >= 0) {
      // Mettre à jour l'élément existant
      newHistory[existingIndex] = {
        ...newHistory[existingIndex],
        usedCount: newHistory[existingIndex].usedCount + 1,
        timestamp: Date.now()
      }
    } else {
      // Ajouter un nouvel élément
      const newItem: AddressHistoryItem = {
        id: Date.now().toString(),
        address,
        coordinates,
        timestamp: Date.now(),
        usedCount: 1
      }
      newHistory.unshift(newItem)
    }

    // Trier par fréquence d'utilisation et timestamp
    newHistory.sort((a, b) => {
      if (a.usedCount !== b.usedCount) {
        return b.usedCount - a.usedCount
      }
      return b.timestamp - a.timestamp
    })

    saveHistory(newHistory)
  }

  const removeFromHistory = (id: string) => {
    const newHistory = history.filter(item => item.id !== id)
    saveHistory(newHistory)
  }

  const toggleFavorite = (id: string) => {
    const newHistory = history.map(item => 
      item.id === id ? { ...item, isFavorite: !item.isFavorite } : item
    )
    saveHistory(newHistory)
  }

  const clearAllHistory = () => {
    try {
      localStorage.removeItem(STORAGE_KEY)
      setHistory([])
      onClear?.()
    } catch (error) {
      console.error('Erreur suppression historique:', error)
    }
  }

  const handleSelect = (item: AddressHistoryItem) => {
    onSelect(item.address, item.coordinates)
    // Mettre à jour le compteur d'utilisation
    addToHistory(item.address, item.coordinates)
  }

  if (history.length === 0) {
    return null
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setShowHistory(!showHistory)}
          className="flex items-center gap-2 text-xs text-gray-400 hover:text-white transition-colors"
        >
          <Clock size={14} />
          <span>Adresses récentes ({history.length})</span>
        </button>
        
        {history.length > 0 && (
          <button
            onClick={clearAllHistory}
            className="text-xs text-red-400 hover:text-red-300 transition-colors"
          >
            Effacer
          </button>
        )}
      </div>

      {/* Liste d'historique */}
      {showHistory && (
        <div className="space-y-1 max-h-40 overflow-y-auto">
          {history.map((item) => (
            <div
              key={item.id}
              className="group flex items-center gap-2 p-2 bg-gray-800/50 rounded-lg hover:bg-gray-700/50 transition-colors"
            >
              {/* Icône */}
              <div className="flex-shrink-0">
                {item.isFavorite ? (
                  <Star className="text-yellow-400 fill-current" size={14} />
                ) : (
                  <MapPin className="text-gray-400" size={14} />
                )}
              </div>

              {/* Contenu - MOBILE-FIRST */}
              <button
                onClick={() => handleSelect(item)}
                className="flex-1 text-left min-w-0"
              >
                <div className="text-xs sm:text-sm text-white leading-relaxed break-words">
                  {item.address}
                </div>
                <div className="text-[10px] text-gray-400 mt-1">
                  Utilisée {item.usedCount}x • {formatTimestamp(item.timestamp)}
                </div>
              </button>

              {/* Actions */}
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    toggleFavorite(item.id)
                  }}
                  className="p-1 hover:bg-gray-600/50 rounded"
                >
                  <Star 
                    className={`${item.isFavorite ? 'text-yellow-400 fill-current' : 'text-gray-400'}`} 
                    size={12} 
                  />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    removeFromHistory(item.id)
                  }}
                  className="p-1 hover:bg-gray-600/50 rounded"
                >
                  <X className="text-gray-400 hover:text-red-400" size={12} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function formatTimestamp(timestamp: number): string {
  const now = Date.now()
  const diff = now - timestamp
  
  const minutes = Math.floor(diff / (1000 * 60))
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  
  if (minutes < 1) return 'À l\'instant'
  if (minutes < 60) return `Il y a ${minutes}min`
  if (hours < 24) return `Il y a ${hours}h`
  if (days < 7) return `Il y a ${days}j`
  
  return new Date(timestamp).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short'
  })
}