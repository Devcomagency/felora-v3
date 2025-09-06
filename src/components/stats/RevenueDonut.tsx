"use client"
import React from 'react'

export default function RevenueDonut({ orders, paywalls, gifts, total }:{ orders:{amount:number,pct:number}; paywalls:{amount:number,pct:number}; gifts:{amount:number,pct:number}; total:number }){
  const a = orders.pct
  const b = a + paywalls.pct
  const c = 100
  const bg = `conic-gradient(#a855f7 0% ${a}%, #06b6d4 ${a}% ${b}%, #10b981 ${b}% ${c}%)`
  const fmt = (n:number)=> n.toLocaleString('fr-CH') + ' ♦'
  return (
    <div className="grid grid-cols-2 gap-4 items-center">
      <div className="flex items-center justify-center">
        <div className="relative w-40 h-40">
          <div className="w-40 h-40 rounded-full" style={{ background: bg }}>
            <div className="absolute inset-4 bg-gray-900 rounded-full border border-white/10 flex items-center justify-center">
              <div className="text-center">
                <div className="text-xs text-white/60">Total</div>
                <div className="text-sm font-semibold">{fmt(total)}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="space-y-3">
        <Legend colorClass="from-purple-500 to-pink-500" label="Commandes privées" value={orders.amount} pct={orders.pct} />
        <Legend colorClass="from-blue-500 to-cyan-500" label="Médias payants" value={paywalls.amount} pct={paywalls.pct} />
        <Legend colorClass="from-green-500 to-emerald-500" label="Cadeaux reçus" value={gifts.amount} pct={gifts.pct} />
      </div>
    </div>
  )
}

function Legend({ colorClass, label, value, pct }:{ colorClass:string; label:string; value:number; pct:number }){
  const fmt = (n:number)=> n.toLocaleString('fr-CH') + ' ♦'
  return (
    <div className="flex items-center justify-between">
      <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${colorClass}`} />
      <div className="flex-1 ml-2 text-sm text-white/80">{label}</div>
      <div className="text-sm text-white/90">{fmt(value)}</div>
      <div className="text-xs text-white/60 ml-2">{pct}%</div>
    </div>
  )
}

