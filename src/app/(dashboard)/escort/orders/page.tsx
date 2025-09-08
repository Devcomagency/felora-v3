'use client'

import { useState } from 'react'
import DashboardLayout from '../../../../components/dashboard-v2/DashboardLayout'
import { Clock, CheckCircle, XCircle, Upload, MessageCircle, Eye, ShoppingBag } from 'lucide-react'

export default function EscortOrdersPage() {
  const [activeFilter, setActiveFilter] = useState<'all' | 'pending' | 'accepted' | 'delivered'>('all')

  const orders = [
    {
      id: '1',
      clientName: 'Marc_Geneva',
      clientAvatar: 'M',
      type: 'PHOTO',
      title: 'Photo personnalisée',
      description: 'Salut ! J\'aimerais une photo de toi en lingerie rouge avec un message personnalisé. C\'est pour mon anniversaire demain. Merci !',
      price: 150,
      status: 'pending',
      urgent: true,
      createdAt: '2024-01-20T14:30:00Z'
    },
    {
      id: '2',
      clientName: 'Alex_Lausanne',
      clientAvatar: 'A',
      type: 'VIDEO',
      title: 'Vidéo personnalisée - 5 min',
      description: 'Vidéo de danse sensuelle avec une tenue spécifique que j\'ai mentionnée.',
      price: 300,
      status: 'accepted',
      progress: 60,
      createdAt: '2024-01-19T10:15:00Z'
    },
    {
      id: '3',
      clientName: 'Thomas_Zurich',
      clientAvatar: 'T',
      type: 'PHOTO',
      title: 'Set de photos lifestyle',
      description: 'Un set de 5 photos dans différentes tenues décontractées.',
      price: 250,
      status: 'delivered',
      createdAt: '2024-01-18T16:45:00Z'
    },
    {
      id: '4',
      clientName: 'Pierre_Geneve',
      clientAvatar: 'P',
      type: 'VIDEO',
      title: 'Message vidéo personnalisé',
      description: 'Un message d\'encouragement pour mon examen médical.',
      price: 80,
      status: 'delivered',
      createdAt: '2024-01-17T09:20:00Z'
    }
  ]

  const filteredOrders = orders.filter(order => 
    activeFilter === 'all' || order.status === activeFilter
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'border-orange-500/30 bg-orange-500/20 text-orange-400'
      case 'accepted': return 'border-blue-500/30 bg-blue-500/20 text-blue-400'
      case 'delivered': return 'border-green-500/30 bg-green-500/20 text-green-400'
      default: return 'border-gray-500/30 bg-gray-500/20 text-gray-400'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock size={16} />
      case 'accepted': return <CheckCircle size={16} />
      case 'delivered': return <CheckCircle size={16} />
      default: return <XCircle size={16} />
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'En attente'
      case 'accepted': return 'En cours'
      case 'delivered': return 'Livrée'
      default: return 'Inconnue'
    }
  }

  return (
    <DashboardLayout 
      title="Commandes de Médias" 
      subtitle="Gérez vos commandes personnalisées et vos revenus"
    >
      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="p-6 bg-orange-500/10 border border-orange-500/30 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-orange-400">5</div>
              <div className="text-sm text-gray-400">En attente</div>
            </div>
            <Clock className="text-orange-400" size={24} />
          </div>
        </div>
        
        <div className="p-6 bg-blue-500/10 border border-blue-500/30 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-blue-400">3</div>
              <div className="text-sm text-gray-400">En production</div>
            </div>
            <Upload className="text-blue-400" size={24} />
          </div>
        </div>
        
        <div className="p-6 bg-green-500/10 border border-green-500/30 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-green-400">28</div>
              <div className="text-sm text-gray-400">Livrées ce mois</div>
            </div>
            <CheckCircle className="text-green-400" size={24} />
          </div>
        </div>
        
        <div className="p-6 bg-purple-500/10 border border-purple-500/30 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-purple-400">2,850 ♦</div>
              <div className="text-sm text-gray-400">Revenus ce mois</div>
            </div>
            <div className="w-6 h-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
              💎
            </div>
          </div>
        </div>
      </div>

      {/* Filtres */}
      <div className="mb-6">
        <div className="flex space-x-1 bg-gray-800/40 backdrop-blur-sm border border-gray-700/50 rounded-xl p-1">
          {[
            { key: 'all', label: 'Toutes', count: orders.length },
            { key: 'pending', label: 'En attente', count: orders.filter(o => o.status === 'pending').length },
            { key: 'accepted', label: 'En cours', count: orders.filter(o => o.status === 'accepted').length },
            { key: 'delivered', label: 'Livrées', count: orders.filter(o => o.status === 'delivered').length }
          ].map((filter) => (
            <button
              key={filter.key}
              onClick={() => setActiveFilter(filter.key as 'all' | 'pending' | 'accepted' | 'delivered')}
              className={`flex items-center space-x-2 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                activeFilter === filter.key
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                  : 'text-gray-400 hover:text-gray-300 hover:bg-gray-700/30'
              }`}
            >
              <span>{filter.label}</span>
              <span className="bg-gray-600 text-xs px-2 py-0.5 rounded-full">{filter.count}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Liste des commandes */}
      <div className="space-y-4">
        {filteredOrders.map((order) => (
          <div key={order.id} className={`p-6 rounded-xl border transition-all ${getStatusColor(order.status)}`}>
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold">
                  {order.clientAvatar}
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <div className="text-white font-medium">{order.clientName}</div>
                    {order.urgent && (
                      <span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs rounded-full border border-red-500/30">
                        URGENT
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-gray-400">
                    {new Date(order.createdAt).toLocaleDateString('fr-FR', {
                      day: '2-digit',
                      month: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-white">{order.price} ♦</div>
                <div className={`flex items-center space-x-1 text-xs px-2 py-1 rounded-full border ${getStatusColor(order.status)}`}>
                  {getStatusIcon(order.status)}
                  <span>{getStatusText(order.status)}</span>
                </div>
              </div>
            </div>
            
            <div className="mb-4">
              <div className="flex items-center space-x-2 mb-2">
                <span className={`px-2 py-1 text-xs rounded-full border ${
                  order.type === 'PHOTO' 
                    ? 'bg-purple-500/20 text-purple-400 border-purple-500/30'
                    : 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                }`}>
                  {order.type}
                </span>
                <div className="text-sm font-medium text-gray-300">{order.title}</div>
              </div>
              <div className="text-sm text-gray-400 bg-gray-700/50 rounded-lg p-3">
                {order.description}
              </div>
            </div>

            {/* Barre de progression pour commandes acceptées */}
            {order.status === 'accepted' && order.progress && (
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-400">Progression</span>
                  <span className="text-sm text-blue-400">{order.progress}%</span>
                </div>
                <div className="w-full bg-gray-600 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full transition-all duration-300" 
                    style={{ width: `${order.progress}%` }}
                  ></div>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-between">
              <div className="flex space-x-2">
                <button className="flex items-center space-x-2 px-3 py-2 bg-gray-600/20 text-gray-400 border border-gray-600/30 rounded-lg text-sm font-medium hover:bg-gray-600/30 transition-colors">
                  <MessageCircle size={16} />
                  <span>Chat</span>
                </button>
                {order.status === 'delivered' && (
                  <button className="flex items-center space-x-2 px-3 py-2 bg-green-600/20 text-green-400 border border-green-600/30 rounded-lg text-sm font-medium hover:bg-green-600/30 transition-colors">
                    <Eye size={16} />
                    <span>Voir livraison</span>
                  </button>
                )}
              </div>
              
              <div className="flex space-x-2">
                {order.status === 'pending' && (
                  <>
                    <button className="px-4 py-2 bg-red-600/20 text-red-400 border border-red-600/30 rounded-lg text-sm font-medium hover:bg-red-600/30 transition-colors">
                      Refuser
                    </button>
                    <button className="px-4 py-2 bg-green-600/20 text-green-400 border border-green-600/30 rounded-lg text-sm font-medium hover:bg-green-600/30 transition-colors">
                      Accepter
                    </button>
                  </>
                )}
                
                {order.status === 'accepted' && (
                  <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                    <Upload size={16} />
                    <span>Livrer</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredOrders.length === 0 && (
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShoppingBag size={32} className="text-gray-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-300 mb-2">Aucune commande</h3>
          <p className="text-gray-400">
            {activeFilter === 'all' 
              ? 'Vous n\'avez pas encore de commandes personnalisées'
              : `Aucune commande ${getStatusText(activeFilter)} pour le moment`
            }
          </p>
        </div>
      )}
    </DashboardLayout>
  )
}