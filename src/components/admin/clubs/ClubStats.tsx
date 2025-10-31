'use client'

import { Eye, TrendingUp, Users, MessageCircle } from 'lucide-react'

interface ClubStatsProps {
  views: number
  escortCount: number
  viewsTrend?: number // Pourcentage de changement
}

export default function ClubStats({ views, escortCount, viewsTrend }: ClubStatsProps) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {/* Vues */}
      <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-3">
        <div className="flex items-center gap-2 mb-1">
          <Eye className="text-purple-400" size={14} />
          <span className="text-xs text-gray-400">Vues</span>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-lg font-bold text-white">{views.toLocaleString()}</span>
          {viewsTrend !== undefined && viewsTrend !== 0 && (
            <span className={`text-xs flex items-center gap-0.5 ${
              viewsTrend > 0 ? 'text-green-400' : 'text-red-400'
            }`}>
              <TrendingUp size={10} className={viewsTrend < 0 ? 'rotate-180' : ''} />
              {Math.abs(viewsTrend)}%
            </span>
          )}
        </div>
      </div>

      {/* Escorts */}
      <div className="bg-pink-500/10 border border-pink-500/20 rounded-lg p-3">
        <div className="flex items-center gap-2 mb-1">
          <Users className="text-pink-400" size={14} />
          <span className="text-xs text-gray-400">Escorts</span>
        </div>
        <span className="text-lg font-bold text-white">{escortCount}</span>
      </div>
    </div>
  )
}
