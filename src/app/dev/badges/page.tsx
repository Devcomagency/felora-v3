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

        {/* Propositions Felora – 3 styles */}
        <div className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-4">
          <div className="space-y-1">
            <div className="text-sm text-white/80">Propositions Felora (3 variantes)</div>
            <div className="text-xs text-white/50">Palette Felora: rose (#FF6B9D), violet (#A78BFA), cyan/teal (#4FD1C7).</div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Variante A — Gradient ring + glow */}
            <div className="rounded-lg border border-white/10 bg-black/30 p-4">
              <div className="text-xs text-white/60 mb-3">Variante A — Anneau dégradé</div>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#FF6B9D] via-[#A78BFA] to-[#4FD1C7] blur-[6px] opacity-60" />
                  <div className="relative inline-flex items-center justify-center h-10 w-10 rounded-full bg-black/80 border border-white/10">
                    <Crown className="w-5 h-5 text-[#FF6B9D]" />
                  </div>
                </div>
                <div className="flex flex-col">
                  <div className="text-white font-medium">Felora Premium</div>
                  <div className="text-xs text-white/60">Dégradé signature + glow doux</div>
                </div>
              </div>
            </div>

            {/* Variante B — Pill avec ruban */}
            <div className="rounded-lg border border-white/10 bg-black/30 p-4">
              <div className="text-xs text-white/60 mb-3">Variante B — Ruban latéral</div>
              <div className="flex items-center gap-3">
                <span className="relative inline-flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full bg-white/5 border border-white/10">
                  <span className="absolute left-0 top-0 bottom-0 w-1 rounded-l-full bg-gradient-to-b from-[#FF6B9D] to-[#4FD1C7]" />
                  <Diamond className="w-4 h-4 text-[#4FD1C7]" />
                  <span className="text-xs text-white/90">Felora VIP</span>
                </span>
              </div>
              <div className="text-[11px] text-white/50 mt-2">Pill clair, ruban dégradé vertical</div>
            </div>

            {/* Variante C — Chip néomorphique */}
            <div className="rounded-lg border border-white/10 bg-black/30 p-4">
              <div className="text-xs text-white/60 mb-3">Variante C — Chip néomorphique</div>
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#0B0B0B] text-white border border-white/5 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
                  <BadgeCheck className="w-4 h-4 text-[#A78BFA]" />
                  <span className="text-xs">Compte vérifié</span>
                </span>
              </div>
              <div className="text-[11px] text-white/50 mt-2">Relief discret, lisible sur fond sombre</div>
            </div>
          </div>

          {/* 3 variantes supplémentaires */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Variante D — Outline minimal + texte dégradé */}
            <div className="rounded-lg border border-white/10 bg-black/30 p-4">
              <div className="text-xs text-white/60 mb-3">Variante D — Outline minimal</div>
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/15 bg-black/40">
                  <ShieldCheck className="w-4 h-4 text-white/90" />
                  <span className="text-xs bg-clip-text text-transparent bg-gradient-to-r from-[#FF6B9D] via-[#A78BFA] to-[#4FD1C7]">
                    Felora Secure
                  </span>
                </span>
              </div>
              <div className="text-[11px] text-white/50 mt-2">Minimal, élégant, focus sur la typographie</div>
            </div>

            {/* Variante E — Glassmorphism + inner border */}
            <div className="rounded-lg border border-white/10 bg-black/30 p-4">
              <div className="text-xs text-white/60 mb-3">Variante E — Glassmorphism</div>
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06)]">
                  <Diamond className="w-4 h-4 text-[#4FD1C7]" />
                  <span className="text-xs text-white/90">Felora Elite</span>
                </span>
              </div>
              <div className="text-[11px] text-white/50 mt-2">Effet verre, très lisible sur fond sombre</div>
            </div>

            {/* Variante F — Ticket / Tag avec notch */}
            <div className="rounded-lg border border-white/10 bg-black/30 p-4">
              <div className="text-xs text-white/60 mb-3">Variante F — Ticket / Tag</div>
              <div className="flex items-center gap-3">
                <span className="relative inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#0B0B0B] border border-white/10">
                  <span className="absolute -left-1.5 top-1/2 -translate-y-1/2 h-3 w-3 rounded-full bg-gradient-to-tr from-[#FF6B9D] to-[#4FD1C7] shadow-[0_0_0_2px_rgba(0,0,0,0.6)]" />
                  <BadgeCheck className="w-4 h-4 text-[#A78BFA]" />
                  <span className="text-xs text-white/90">Vérifié Felora</span>
                </span>
              </div>
              <div className="text-[11px] text-white/50 mt-2">Forme “étiquette” avec notch coloré</div>
            </div>
          </div>
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


