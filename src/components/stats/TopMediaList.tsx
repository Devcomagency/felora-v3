"use client"
import React from 'react'
import { Download } from 'lucide-react'
import Image from 'next/image'

type Item = { id:string, rank:number, type:string, title:string, publishedAgo:string, likes:number, views:number, score:number, thumb:string }

export default function TopMediaList({ items, loading, onExport, onBoost }:{ items: Item[]; loading?: boolean; onExport?: ()=>void; onBoost?: (id:string)=>void }){
  return (
    <div className="bg-gray-800/40 backdrop-blur border border-gray-700/50 rounded-2xl p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Médias les plus populaires</h3>
        <button onClick={onExport} className="text-xs text-white/70 hover:text-white flex items-center gap-1"><Download size={14}/> Export CSV</button>
      </div>
      <div className="space-y-2">
        {items.map(m => (
          <div key={m.id} className="flex items-center gap-3 p-3 rounded-xl border border-white/10 hover:bg-white/5">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm font-bold">{m.rank}</div>
            <div className="w-12 h-12 rounded-lg overflow-hidden bg-white/10 relative">
              <Image src={m.thumb} alt={m.title} fill sizes="48px" className="object-cover" loading="lazy" />
            </div>
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
              <button onClick={()=>onBoost?.(m.id)} className="px-2 py-1 text-xs rounded-lg bg-pink-600/80 hover:bg-pink-600 text-white">Boost</button>
            </div>
          </div>
        ))}
        {loading && <div className="h-24 bg-white/5 rounded-xl animate-pulse"/>}
      </div>
    </div>
  )
}
