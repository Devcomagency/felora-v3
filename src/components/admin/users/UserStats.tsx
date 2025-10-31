'use client'

import React from 'react'
import { TrendingUp, Users, Shield, Calendar, CheckCircle, Ban, DollarSign, ArrowUp, ArrowDown } from 'lucide-react'
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, LineChart, Line } from 'recharts'
import { getCategoryLabelWithIcon, ESCORT_CATEGORY_ICONS, getCategoryLabel } from '@/lib/constants/escort-categories'

interface Statistics {
  totalUsers: number
  totalEscorts: number
  totalClubs: number
  totalClients: number
  totalBanned: number
  newThisWeek: number
  activeUsers: number
  verifiedProfiles: number
  activeSubscriptions: number
  expiredSubscriptions: number
  escortsByCategory?: Record<string, number> // Nouveaux stats par catégorie
}

interface UserStatsProps {
  statistics: Statistics
  previousStats?: Statistics // Pour comparaison période précédente
}

const COLORS = ['#FF6B9D', '#B794F6', '#4FD1C7', '#00F5FF']

export default function UserStats({ statistics, previousStats }: UserStatsProps) {
  // Données pour le graphique en camembert (répartition par rôle)
  const roleData = [
    { name: 'Escorts', value: statistics.totalEscorts, color: COLORS[0] },
    { name: 'Clubs', value: statistics.totalClubs, color: COLORS[1] },
    { name: 'Clients', value: statistics.totalClients, color: COLORS[2] }
  ]

  // Données pour les abonnements
  const subscriptionData = [
    { name: 'Actifs', value: statistics.activeSubscriptions, color: '#10B981' },
    { name: 'Expirés', value: statistics.expiredSubscriptions, color: '#F59E0B' },
    {
      name: 'Sans',
      value: statistics.totalUsers - statistics.activeSubscriptions - statistics.expiredSubscriptions,
      color: '#6B7280'
    }
  ]

  // Calcul des variations vs période précédente
  const getVariation = (current: number, previous?: number) => {
    if (!previous || previous === 0) return null
    const variation = ((current - previous) / previous) * 100
    return {
      value: variation,
      isPositive: variation > 0
    }
  }

  const StatCard = ({
    icon: Icon,
    title,
    value,
    subtitle,
    color,
    previousValue
  }: {
    icon: any,
    title: string,
    value: number,
    subtitle?: string,
    color: string,
    previousValue?: number
  }) => {
    const variation = getVariation(value, previousValue)

    return (
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-all">
        <div className="flex items-start justify-between mb-3">
          <div className={`p-2 rounded-lg bg-gradient-to-br ${color}`}>
            <Icon size={20} className="text-white" />
          </div>
          {variation && (
            <div className={`flex items-center gap-1 text-xs ${variation.isPositive ? 'text-green-400' : 'text-red-400'}`}>
              {variation.isPositive ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
              <span>{Math.abs(variation.value).toFixed(1)}%</span>
            </div>
          )}
        </div>
        <div className="text-2xl font-bold text-white mb-1">{value.toLocaleString()}</div>
        <div className="text-xs text-white/60">{title}</div>
        {subtitle && <div className="text-xs text-white/40 mt-1">{subtitle}</div>}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Statistiques principales */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <StatCard
          icon={Users}
          title="Total Utilisateurs"
          value={statistics.totalUsers}
          subtitle={`E:${statistics.totalEscorts} C:${statistics.totalClubs} U:${statistics.totalClients}`}
          color="from-purple-500 to-pink-500"
          previousValue={previousStats?.totalUsers}
        />

        <StatCard
          icon={Calendar}
          title="Nouveaux (7j)"
          value={statistics.newThisWeek}
          color="from-green-500 to-emerald-500"
          previousValue={previousStats?.newThisWeek}
        />

        <StatCard
          icon={Shield}
          title="Actifs (30j)"
          value={statistics.activeUsers}
          color="from-blue-500 to-cyan-500"
          previousValue={previousStats?.activeUsers}
        />

        <StatCard
          icon={CheckCircle}
          title="Vérifiés"
          value={statistics.verifiedProfiles}
          color="from-cyan-500 to-teal-500"
          previousValue={previousStats?.verifiedProfiles}
        />

        <StatCard
          icon={Ban}
          title="Bannis"
          value={statistics.totalBanned}
          color="from-red-500 to-rose-500"
          previousValue={previousStats?.totalBanned}
        />
      </div>

      {/* Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Répartition par rôle */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Répartition par Rôle</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={roleData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={70}
                fill="#8884d8"
                dataKey="value"
              >
                {roleData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(0,0,0,0.9)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  color: 'white'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
            {roleData.map((item, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded" style={{ backgroundColor: item.color }}></div>
                <span className="text-white/60">{item.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Abonnements */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Abonnements</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={subscriptionData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={70}
                fill="#8884d8"
                dataKey="value"
              >
                {subscriptionData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(0,0,0,0.9)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  color: 'white'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-white/60">Actifs:</span>
              <span className="text-green-400 font-medium">{statistics.activeSubscriptions}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/60">Expirés:</span>
              <span className="text-orange-400 font-medium">{statistics.expiredSubscriptions}</span>
            </div>
          </div>
        </div>

        {/* Taux de vérification */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Taux de Vérification</h3>
          <div className="h-[200px] flex flex-col justify-center">
            <div className="text-center mb-6">
              <div className="text-5xl font-bold bg-gradient-to-r from-cyan-400 to-teal-400 bg-clip-text text-transparent mb-2">
                {statistics.totalUsers > 0
                  ? ((statistics.verifiedProfiles / statistics.totalUsers) * 100).toFixed(1)
                  : 0}%
              </div>
              <div className="text-sm text-white/60">
                {statistics.verifiedProfiles} / {statistics.totalUsers} vérifiés
              </div>
            </div>

            {/* Barre de progression */}
            <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 to-teal-500 rounded-full transition-all duration-500"
                style={{
                  width: statistics.totalUsers > 0
                    ? `${(statistics.verifiedProfiles / statistics.totalUsers) * 100}%`
                    : '0%'
                }}
              ></div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
              <div className="text-center p-2 bg-white/5 rounded">
                <div className="text-white/60">À vérifier</div>
                <div className="text-white font-medium mt-1">
                  {statistics.totalUsers - statistics.verifiedProfiles}
                </div>
              </div>
              <div className="text-center p-2 bg-white/5 rounded">
                <div className="text-white/60">Bannis</div>
                <div className="text-red-400 font-medium mt-1">
                  {statistics.totalBanned}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Statistiques détaillées par rôle */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Détails par Rôle</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-gradient-to-br from-pink-500/10 to-pink-600/5 border border-pink-500/20 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <span className="text-pink-400 font-medium">Escorts</span>
              <span className="text-2xl font-bold text-white">{statistics.totalEscorts}</span>
            </div>
            <div className="text-xs text-white/60 space-y-1">
              <div>• {((statistics.totalEscorts / statistics.totalUsers) * 100).toFixed(1)}% du total</div>
            </div>
          </div>

          <div className="p-4 bg-gradient-to-br from-purple-500/10 to-purple-600/5 border border-purple-500/20 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <span className="text-purple-400 font-medium">Clubs</span>
              <span className="text-2xl font-bold text-white">{statistics.totalClubs}</span>
            </div>
            <div className="text-xs text-white/60 space-y-1">
              <div>• {((statistics.totalClubs / statistics.totalUsers) * 100).toFixed(1)}% du total</div>
            </div>
          </div>

          <div className="p-4 bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/20 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <span className="text-blue-400 font-medium">Clients</span>
              <span className="text-2xl font-bold text-white">{statistics.totalClients}</span>
            </div>
            <div className="text-xs text-white/60 space-y-1">
              <div>• {((statistics.totalClients / statistics.totalUsers) * 100).toFixed(1)}% du total</div>
            </div>
          </div>
        </div>
      </div>

      {/* Statistiques par catégorie d'escortes */}
      {statistics.escortsByCategory && Object.keys(statistics.escortsByCategory).length > 0 && (
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">
            Répartition des Indépendantes par Catégorie
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {Object.entries(statistics.escortsByCategory).map(([category, count]) => (
              <div
                key={category}
                className="p-4 bg-gradient-to-br from-pink-500/10 to-purple-600/5 border border-pink-500/20 rounded-lg hover:from-pink-500/20 hover:to-purple-600/10 transition-all"
              >
                <div className="text-center">
                  <div className="text-2xl font-bold text-white mb-1">{count}</div>
                  <div className="text-sm text-white/80 font-medium mb-1">{getCategoryLabel(category)}</div>
                  {statistics.totalEscorts > 0 && (
                    <div className="text-xs text-pink-400">
                      {((count / statistics.totalEscorts) * 100).toFixed(1)}%
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
