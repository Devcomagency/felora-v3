'use client'

import { useState } from 'react'
import DashboardLayout from '../../../../components/dashboard-v2/DashboardLayout'
import { Eye, Heart, TrendingUp, Users, MessageCircle, DollarSign, Calendar, Clock } from 'lucide-react'

export default function EscortStatsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('month')

  const periods = [
    { key: 'week', label: 'Cette semaine' },
    { key: 'month', label: 'Ce mois' },
    { key: 'year', label: 'Cette année' }
  ]

  // Données simulées
  const stats = {
    week: {
      profileViews: 340,
      totalReactions: 45,
      newFollowers: 12,
      messages: 28,
      earnings: 580,
      bookings: 3
    },
    month: {
      profileViews: 2850,
      totalReactions: 245,
      newFollowers: 89,
      messages: 156,
      earnings: 3420,
      bookings: 18
    },
    year: {
      profileViews: 18500,
      totalReactions: 1240,
      newFollowers: 456,
      messages: 1200,
      earnings: 28900,
      bookings: 145
    }
  }

  const currentStats = stats[selectedPeriod]

  const topMedia = [
    { id: 1, url: 'https://picsum.photos/300/300?random=1', likes: 89, type: 'photo' },
    { id: 2, url: 'https://picsum.photos/300/300?random=2', likes: 76, type: 'video' },
    { id: 3, url: 'https://picsum.photos/300/300?random=3', likes: 65, type: 'photo' },
    { id: 4, url: 'https://picsum.photos/300/300?random=4', likes: 54, type: 'photo' },
    { id: 5, url: 'https://picsum.photos/300/300?random=5', likes: 43, type: 'video' }
  ]

  const recentActivity = [
    { type: 'view', text: 'Marc_Geneva a consulté votre profil', time: '2 min' },
    { type: 'like', text: 'Alex_Lausanne a liké votre photo', time: '15 min' },
    { type: 'message', text: 'Thomas_Zurich vous a envoyé un message', time: '1h' },
    { type: 'booking', text: 'Nouvelle réservation confirmée', time: '2h' },
    { type: 'reaction', text: 'Pierre_Genève a réagi avec ❤️', time: '3h' }
  ]

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'view': return <Eye size={16} className="text-blue-400" />
      case 'like': return <Heart size={16} className="text-pink-400" />
      case 'message': return <MessageCircle size={16} className="text-green-400" />
      case 'booking': return <Calendar size={16} className="text-purple-400" />
      case 'reaction': return <span className="text-red-400">❤️</span>
      default: return <Clock size={16} className="text-gray-400" />
    }
  }

  return (
    <DashboardLayout 
      title="Statistiques" 
      subtitle="Analysez vos performances et votre audience"
    >
      {/* Sélecteur de période */}
      <div className="mb-8">
        <div className="flex space-x-1 bg-gray-800/40 backdrop-blur-sm border border-gray-700/50 rounded-xl p-1 w-fit">
          {periods.map((period) => (
            <button
              key={period.key}
              onClick={() => setSelectedPeriod(period.key as any)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                selectedPeriod === period.key
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                  : 'text-gray-400 hover:text-gray-300 hover:bg-gray-700/30'
              }`}
            >
              {period.label}
            </button>
          ))}
        </div>
      </div>

      {/* Métriques principales */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-8">
        <div className="p-6 bg-gray-800/40 backdrop-blur-sm border border-gray-700/50 rounded-xl">
          <div className="flex items-center justify-between mb-2">
            <Eye className="text-blue-400" size={24} />
            <TrendingUp size={16} className="text-green-400" />
          </div>
          <div className="text-2xl font-bold text-white">{currentStats.profileViews.toLocaleString()}</div>
          <div className="text-sm text-gray-400">Vues profil</div>
        </div>

        <div className="p-6 bg-gray-800/40 backdrop-blur-sm border border-gray-700/50 rounded-xl">
          <div className="flex items-center justify-between mb-2">
            <Heart className="text-pink-400" size={24} />
            <TrendingUp size={16} className="text-green-400" />
          </div>
          <div className="text-2xl font-bold text-white">{currentStats.totalReactions}</div>
          <div className="text-sm text-gray-400">Réactions</div>
        </div>

        {/* Carte "Nouveaux fans" retirée */}

        <div className="p-6 bg-gray-800/40 backdrop-blur-sm border border-gray-700/50 rounded-xl">
          <div className="flex items-center justify-between mb-2">
            <MessageCircle className="text-green-400" size={24} />
            <TrendingUp size={16} className="text-green-400" />
          </div>
          <div className="text-2xl font-bold text-white">{currentStats.messages}</div>
          <div className="text-sm text-gray-400">Messages</div>
        </div>

        <div className="p-6 bg-gray-800/40 backdrop-blur-sm border border-gray-700/50 rounded-xl">
          <div className="flex items-center justify-between mb-2">
            <DollarSign className="text-yellow-400" size={24} />
            <TrendingUp size={16} className="text-green-400" />
          </div>
          <div className="text-2xl font-bold text-white">{currentStats.earnings} ♦</div>
          <div className="text-sm text-gray-400">Revenus</div>
        </div>

        {/* Carte "Réservations" retirée */}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Médias les plus populaires */}
        <div className="bg-gray-800/40 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6">
          <h3 className="text-xl font-bold text-white mb-6">Médias les plus populaires</h3>
          <div className="space-y-4">
            {topMedia.map((media, index) => (
              <div key={media.id} className="flex items-center space-x-4 p-3 bg-gray-700/30 rounded-lg">
                <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full text-white font-bold text-sm">
                  {index + 1}
                </div>
                <div className="w-12 h-12 rounded-lg overflow-hidden">
                  <img src={media.url} alt={`Média ${media.id}`} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-white font-medium">
                      {media.type === 'video' ? '📹' : '📸'} {media.type === 'video' ? 'Vidéo' : 'Photo'} #{media.id}
                    </span>
                  </div>
                  <div className="text-sm text-gray-400">Publié il y a 3 jours</div>
                </div>
                <div className="flex items-center space-x-1 text-pink-400">
                  <Heart size={16} />
                  <span className="font-semibold">{media.likes}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Activité récente */}
        <div className="bg-gray-800/40 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6">
          <h3 className="text-xl font-bold text-white mb-6">Activité récente</h3>
          <div className="space-y-4">
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 hover:bg-gray-700/20 rounded-lg transition-colors">
                <div className="mt-0.5">
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1">
                  <p className="text-white text-sm">{activity.text}</p>
                  <p className="text-gray-400 text-xs mt-1">Il y a {activity.time}</p>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-4 py-2 text-sm text-gray-400 hover:text-white transition-colors">
            Voir toute l'activité
          </button>
        </div>
      </div>

      {/* Graphiques simulés */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Évolution des vues */}
        <div className="bg-gray-800/40 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6">
          <h3 className="text-xl font-bold text-white mb-6">Évolution des vues de profil</h3>
          <div className="h-64 flex items-end justify-center space-x-2">
            {[45, 78, 56, 89, 67, 95, 82, 76, 91, 68, 84, 92, 78, 85].map((height, index) => (
              <div key={index} className="flex flex-col items-center">
                <div 
                  className="w-6 bg-gradient-to-t from-purple-500 to-pink-500 rounded-t"
                  style={{ height: `${height}%` }}
                ></div>
                <span className="text-xs text-gray-400 mt-1">{index + 1}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 flex justify-center">
            <span className="text-sm text-gray-400">Derniers 14 jours</span>
          </div>
        </div>

        {/* Répartition des revenus */}
        <div className="bg-gray-800/40 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6">
          <h3 className="text-xl font-bold text-white mb-6">Sources de revenus</h3>
          <div className="space-y-4">
            {/* Ligne "Commandes privées" retirée */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-4 h-4 bg-gradient-to-r from-blue-500 to-cyan-500 rounded"></div>
                <span className="text-white">Médias payants</span>
              </div>
              <div className="text-right">
                <div className="text-white font-semibold">980 ♦</div>
                <div className="text-xs text-gray-400">29%</div>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-4 h-4 bg-gradient-to-r from-green-500 to-emerald-500 rounded"></div>
                <span className="text-white">Cadeaux reçus</span>
              </div>
              <div className="text-right">
                <div className="text-white font-semibold">590 ♦</div>
                <div className="text-xs text-gray-400">17%</div>
              </div>
            </div>
          </div>
          
          {/* Graphique en barres horizontal simulé */}
          <div className="mt-6 space-y-2">
            {/* Barre "Commandes privées" retirée */}
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full" style={{ width: '29%' }}></div>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full" style={{ width: '17%' }}></div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
