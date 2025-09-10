"use client"

import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Eye, Heart, Users, MessageCircle, TrendingUp, Calendar, Clock, Download, BarChart3, PieChart, Wallet, ArrowRight } from 'lucide-react'
import { useNotification } from '@/components/providers/NotificationProvider'

type PeriodKey = 'week' | 'month' | 'year' | 'custom'
type ScopeKey = 'all' | 'public' | 'ondemand' | 'private'

function fmt(n: number) {
  return n.toLocaleString('fr-CH')
}
function fmtDiamond(n: number) {
  return `${fmt(n)} \u2666`
}

export default function StatistiquesPage() {
  const { error: notifyError, success: notifySuccess } = useNotification()

  // Global filters
  const [period, setPeriod] = useState<PeriodKey>('month')
  const [scope, setScope] = useState<ScopeKey>('all')
  const [customFrom, setCustomFrom] = useState<string>('')
  const [customTo, setCustomTo] = useState<string>('')
  const [intervalAuto, setIntervalAuto] = useState<'day'|'week'|'month'>('day')

  // derive interval for chart when auto
  const interval = useMemo(() => {
    if (period !== 'custom') {
      return period === 'week' ? 'day' : period === 'month' ? 'day' : 'month'
    }
    // crude heuristic for custom range
    try {
      const f = customFrom ? new Date(customFrom) : null
      const t = customTo ? new Date(customTo) : null
      if (f && t) {
        const days = Math.max(1, Math.round((+t - +f) / 86400000))
        if (days <= 31) return 'day'
        if (days <= 180) return 'week'
        return 'month'
      }
    } catch (e) {}
    return intervalAuto
  }, [period, customFrom, customTo, intervalAuto])

  const queryParams = useMemo(() => {
    const p = new URLSearchParams()
    if (period === 'custom') {
      if (customFrom) p.set('from', customFrom)
      if (customTo) p.set('to', customTo)
    } else {
      p.set('period', period)
    }
    p.set('scope', scope)
    return p.toString()
  }, [period, customFrom, customTo, scope])

  // Queries
  const overviewQ = useQuery({
    queryKey: ['stats.overview', queryParams],
    queryFn: async () => {
      const r = await fetch(`/api/stats/overview?${queryParams}`, { cache: 'no-store' })
      if (!r.ok) throw new Error('overview_failed')
      return r.json() as Promise<{ vuesProfil:number, reactions:number, fans:number, messages:number, revenus:number, reservations:number, delta: Record<string, number> }>
    },
  })

  const topMediaQ = useQuery({
    queryKey: ['stats.topMedia', queryParams],
    queryFn: async () => {
      const r = await fetch(`/api/stats/top-media?limit=5&${queryParams}`, { cache: 'no-store' })
      if (!r.ok) throw new Error('top_media_failed')
      return r.json() as Promise<Array<{ id:string, rank:number, type:string, title:string, publishedAgo:string, likes:number, views:number, score:number, thumb:string }>>
    },
  })

  const activityQ = useQuery({
    queryKey: ['activity', queryParams],
    queryFn: async () => {
      const r = await fetch(`/api/activity?${queryParams}`, { cache: 'no-store' })
      if (!r.ok) throw new Error('activity_failed')
      return r.json() as Promise<{ items: Array<{ type:string, text:string, at:number }>, page:number, hasMore:boolean }>
    }
  })

  const viewsQ = useQuery({
    queryKey: ['stats.profileViews', queryParams, interval],
    queryFn: async () => {
      const r = await fetch(`/api/stats/profile-views?interval=${interval}&${queryParams}`, { cache: 'no-store' })
      if (!r.ok) throw new Error('views_failed')
      return r.json() as Promise<{ series: Array<{ t:number, v:number }>, interval:string }>
    },
  })

  const revenueBreakdownQ = useQuery({
    queryKey: ['stats.revenueBreakdown', queryParams],
    queryFn: async () => {
      const r = await fetch(`/api/stats/revenue-breakdown?${queryParams}`, { cache: 'no-store' })
      if (!r.ok) throw new Error('rb_failed')
      return r.json() as Promise<{ orders:{amount:number,pct:number}, paywalls:{amount:number,pct:number}, gifts:{amount:number,pct:number}, total:number }>
    }
  })

  const walletSummaryQ = useQuery({
    queryKey: ['wallet.summary'],
    queryFn: async () => {
      const r = await fetch('/api/wallet/summary', { cache: 'no-store' })
      if (!r.ok) throw new Error('wallet_summary_failed')
      return r.json() as Promise<{ balance:number, balanceDeltaPct:number, totalEarnedThisMonth:number, totalWithdrawn:number, pendingWithdrawal?:{amount:number,status:string} }>
    }
  })

  const walletTxQ = useQuery({
    queryKey: ['wallet.transactions', 1],
    queryFn: async () => {
      const r = await fetch('/api/wallet/transactions?page=1', { cache: 'no-store' })
      if (!r.ok) throw new Error('wallet_tx_failed')
      return r.json() as Promise<{ items:Array<{id:string,date:number,type:string,amount:number,currency:string,status:string,ref:string}>, page:number, hasMore:boolean }>
    }
  })

  const isLoading = [overviewQ, topMediaQ, activityQ, viewsQ, revenueBreakdownQ, walletSummaryQ, walletTxQ].some(q => q.isLoading)

  // Revenue monthly via API
  const revMonthlyQ = useQuery({
    queryKey: ['stats.revenueMonthly'],
    queryFn: async () => {
      const r = await fetch('/api/stats/revenue-monthly', { cache: 'no-store' })
      if (!r.ok) throw new Error('rev_month_failed')
      return r.json() as Promise<{ months: Array<{ label: string, amount: number }> }>
    }
  })
  const months = (revMonthlyQ.data?.months || []).map((x) => ({ m: x.label, v: x.amount }))
  const bestMonth = months.length ? months.reduce((a, b) => (b.v > a.v ? b : a)) : { m: '-', v: 0 }

  // CSV exports
  const exportCSV = (rows: Array<Record<string, any>>, filename: string) => {
    if (!rows?.length) return notifyError('Export', 'Aucune donnée à exporter')
    const headers = Object.keys(rows[0])
    const csv = [headers.join(','), ...rows.map(r => headers.map(h => JSON.stringify(r[h] ?? '')).join(','))].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
    notifySuccess('Export', `${filename} téléchargé`)
  }

  const kpis = overviewQ.data

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Statistiques</h1>
          <p className="text-sm text-white/70">Analysez vos performances et votre audience</p>
        </div>

        {/* Filters header */}
        <div className="sticky top-[118px] z-20 bg-black/70 backdrop-blur rounded-xl border border-white/10 p-3">
          <div className="flex flex-col md:flex-row items-center gap-3">
            {/* Période */}
            <div className="flex items-center gap-1 bg-gray-800/40 border border-gray-700/50 rounded-xl p-1">
              {([
                { key:'week', label:'Cette semaine' },
                { key:'month', label:'Ce mois' },
                { key:'year', label:'Cette année' },
                { key:'custom', label:'Personnalisée' },
              ] as Array<{key:PeriodKey,label:string}>).map(p => (
                <button key={p.key} onClick={() => setPeriod(p.key)} className={`px-3 py-1.5 text-xs rounded-lg ${period===p.key?'bg-white/10 text-white':'text-white/70 hover:bg-white/5'}`}>{p.label}</button>
              ))}
            </div>
            {/* Custom dates */}
            {period==='custom' && (
              <div className="flex items-center gap-2 text-xs">
                <input type="date" value={customFrom} onChange={e=>setCustomFrom(e.target.value)} className="bg-black border border-white/10 rounded-lg px-2 py-1"/>
                <span className="text-white/60">→</span>
                <input type="date" value={customTo} onChange={e=>setCustomTo(e.target.value)} className="bg-black border border-white/10 rounded-lg px-2 py-1"/>
              </div>
            )}
            <div className="flex-1"/>
            {/* Scope */}
            <div className="flex items-center gap-1 bg-gray-800/40 border border-gray-700/50 rounded-xl p-1">
              {([
                { key:'all', label:'Tous les médias' },
                { key:'public', label:'Publics' },
                { key:'ondemand', label:'À la demande' },
                { key:'private', label:'Privés' },
              ] as Array<{key:ScopeKey,label:string}>).map(s => (
                <button key={s.key} onClick={() => setScope(s.key)} className={`px-3 py-1.5 text-xs rounded-lg ${scope===s.key?'bg-white/10 text-white':'text-white/70 hover:bg-white/5'}`}>{s.label}</button>
              ))}
            </div>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <KpiCard icon={<Eye className="text-blue-400" size={22}/>} label="Vues profil" value={kpis?.vuesProfil} delta={kpis?.delta?.vuesProfil} loading={overviewQ.isLoading}/>
          <KpiCard icon={<Heart className="text-pink-400" size={22}/>} label="Réactions" value={kpis?.reactions} delta={kpis?.delta?.reactions} loading={overviewQ.isLoading}/>
          <KpiCard icon={<Users className="text-purple-400" size={22}/>} label="Nouveaux fans" value={kpis?.fans} delta={kpis?.delta?.fans} loading={overviewQ.isLoading}/>
          <KpiCard icon={<MessageCircle className="text-green-400" size={22}/>} label="Messages" value={kpis?.messages} delta={kpis?.delta?.messages} loading={overviewQ.isLoading}/>
          <KpiCard icon={<Wallet className="text-yellow-300" size={22}/>} label="Revenus" value={kpis?.revenus} delta={kpis?.delta?.revenus} suffix=" ♦" loading={overviewQ.isLoading}/>
          <KpiCard icon={<TrendingUp className="text-emerald-400" size={22}/>} label="Réservations" value={kpis?.reservations} delta={kpis?.delta?.reservations} loading={overviewQ.isLoading}/>
        </div>

        {/* Top Médias + Activité */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-gray-800/40 backdrop-blur border border-gray-700/50 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Médias les plus populaires</h3>
              <button onClick={()=>exportCSV((topMediaQ.data||[]).map(i=>({rank:i.rank,type:i.type,title:i.title,likes:i.likes,views:i.views,score:i.score})), 'top-medias.csv')} className="text-xs text-white/70 hover:text-white flex items-center gap-1"><Download size={14}/> Export CSV</button>
            </div>
            <div className="space-y-2">
              {(topMediaQ.data||[]).map(m => (
                <div key={m.id} className="flex items-center gap-3 p-3 rounded-xl border border-white/10 hover:bg-white/5">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm font-bold">{m.rank}</div>
                  <div className="w-12 h-12 rounded-lg overflow-hidden bg-white/10"><img src={m.thumb} alt={m.title} className="w-full h-full object-cover"/></div>
                  <div className="flex-1">
                    <div className="text-white text-sm font-medium">{m.type==='video'?'📹':'📸'} {m.title}</div>
                    <div className="text-xs text-white/60">{m.publishedAgo}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-pink-300 text-sm font-semibold">❤️ {m.likes}</div>
                    <div className="text-white/70 text-xs">Score {m.score}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <a href="#" className="px-2 py-1 text-xs rounded-lg border border-white/10 hover:bg-white/10">Voir</a>
                    <button onClick={()=>notifySuccess('Mise en avant', 'Boost appliqué (mock)')} className="px-2 py-1 text-xs rounded-lg bg-pink-600/80 hover:bg-pink-600 text-white">Boost</button>
                  </div>
                </div>
              ))}
              {topMediaQ.isLoading && <div className="h-24 bg-white/5 rounded-xl animate-pulse"/>}
            </div>
          </div>

          <div className="bg-gray-800/40 backdrop-blur border border-gray-700/50 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Activité récente</h3>
              <a href="/dashboard-escort/activite" className="text-xs text-white/70 hover:text-white">Voir toute l'activité</a>
            </div>
            <div className="space-y-3">
              {(activityQ.data?.items||[]).map((a, i) => (
                <div key={i} className="flex items-start gap-3 p-2 rounded-xl hover:bg-white/5">
                  <div className="mt-0.5">
                    {a.type==='view' && <Eye size={16} className="text-blue-400"/>}
                    {a.type==='like' && <Heart size={16} className="text-pink-400"/>}
                    {a.type==='message' && <MessageCircle size={16} className="text-green-400"/>}
                    {a.type==='reservation' && <Calendar size={16} className="text-purple-400"/>}
                    {a.type==='reaction' && <span className="text-red-400">❤️</span>}
                  </div>
                  <div className="flex-1 text-sm">{a.text}
                    <div className="text-xs text-white/60">{timeAgo(a.at)}</div>
                  </div>
                </div>
              ))}
              {activityQ.isLoading && <div className="h-24 bg-white/5 rounded-xl animate-pulse"/>}
            </div>
          </div>
        </div>

        {/* Views line (bar) + Revenue donut */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-gray-800/40 backdrop-blur border border-gray-700/50 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold">Évolution des vues de profil</h3>
              <div className="text-xs text-white/60">Derniers 14 jours</div>
            </div>
            <div className="h-56 flex items-end gap-1">
              {(viewsQ.data?.series||[]).map((p, i) => {
                const maxValue = Math.max(...(viewsQ.data?.series||[]).map(s => s.v))
                const normalizedHeight = maxValue > 0 ? (p.v / maxValue) * 100 : 0
                return (
                  <div key={i} className="flex-1 flex flex-col items-center">
                    <div className="w-full bg-gradient-to-t from-purple-500 to-pink-500 rounded-t" style={{ height: `${Math.min(normalizedHeight, 100)}%` }} />
                    <div className="text-[10px] text-white/50 mt-1">{i+1}</div>
                  </div>
                )
              })}
              {viewsQ.isLoading && <div className="w-full h-40 bg-white/5 rounded-xl animate-pulse"/>}
            </div>
          </div>

          <div className="bg-gray-800/40 backdrop-blur border border-gray-700/50 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Sources de revenus</h3>
            </div>
            {revenueBreakdownQ.data ? (
              <div className="grid grid-cols-2 gap-4 items-center">
                {/* Donut via conic-gradient */}
                <div className="flex items-center justify-center">
                  <div className="relative w-40 h-40">
                    {(() => {
                      const d = revenueBreakdownQ.data!
                      const a = d.orders.pct
                      const b = a + d.paywalls.pct
                      const c = 100
                      const bg = `conic-gradient(#a855f7 0% ${a}%, #06b6d4 ${a}% ${b}%, #10b981 ${b}% ${c}%)`
                      return (
                        <div className="w-40 h-40 rounded-full" style={{ background: bg }}>
                          <div className="absolute inset-4 bg-gray-900 rounded-full border border-white/10 flex items-center justify-center">
                            <div className="text-center">
                              <div className="text-xs text-white/60">Total</div>
                              <div className="text-sm font-semibold">{fmtDiamond(d.total)}</div>
                            </div>
                          </div>
                        </div>
                      )
                    })()}
                  </div>
                </div>
                {/* Legend */}
                <div className="space-y-3">
                  <LegendRow color="from-purple-500 to-pink-500" label="Commandes privées" value={revenueBreakdownQ.data.orders.amount} pct={revenueBreakdownQ.data.orders.pct} onClick={()=>setScope('ondemand')} />
                  <LegendRow color="from-blue-500 to-cyan-500" label="Médias payants" value={revenueBreakdownQ.data.paywalls.amount} pct={revenueBreakdownQ.data.paywalls.pct} onClick={()=>setScope('public')} />
                  <LegendRow color="from-green-500 to-emerald-500" label="Cadeaux reçus" value={revenueBreakdownQ.data.gifts.amount} pct={revenueBreakdownQ.data.gifts.pct} onClick={()=>setScope('private')} />
                </div>
              </div>
            ) : (
              <div className="h-40 bg-white/5 rounded-xl animate-pulse"/>
            )}
          </div>
        </div>

        {/* Wallet block */}
        <WalletBlock summaryQ={walletSummaryQ.data} txQ={walletTxQ.data} onExport={() => exportCSV((walletTxQ.data?.items||[]), 'transactions.csv')} />

        {/* Monthly Revenue bars */}
        <div className="bg-gray-800/40 backdrop-blur border border-gray-700/50 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold">Revenus — évolution mensuelle</h3>
            <div className="text-xs text-white/60">Meilleur mois: <span className="text-white font-medium">{bestMonth.m}</span></div>
          </div>
          <div className="h-56 flex items-end gap-2">
            {(months.length ? months : Array.from({length:12}, (_,i)=>({m:['Jan','Fév','Mar','Avr','Mai','Jun','Jul','Aoû','Sep','Oct','Nov','Déc'][i], v:0}))).map((m,i) => (
              <div key={i} className="flex-1 flex flex-col items-center">
                <div className="w-full bg-gradient-to-t from-yellow-500 to-amber-300 rounded-t" style={{ height: `${Math.max(4, Math.min(100, Math.round((m.v/Math.max(1, Math.max(...months.map(mm=>mm.v), 100)))*100)))}%` }} />
                <div className="text-[10px] text-white/60 mt-1">{m.m}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Sources detail cards */}
        {revenueBreakdownQ.data && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <SourceCard emoji="📸" title="Commandes privées" pct={revenueBreakdownQ.data.orders.pct} amount={revenueBreakdownQ.data.orders.amount} delta={15} onClick={()=>setScope('ondemand')} />
            <SourceCard emoji="💎" title="Médias payants" pct={revenueBreakdownQ.data.paywalls.pct} amount={revenueBreakdownQ.data.paywalls.amount} delta={8} onClick={()=>setScope('public')} />
            <SourceCard emoji="🎁" title="Cadeaux" pct={revenueBreakdownQ.data.gifts.pct} amount={revenueBreakdownQ.data.gifts.amount} delta={22} onClick={()=>setScope('private')} />
          </div>
        )}
      </div>
    </div>
  )
}

function KpiCard({ icon, label, value, delta, suffix = '', loading }: { icon: React.ReactNode, label: string, value?: number, delta?: number, suffix?: string, loading?: boolean }) {
  return (
    <div className="p-4 bg-gray-800/40 backdrop-blur border border-gray-700/50 rounded-xl">
      <div className="flex items-center justify-between mb-2">
        <div className="text-white/90">{icon}</div>
        <TrendingUp size={14} className={` ${typeof delta==='number' && delta>=0 ? 'text-emerald-400' : 'text-red-400'}`} />
      </div>
      <div className="text-2xl font-bold text-white min-h-[32px]">
        {loading ? <span className="inline-block w-24 h-6 bg-white/10 rounded animate-pulse"/> : (typeof value==='number' ? `${fmt(value)}${suffix}` : '—')}
      </div>
      <div className="text-xs text-white/70 flex items-center gap-1">
        <span>{label}</span>
        {typeof delta==='number' && (
          <span className={`ml-auto px-1.5 py-0.5 rounded bg-white/10 ${delta>=0?'text-emerald-300':'text-red-300'}`}>{delta>=0?'+':''}{delta}%</span>
        )}
      </div>
    </div>
  )
}

function LegendRow({ color, label, value, pct, onClick }: { color: string, label: string, value: number, pct: number, onClick?: () => void }) {
  return (
    <button onClick={onClick} className="w-full text-left">
      <div className="flex items-center justify-between p-2 rounded-lg hover:bg-white/5">
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded bg-gradient-to-r ${color}`}></div>
          <div className="text-sm text-white">{label}</div>
        </div>
        <div className="text-right">
          <div className="text-sm text-white font-semibold">{fmtDiamond(value)}</div>
          <div className="text-xs text-white/60">{pct}%</div>
        </div>
      </div>
    </button>
  )
}

function WalletBlock({ summaryQ, txQ, onExport }: { summaryQ?: { balance:number, balanceDeltaPct:number, totalEarnedThisMonth:number, totalWithdrawn:number, pendingWithdrawal?:{amount:number,status:string} }, txQ?: { items: Array<{id:string,date:number,type:string,amount:number,currency:string,status:string,ref:string}> }, onExport: () => void }) {
  const [tab, setTab] = useState<'overview'|'tx'|'withdraw'>('overview')
  const { error: notifyError, success: notifySuccess } = useNotification()
  const [amount, setAmount] = useState<number>(100)

  const submitWithdraw = async () => {
    try {
      const r = await fetch('/api/wallet/withdraw', { method: 'POST', headers: { 'Content-Type':'application/json' }, body: JSON.stringify({ amount }) })
      const d = await r.json()
      if (!d?.ok) throw new Error(d?.error || 'withdraw_failed')
      notifySuccess('Retrait demandé', `Frais: ${d.fee} ♦ · ETA: ${d.etaDays} j`)
    } catch (e: any) {
      notifyError('Retrait impossible', e?.message || 'Erreur inconnue')
    }
  }

  return (
    <div className="bg-gray-800/40 backdrop-blur border border-gray-700/50 rounded-2xl p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Portefeuille</h3>
        <div className="flex items-center gap-1 bg-gray-800/40 border border-gray-700/50 rounded-xl p-1">
          <button onClick={()=>setTab('overview')} className={`px-3 py-1.5 text-xs rounded-lg ${tab==='overview'?'bg-white/10 text-white':'text-white/70 hover:bg-white/5'}`}>💰 Vue d'ensemble</button>
          <button onClick={()=>setTab('tx')} className={`px-3 py-1.5 text-xs rounded-lg ${tab==='tx'?'bg-white/10 text-white':'text-white/70 hover:bg-white/5'}`}>📊 Transactions</button>
          <button onClick={()=>setTab('withdraw')} className={`px-3 py-1.5 text-xs rounded-lg ${tab==='withdraw'?'bg-white/10 text-white':'text-white/70 hover:bg-white/5'}`}>💳 Retirer</button>
        </div>
      </div>

      {tab==='overview' && summaryQ && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-xl">
            <div className="text-xs text-white/70">Solde disponible</div>
            <div className="text-2xl font-bold text-green-300">{fmtDiamond(summaryQ.balance)} <span className="text-xs ml-2 text-emerald-300">(+{summaryQ.balanceDeltaPct}%)</span></div>
          </div>
          <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl">
            <div className="text-xs text-white/70">Total gagné (ce mois)</div>
            <div className="text-xl font-semibold text-yellow-300">{fmtDiamond(summaryQ.totalEarnedThisMonth)}</div>
          </div>
          <div className="p-4 bg-purple-500/10 border border-purple-500/30 rounded-xl">
            <div className="text-xs text-white/70">Total retiré</div>
            <div className="text-xl font-semibold text-purple-300">{fmtDiamond(summaryQ.totalWithdrawn)}</div>
          </div>
          <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
            <div className="text-xs text-white/70">Retrait en cours</div>
            <div className="text-xl font-semibold text-blue-300">{fmtDiamond(summaryQ.pendingWithdrawal?.amount || 0)} <span className="text-xs text-white/60">({summaryQ.pendingWithdrawal?.status || '—'})</span></div>
          </div>
        </div>
      )}

      {tab==='tx' && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-white/80">Historique</div>
            <button onClick={onExport} className="text-xs text-white/70 hover:text-white flex items-center gap-1"><Download size={14}/> Export CSV</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-white/60">
                <tr>
                  <th className="text-left py-2">Date</th>
                  <th className="text-left py-2">Type</th>
                  <th className="text-left py-2">Montant</th>
                  <th className="text-left py-2">Statut</th>
                  <th className="text-left py-2">Réf</th>
                </tr>
              </thead>
              <tbody>
                {(txQ?.items||[]).map(tx => (
                  <tr key={tx.id} className="border-t border-white/5">
                    <td className="py-2">{new Date(tx.date).toLocaleString('fr-CH')}</td>
                    <td className="py-2">{tx.type}</td>
                    <td className="py-2">{fmtDiamond(tx.amount)}</td>
                    <td className="py-2">{tx.status}</td>
                    <td className="py-2">{tx.ref}</td>
                  </tr>
                ))}
                {!txQ?.items?.length && (
                  <tr><td colSpan={5} className="py-6 text-center text-white/60">Aucune transaction</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab==='withdraw' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 p-4 rounded-xl border border-white/10 bg-white/5">
            <div className="text-sm text-white/80 mb-2">Demander un retrait</div>
            <div className="flex items-center gap-2">
              <input type="number" min={50} step={10} value={amount} onChange={(e)=>setAmount(Number(e.target.value||0))} className="bg-black border border-white/10 rounded-lg px-3 py-2 text-sm w-40" />
              <button onClick={submitWithdraw} className="px-3 py-2 rounded-lg bg-pink-600 hover:bg-pink-700 text-white text-sm">Valider</button>
            </div>
            <div className="text-xs text-white/60 mt-2">Seuil min: 50 ♦ — Des frais s'appliquent — Délai estimé: 2–4 jours</div>
          </div>
          <div className="p-4 rounded-xl border border-white/10 bg-white/5">
            <div className="text-sm text-white/80">Méthode</div>
            <div className="text-xs text-white/60">RIB/Wallet configurable (mock)</div>
          </div>
        </div>
      )}
    </div>
  )
}

function SourceCard({ emoji, title, pct, amount, delta, onClick }: { emoji: string, title: string, pct: number, amount: number, delta: number, onClick?: () => void }) {
  return (
    <div className="p-4 rounded-xl border border-white/10 bg-white/5">
      <div className="text-2xl">{emoji}</div>
      <div className="text-sm text-white/70">{pct}% du total</div>
      <div className="text-xl font-semibold">{fmtDiamond(amount)}</div>
      <div className={`text-xs ${delta>=0?'text-emerald-300':'text-red-300'}`}>{delta>=0?'+':''}{delta}%</div>
      <button onClick={onClick} className="mt-2 text-xs text-white/80 inline-flex items-center gap-1 hover:underline">Voir détails <ArrowRight size={14}/></button>
    </div>
  )
}

function timeAgo(ts: number) {
  const s = Math.max(1, Math.round((Date.now() - ts)/1000))
  if (s < 60) return `il y a ${s}s`
  const m = Math.round(s/60)
  if (m < 60) return `il y a ${m} min`
  const h = Math.round(m/60)
  if (h < 24) return `il y a ${h} h`
  const d = Math.round(h/24)
  return `il y a ${d} j`
}