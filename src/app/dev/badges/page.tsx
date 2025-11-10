"use client"

import React from 'react'
import { BadgeCheck, Crown, Diamond, ShieldCheck, Bell } from 'lucide-react'

function BadgePreview({
  label,
  description,
  children
}: {
  label: string
  description?: string
  children: React.ReactNode
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4 flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        {children}
        <div className="flex flex-col">
          <div className="text-white font-medium">{label}</div>
          {description ? (
            <div className="text-xs text-white/60">{description}</div>
          ) : null}
        </div>
      </div>
    </div>
  )
}

export default function BadgesShowcasePage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-3xl px-6 py-10 space-y-8">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">Badges — Galerie de design</h1>
          <p className="text-white/60 text-sm">
            Aperçu visuel des badges utilisés dans l&apos;application (états, couleurs, tailles).
          </p>
        </div>

        {/* Vérifié */}
        <BadgePreview
          label="Badge vérifié"
          description="Utilisé sur le feed et les profils pour les comptes vérifiés."
        >
          <span className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/20">
            <BadgeCheck className="w-4 h-4" />
            <span className="text-xs">Vérifié</span>
          </span>
        </BadgePreview>

        {/* Premium */}
        <BadgePreview
          label="Badge Premium"
          description="Signale un contenu Premium (visibilité PREMIUM)."
        >
          <span className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-pink-500/15 text-pink-300 border border-pink-500/20">
            <Crown className="w-4 h-4" />
            <span className="text-xs">Premium</span>
          </span>
        </BadgePreview>

        {/* VIP (disponible côté data) */}
        <BadgePreview
          label="Badge VIP"
          description="Statut VIP (présent dans le modèle de données, affichage optionnel)."
        >
          <span className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-violet-500/15 text-violet-300 border border-violet-500/20">
            <Diamond className="w-4 h-4" />
            <span className="text-xs">VIP</span>
          </span>
        </BadgePreview>

        {/* Âge vérifié */}
        <BadgePreview
          label="Âge vérifié"
          description="Indique qu’un contrôle d’âge a été validé (si activé)."
        >
          <span className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/20">
            <ShieldCheck className="w-4 h-4" />
            <span className="text-xs">Âge vérifié</span>
          </span>
        </BadgePreview>

        {/* Notification (non lus) */}
        <BadgePreview
          label="Badge de notification"
          description="Point indicateur pour messages/notifications non lus."
        >
          <div className="relative inline-flex items-center">
            <span className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-white/10 text-white/90 border border-white/10">
              <Bell className="w-4 h-4" />
              <span className="text-xs">Notifications</span>
            </span>
            <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-red-500 ring-2 ring-black" />
          </div>
        </BadgePreview>

        {/* Variantes de tailles (aperçu rapide) */}
        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
          <div className="text-sm text-white/80 mb-3">Variantes de tailles (icônes)</div>
          <div className="flex items-center gap-4 flex-wrap">
            <span className="inline-flex items-center gap-2 px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/20">
              <BadgeCheck className="w-3 h-3" />
              <span className="text-[10px]">XS</span>
            </span>
            <span className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/20">
              <BadgeCheck className="w-4 h-4" />
              <span className="text-xs">SM</span>
            </span>
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/20">
              <BadgeCheck className="w-5 h-5" />
              <span className="text-sm">MD</span>
            </span>
            <span className="inline-flex items-center gap-2 px-3.5 py-2 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/20">
              <BadgeCheck className="w-6 h-6" />
              <span className="text-base">LG</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}


