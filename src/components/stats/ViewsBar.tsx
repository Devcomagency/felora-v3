"use client"
import React from 'react'

export default function ViewsBar({ series, loading }:{ series: Array<{t:number,v:number}>; loading?: boolean }){
  return (
    <div className="bg-gray-800/40 backdrop-blur border border-gray-700/50 rounded-2xl p-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-semibold">Évolution des vues de profil</h3>
        <div className="text-xs text-white/60">Derniers {series.length} points</div>
      </div>
      <div className="h-56 flex items-end gap-1">
        {series.map((p, i) => (
          <div key={i} className="flex-1 flex flex-col items-center">
            <div className="w-full bg-gradient-to-t from-purple-500 to-pink-500 rounded-t" style={{ height: `${Math.max(2, Math.min(100, p.v))}%` }} />
            <div className="text-[10px] text-white/50 mt-1">{i+1}</div>
          </div>
        ))}
        {loading && <div className="w-full h-40 bg-white/5 rounded-xl animate-pulse"/>}
      </div>
    </div>
  )
}

