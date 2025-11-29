'use client'

import { useState, useEffect } from 'react'
import {
  TrendingUp,
  TrendingDown,
  Users,
  Activity,
  Image as ImageIcon,
  MapPin,
  BarChart3,
  Eye,
  Heart,
  MessageSquare,
  DollarSign,
  Shield,
  AlertTriangle,
  Star,
  Flag,
  Target,
  Lightbulb,
  AlertCircle,
  CheckCircle2
} from 'lucide-react'
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'

// Types
type Tab = 'overview' | 'users' | 'engagement' | 'content' | 'geography'

type InsightType = 'success' | 'warning' | 'opportunity' | 'info' | 'alert'

interface Insight {
  type: InsightType
  icon: string
  title: string
  message: string
  action?: string
  data?: any
}

// Couleurs Felora
const COLORS = {
  aurora: '#FF6B9D',
  neon: '#00F5FF',
  plasma: '#B794F6',
  quantum: '#4FD1C7',
  neural: '#7C3AED'
}

const CHART_COLORS = [COLORS.aurora, COLORS.plasma, COLORS.quantum, COLORS.neon, COLORS.neural]

export default function AnalyticsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('overview')
  const [loading, setLoading] = useState(false)

  return (
    <div className="min-h-screen bg-gradient-to-br from-felora-obsidian via-felora-charcoal to-felora-steel">
      <div className="max-w-[1920px] mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Analytics Dashboard
          </h1>
          <p className="text-white/60">
            Vue complète des performances et insights de la plateforme Felora
          </p>
        </div>

        {/* Tabs Navigation */}
        <div className="flex gap-2 mb-8 bg-black/20 p-2 rounded-2xl backdrop-blur-sm border border-white/10 overflow-x-auto">
          <TabButton
            active={activeTab === 'overview'}
            onClick={() => setActiveTab('overview')}
            icon={<BarChart3 size={18} />}
            label="Vue d'ensemble"
          />
          <TabButton
            active={activeTab === 'users'}
            onClick={() => setActiveTab('users')}
            icon={<Users size={18} />}
            label="Utilisateurs"
          />
          <TabButton
            active={activeTab === 'engagement'}
            onClick={() => setActiveTab('engagement')}
            icon={<Activity size={18} />}
            label="Engagement"
          />
          <TabButton
            active={activeTab === 'content'}
            onClick={() => setActiveTab('content')}
            icon={<ImageIcon size={18} />}
            label="Contenu"
          />
          <TabButton
            active={activeTab === 'geography'}
            onClick={() => setActiveTab('geography')}
            icon={<MapPin size={18} />}
            label="Géographie"
          />
        </div>

        {/* Tab Content */}
        <div className="min-h-[600px]">
          {activeTab === 'overview' && <OverviewTab />}
          {activeTab === 'users' && <UsersTab />}
          {activeTab === 'engagement' && <EngagementTab />}
          {activeTab === 'content' && <ContentTab />}
          {activeTab === 'geography' && <GeographyTab />}
        </div>
      </div>
    </div>
  )
}

// ============================================
// TAB BUTTON
// ============================================

function TabButton({
  active,
  onClick,
  icon,
  label
}: {
  active: boolean
  onClick: () => void
  icon: React.ReactNode
  label: string
}) {
  return (
    <button
      onClick={onClick}
      className={`
        flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all whitespace-nowrap
        ${active
          ? 'bg-gradient-to-r from-felora-aurora to-felora-plasma text-white shadow-lg'
          : 'text-white/60 hover:text-white hover:bg-white/5'
        }
      `}
    >
      {icon}
      <span className="text-sm">{label}</span>
    </button>
  )
}

// ============================================
// OVERVIEW TAB
// ============================================

function OverviewTab() {
  const [data, setData] = useState<any>(null)
  const [insights, setInsights] = useState<Insight[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch('/api/admin/analytics/overview').then(r => r.json()),
      fetch('/api/admin/analytics/insights').then(r => r.json())
    ]).then(([overviewData, insightsData]) => {
      setData(overviewData)
      setInsights(insightsData.insights || [])
      setLoading(false)
    }).catch(err => {
      console.error('Failed to load overview:', err)
      setLoading(false)
    })
  }, [])

  if (loading) return <LoadingState />
  if (!data) return <ErrorState />

  return (
    <div className="space-y-6">
      {/* Hero KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          label="Escortes actives"
          value={data.kpis?.activeEscorts?.value || 0}
          change={`+${data.kpis?.activeEscorts?.change || 0}%`}
          trend="up"
          icon={<Users size={24} className="text-felora-aurora" />}
        />
        <KPICard
          label="Vues totales"
          value={formatNumber(data.kpis?.totalViews?.value || 0)}
          change={`+${data.kpis?.totalViews?.change || 0}%`}
          trend="up"
          icon={<Eye size={24} className="text-felora-neon" />}
        />
        <KPICard
          label="Contacts (30j)"
          value={data.kpis?.totalContacts?.value || 0}
          change={`+${data.kpis?.totalContacts?.change || 0}%`}
          trend="up"
          icon={<MessageSquare size={24} className="text-felora-plasma" />}
        />
        <KPICard
          label="Revenus (30j)"
          value={`CHF ${formatNumber(data.kpis?.totalRevenue?.value || 0)}`}
          change={`+${data.kpis?.totalRevenue?.change || 0}%`}
          trend="up"
          icon={<DollarSign size={24} className="text-felora-quantum" />}
        />
      </div>

      {/* Insights automatiques */}
      {insights.length > 0 && (
        <BentoCard className="lg:col-span-full">
          <CardHeader title="🔥 Insights automatiques" subtitle="Détection intelligente des tendances" />
          <div className="space-y-3 mt-4">
            {insights.slice(0, 5).map((insight, idx) => (
              <InsightCard key={idx} insight={insight} />
            ))}
          </div>
        </BentoCard>
      )}

      {/* Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Vérification KYC */}
        <BentoCard>
          <CardHeader title="Vérification KYC" />
          <div className="space-y-3 mt-4">
            <ProgressBar
              label="Approuvés"
              value={data.verification?.approvalRate || 0}
              color="green-500"
              showValue={`${data.verification?.approved || 0}`}
            />
            <ProgressBar
              label="En attente"
              value={((data.verification?.pending || 0) / (data.verification?.total || 1)) * 100}
              color="yellow-500"
              showValue={`${data.verification?.pending || 0}`}
            />
            <ProgressBar
              label="Rejetés"
              value={((data.verification?.rejected || 0) / (data.verification?.total || 1)) * 100}
              color="red-500"
              showValue={`${data.verification?.rejected || 0}`}
            />
          </div>
        </BentoCard>

        {/* Alertes système */}
        <BentoCard>
          <CardHeader title="Alertes système" />
          <div className="space-y-3 mt-4">
            <AlertItem
              count={data.alerts?.pendingReports || 0}
              label="Signalements"
              severity={data.alerts?.pendingReports > 5 ? 'warning' : 'info'}
            />
            <AlertItem
              count={data.alerts?.suspendedAccounts || 0}
              label="Comptes suspendus"
              severity="info"
            />
            <AlertItem
              count={data.alerts?.flaggedMedia || 0}
              label="Médias flagués"
              severity={data.alerts?.flaggedMedia > 3 ? 'warning' : 'info'}
            />
          </div>
        </BentoCard>

        {/* Top performers */}
        <BentoCard>
          <CardHeader title="Top performers" subtitle="Cette semaine" />
          <div className="space-y-2 mt-4">
            {data.topPerformers?.slice(0, 5).map((performer: any, idx: number) => (
              <TopPerformer key={idx} name={performer.name} views={performer.views} />
            ))}
          </div>
        </BentoCard>
      </div>
    </div>
  )
}

// ============================================
// USERS TAB
// ============================================

function UsersTab() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/analytics/users')
      .then(r => r.json())
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <LoadingState />
  if (!data) return <ErrorState />

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          label="Total utilisateurs"
          value={formatNumber(data.overview?.totalUsers || 0)}
          change={`+${data.overview?.growthRate || 0}%`}
          trend="up"
          icon={<Users size={24} className="text-felora-aurora" />}
        />
        <KPICard
          label="Nouveaux (30j)"
          value={data.overview?.newUsers30d || 0}
          change={`+${data.overview?.newUsers7d || 0} (7j)`}
          trend="neutral"
          icon={<TrendingUp size={24} className="text-felora-neon" />}
        />
        <KPICard
          label="Escortes"
          value={data.escorts?.total || 0}
          change={`${data.escorts?.verified || 0} vérifiés`}
          trend="neutral"
          icon={<Users size={24} className="text-felora-plasma" />}
        />
        <KPICard
          label="Actifs (7j)"
          value={data.overview?.active7d || 0}
          change={`${data.retention?.day7 || 0}% rétention`}
          trend="neutral"
          icon={<Activity size={24} className="text-felora-quantum" />}
        />
      </div>

      {/* Croissance */}
      <BentoCard className="lg:col-span-2">
        <CardHeader title="Croissance utilisateurs" subtitle="30 derniers jours" />
        <div className="h-[400px] mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data.dailyGrowth || []}>
              <defs>
                <linearGradient id="colorEscorts" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={COLORS.aurora} stopOpacity={0.3}/>
                  <stop offset="95%" stopColor={COLORS.aurora} stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorClients" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={COLORS.neon} stopOpacity={0.3}/>
                  <stop offset="95%" stopColor={COLORS.neon} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
              <XAxis dataKey="date" stroke="#ffffff60" />
              <YAxis stroke="#ffffff60" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1A1A1A',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  color: '#fff'
                }}
              />
              <Legend />
              <Area
                type="monotone"
                dataKey="escorts"
                stroke={COLORS.aurora}
                fillOpacity={1}
                fill="url(#colorEscorts)"
                name="Escortes"
              />
              <Area
                type="monotone"
                dataKey="clients"
                stroke={COLORS.neon}
                fillOpacity={1}
                fill="url(#colorClients)"
                name="Clients"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </BentoCard>

      {/* Répartition par rôle */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <BentoCard>
          <CardHeader title="Répartition par rôle" />
          <div className="h-[250px] mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.byRole || []}
                  dataKey="count"
                  nameKey="role"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={(entry) => `${entry.role} (${entry.percentage}%)`}
                >
                  {(data.byRole || []).map((_: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1A1A1A',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    color: '#fff'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </BentoCard>

        <BentoCard>
          <CardHeader title="Statuts escortes" />
          <div className="space-y-2 mt-4">
            {data.escorts?.byStatus?.map((s: any, idx: number) => (
              <StatusItem
                key={idx}
                label={s.status}
                count={s.count}
                color={s.status === 'ACTIVE' ? 'green' : s.status === 'PENDING' ? 'yellow' : 'red'}
              />
            ))}
          </div>
        </BentoCard>
      </div>
    </div>
  )
}

// ============================================
// ENGAGEMENT TAB
// ============================================

function EngagementTab() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/analytics/engagement')
      .then(r => r.json())
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <LoadingState />
  if (!data) return <ErrorState />

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          label="Vues profil"
          value={formatNumber(data.overview?.totalViews || 0)}
          change={`Moy: ${data.overview?.avgViewsPerProfile || 0}`}
          trend="neutral"
          icon={<Eye size={24} className="text-felora-aurora" />}
        />
        <KPICard
          label="Likes"
          value={formatNumber(data.overview?.totalLikes || 0)}
          change={`+${data.media?.totalLikes || 0} médias`}
          trend="neutral"
          icon={<Heart size={24} className="text-felora-neon" />}
        />
        <KPICard
          label="Messages (30j)"
          value={data.recent?.messages30d || 0}
          change={`${data.recent?.messages7d || 0} (7j)`}
          trend="neutral"
          icon={<MessageSquare size={24} className="text-felora-plasma" />}
        />
        <KPICard
          label="Taux conversion"
          value={`${data.overview?.conversionRate || 0}%`}
          change="Vues → Contacts"
          trend="neutral"
          icon={<Target size={24} className="text-felora-quantum" />}
        />
      </div>

      {/* Engagement quotidien */}
      <BentoCard className="lg:col-span-2">
        <CardHeader title="Engagement quotidien" subtitle="Messages et commandes" />
        <div className="h-[400px] mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.dailyEngagement || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
              <XAxis dataKey="date" stroke="#ffffff60" />
              <YAxis stroke="#ffffff60" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1A1A1A',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  color: '#fff'
                }}
              />
              <Legend />
              <Bar dataKey="messages" fill={COLORS.plasma} name="Messages" />
              <Bar dataKey="orders" fill={COLORS.quantum} name="Commandes" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </BentoCard>

      {/* Top escorts */}
      <BentoCard>
        <CardHeader title="Top 10 escorts" subtitle="Par engagement" />
        <div className="space-y-2 mt-4 max-h-[400px] overflow-y-auto">
          {data.topEscorts?.map((escort: any, idx: number) => (
            <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
              <div>
                <div className="text-white font-medium">{escort.name}</div>
                <div className="text-white/60 text-sm">{escort.city} • {escort.category}</div>
              </div>
              <div className="text-right">
                <div className="text-felora-aurora font-bold">{formatNumber(escort.views)}</div>
                <div className="text-white/60 text-xs">{escort.likes} likes</div>
              </div>
            </div>
          ))}
        </div>
      </BentoCard>
    </div>
  )
}

// ============================================
// CONTENT TAB
// ============================================

function ContentTab() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/analytics/content')
      .then(r => r.json())
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <LoadingState />
  if (!data) return <ErrorState />

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          label="Total médias"
          value={formatNumber(data.overview?.totalMedias || 0)}
          change={`+${data.overview?.uploads30d || 0} (30j)`}
          trend="up"
          icon={<ImageIcon size={24} className="text-felora-aurora" />}
        />
        <KPICard
          label="Uploads (7j)"
          value={data.overview?.uploads7d || 0}
          change="Cette semaine"
          trend="neutral"
          icon={<TrendingUp size={24} className="text-felora-neon" />}
        />
        <KPICard
          label="Signalements"
          value={data.overview?.reportedMedia || 0}
          change={`${data.reports?.pending || 0} en attente`}
          trend="neutral"
          icon={<Flag size={24} className="text-felora-plasma" />}
        />
        <KPICard
          label="Taux modération"
          value={`${data.overview?.moderationRate || 0}%`}
          change="Traités"
          trend="up"
          icon={<Shield size={24} className="text-felora-quantum" />}
        />
      </div>

      {/* Uploads quotidiens */}
      <BentoCard className="lg:col-span-2">
        <CardHeader title="Uploads quotidiens" subtitle="30 derniers jours" />
        <div className="h-[400px] mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data.dailyUploads || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
              <XAxis dataKey="date" stroke="#ffffff60" />
              <YAxis stroke="#ffffff60" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1A1A1A',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  color: '#fff'
                }}
              />
              <Legend />
              <Line type="monotone" dataKey="images" stroke={COLORS.aurora} strokeWidth={2} name="Images" />
              <Line type="monotone" dataKey="videos" stroke={COLORS.plasma} strokeWidth={2} name="Vidéos" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </BentoCard>

      {/* Répartition */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <BentoCard>
          <CardHeader title="Par type" />
          <div className="space-y-3 mt-4">
            {data.byType?.map((type: any, idx: number) => (
              <ProgressBar
                key={idx}
                label={type.type}
                value={parseFloat(type.percentage)}
                color="felora-quantum"
                showValue={`${type.count} (${type.percentage}%)`}
              />
            ))}
          </div>
        </BentoCard>

        <BentoCard>
          <CardHeader title="Par visibilité" />
          <div className="space-y-3 mt-4">
            {data.byVisibility?.map((vis: any, idx: number) => (
              <ProgressBar
                key={idx}
                label={vis.visibility}
                value={parseFloat(vis.percentage)}
                color="felora-aurora"
                showValue={`${vis.count} (${vis.percentage}%)`}
              />
            ))}
          </div>
        </BentoCard>
      </div>
    </div>
  )
}

// ============================================
// GEOGRAPHY TAB
// ============================================

function GeographyTab() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/analytics/geography')
      .then(r => r.json())
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <LoadingState />
  if (!data) return <ErrorState />

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          label="Cantons actifs"
          value={data.overview?.totalCantons || 0}
          change="Couverture complète"
          trend="neutral"
          icon={<MapPin size={24} className="text-felora-aurora" />}
        />
        <KPICard
          label="Villes couvertes"
          value={data.overview?.totalCities || 0}
          change="En Suisse"
          trend="neutral"
          icon={<MapPin size={24} className="text-felora-neon" />}
        />
        <KPICard
          label="Canton #1"
          value={data.overview?.topCanton?.name || '-'}
          change={`${data.overview?.topCanton?.count || 0} profils`}
          trend="neutral"
          icon={<Star size={24} className="text-felora-plasma" />}
        />
        <KPICard
          label="Croissance #1"
          value={data.overview?.fastestGrowing?.name || '-'}
          change={`+${data.overview?.fastestGrowing?.growth || 0}%`}
          trend="up"
          icon={<TrendingUp size={24} className="text-felora-quantum" />}
        />
      </div>

      {/* Top villes */}
      <BentoCard className="lg:col-span-2">
        <CardHeader title="Top villes" subtitle="Par vues totales" />
        <div className="h-[400px] mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.byCity?.slice(0, 10) || []} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
              <XAxis type="number" stroke="#ffffff60" />
              <YAxis dataKey="city" type="category" stroke="#ffffff60" width={100} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1A1A1A',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  color: '#fff'
                }}
              />
              <Bar dataKey="totalViews" fill={COLORS.aurora} name="Vues totales" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </BentoCard>

      {/* Opportunités */}
      {data.opportunities && data.opportunities.length > 0 && (
        <BentoCard>
          <CardHeader title="🎯 Opportunités géographiques" subtitle="Villes sous-servies" />
          <div className="space-y-2 mt-4">
            {data.opportunities.slice(0, 5).map((opp: any, idx: number) => (
              <div
                key={idx}
                className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg"
              >
                <div className="font-semibold text-green-400">{opp.city}</div>
                <div className="text-white/70 text-sm">{opp.reason}</div>
                <div className="text-white/60 text-xs mt-1">
                  {opp.escorts} escorts • {opp.avgViews} vues moy
                </div>
              </div>
            ))}
          </div>
        </BentoCard>
      )}
    </div>
  )
}

// ============================================
// UI COMPONENTS
// ============================================

function BentoCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-black/20 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:border-white/20 transition-all ${className}`}>
      {children}
    </div>
  )
}

function CardHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-4">
      <h3 className="text-lg font-semibold text-white">{title}</h3>
      {subtitle && <p className="text-sm text-white/60 mt-1">{subtitle}</p>}
    </div>
  )
}

function KPICard({
  label,
  value,
  change,
  trend,
  icon
}: {
  label: string
  value: string | number
  change: string
  trend: 'up' | 'down' | 'neutral'
  icon: React.ReactNode
}) {
  const trendColor = trend === 'up' ? 'text-green-400' : trend === 'down' ? 'text-red-400' : 'text-white/60'

  return (
    <BentoCard>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-white/60 mb-2">{label}</p>
          <p className="text-3xl font-bold text-white mb-1">{value}</p>
          <p className={`text-sm font-medium ${trendColor}`}>{change}</p>
        </div>
        <div className="p-3 bg-white/5 rounded-xl">{icon}</div>
      </div>
    </BentoCard>
  )
}

function ProgressBar({
  label,
  value,
  color,
  showValue
}: {
  label: string
  value: number
  color: string
  showValue?: string
}) {
  return (
    <div>
      <div className="flex justify-between text-sm text-white/80 mb-1">
        <span>{label}</span>
        <span className="font-semibold">{showValue || `${value}%`}</span>
      </div>
      <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all bg-${color}`}
          style={{ width: `${Math.min(100, value)}%` }}
        />
      </div>
    </div>
  )
}

function AlertItem({
  count,
  label,
  severity
}: {
  count: number
  label: string
  severity: 'warning' | 'info' | 'error'
}) {
  const colors = {
    warning: 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400',
    info: 'bg-blue-500/10 border-blue-500/30 text-blue-400',
    error: 'bg-red-500/10 border-red-500/30 text-red-400'
  }

  return (
    <div className={`flex items-center justify-between p-3 rounded-lg border ${colors[severity]}`}>
      <span className="text-sm font-medium">{label}</span>
      <span className="text-lg font-bold">{count}</span>
    </div>
  )
}

function TopPerformer({ name, views }: { name: string; views: number }) {
  return (
    <div className="flex items-center justify-between p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
      <span className="text-sm text-white">{name}</span>
      <span className="text-sm font-semibold text-felora-aurora">{formatNumber(views)}</span>
    </div>
  )
}

function StatusItem({ label, count, color }: { label: string; count: number; color: string }) {
  return (
    <div className="flex items-center justify-between p-2 rounded-lg bg-white/5">
      <div className="flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full bg-${color}-500`} />
        <span className="text-sm text-white/80">{label}</span>
      </div>
      <span className="text-sm font-semibold text-white">{count}</span>
    </div>
  )
}

function InsightCard({ insight }: { insight: Insight }) {
  const icons: Record<string, any> = {
    TrendingUp, TrendingDown, AlertTriangle, AlertCircle, Lightbulb,
    Star, Target, DollarSign, MapPin, Flag, CheckCircle2, Shield
  }

  const IconComponent = icons[insight.icon] || AlertCircle

  const colors = {
    success: 'bg-green-500/10 border-green-500/30 text-green-400',
    warning: 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400',
    opportunity: 'bg-blue-500/10 border-blue-500/30 text-blue-400',
    info: 'bg-purple-500/10 border-purple-500/30 text-purple-400',
    alert: 'bg-red-500/10 border-red-500/30 text-red-400'
  }

  return (
    <div className={`p-4 rounded-lg border ${colors[insight.type]}`}>
      <div className="flex items-start gap-3">
        <IconComponent size={20} />
        <div className="flex-1">
          <div className="font-semibold">{insight.title}</div>
          <div className="text-white/80 text-sm mt-1">{insight.message}</div>
          {insight.action && (
            <div className="text-white/60 text-xs mt-2">💡 {insight.action}</div>
          )}
        </div>
      </div>
    </div>
  )
}

function LoadingState() {
  return (
    <div className="flex items-center justify-center h-[400px]">
      <div className="text-white/60">Chargement des analytics...</div>
    </div>
  )
}

function ErrorState() {
  return (
    <div className="flex items-center justify-center h-[400px]">
      <div className="text-red-400">Erreur de chargement des données</div>
    </div>
  )
}

function formatNumber(num: number): string {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
  return num.toString()
}
