"use client"

import React from 'react'
import { BadgeCheck, Bell, Crown, Diamond, ShieldCheck, Sparkles, Star } from 'lucide-react'

type BadgeCardProps = {
  title: string
  subtitle?: string
  description?: string
  badge: React.ReactNode
  className?: string
}

function BadgeCard({ title, subtitle, description, badge, className = '' }: BadgeCardProps) {
  return (
    <div
      className={`rounded-2xl border border-white/12 bg-black/35 backdrop-blur-sm p-5 shadow-[0_10px_35px_rgba(15,23,42,0.35)] space-y-3 transition-transform duration-200 hover:-translate-y-1 ${className}`}
    >
      <div className="flex items-center gap-3">
        {badge}
        <div className="space-y-1">
          <div className="text-white/90 font-semibold text-sm">{title}</div>
          {subtitle ? <div className="text-xs text-white/60">{subtitle}</div> : null}
        </div>
      </div>
      {description ? <p className="text-[11px] leading-relaxed text-white/45">{description}</p> : null}
    </div>
  )
}

function SectionBlock({
  title,
  subtitle,
  children
}: {
  title: string
  subtitle?: string
  children: React.ReactNode
}) {
  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-base font-semibold text-white/90">{title}</h2>
        {subtitle ? <p className="text-xs text-white/55 mt-1">{subtitle}</p> : null}
      </div>
      {children}
    </section>
  )
}

export default function BadgesShowcasePage() {
  return (
    <div className="min-h-screen bg-[#050608] text-white">
      <div className="mx-auto max-w-5xl px-6 py-12 space-y-12">
        <header className="space-y-3">
          <h1 className="text-3xl font-bold tracking-tight">Badges Felora</h1>
          <p className="text-sm text-white/60">
            Aperçu des badges existants et prototypes en respectant la palette Felora (rose #FF6B9D,
            violet #A78BFA, cyan #4FD1C7) sur fond sombre.
          </p>
        </header>

        <SectionBlock title="Badges actuels" subtitle="Déjà utilisés dans le feed, les profils ou les notifications.">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <BadgeCard
              title="Badge vérifié"
              subtitle="Profils & feed"
              description="Icône BadgeCheck, pastille verte Emerald."
              badge={
                <span className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/25">
                  <BadgeCheck className="w-4 h-4" />
                  <span className="text-xs">Vérifié</span>
                </span>
              }
            />
            <BadgeCard
              title="Badge Premium"
              subtitle="Médias PREMIUM"
              description="Visibilité Premium, couleur rose Felora."
              badge={
                <span className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-pink-500/15 text-pink-300 border border-pink-500/25">
                  <Crown className="w-4 h-4" />
                  <span className="text-xs">Premium</span>
                </span>
              }
            />
            <BadgeCard
              title="Badge VIP"
              subtitle="Statut utilisateur"
              description="Présent côté data, utilisable pour offres exclusives."
              badge={
                <span className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-violet-500/15 text-violet-300 border border-violet-500/25">
                  <Diamond className="w-4 h-4" />
                  <span className="text-xs">VIP</span>
                </span>
              }
            />
            <BadgeCard
              title="Âge vérifié"
              subtitle="KYC / conformité"
              description="Affiche qu’un contrôle d’âge a été validé."
              badge={
                <span className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/25">
                  <ShieldCheck className="w-4 h-4" />
                  <span className="text-xs">Âge vérifié</span>
                </span>
              }
            />
            <BadgeCard
              title="Notification"
              subtitle="Messages non lus"
              description="Indicateur pour les notifications / inbox."
              badge={
                <span className="relative inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-white/10 text-white/90 border border-white/12">
                  <Bell className="w-4 h-4" />
                  <span className="text-xs">Notifications</span>
                  <span className="absolute -top-1.5 -right-1.5 h-3 w-3 rounded-full bg-red-500 ring-2 ring-black" />
                </span>
              }
            />
          </div>
        </SectionBlock>

        <SectionBlock title="Variantes de tailles" subtitle="Echelle d’icônes pour conserver une cohérence visuelle.">
          <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-6">
            <span className="inline-flex items-center gap-2 px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/25">
              <BadgeCheck className="w-3 h-3" />
              <span className="text-[10px]">XS</span>
            </span>
            <span className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/25">
              <BadgeCheck className="w-4 h-4" />
              <span className="text-xs">SM</span>
            </span>
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/25">
              <BadgeCheck className="w-5 h-5" />
              <span className="text-sm">MD</span>
            </span>
            <span className="inline-flex items-center gap-2 px-3.5 py-2 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/25">
              <BadgeCheck className="w-6 h-6" />
              <span className="text-base">LG</span>
            </span>
          </div>
        </SectionBlock>

        <SectionBlock
          title="Prototypes Felora — Série 1"
          subtitle="6 propositions dans un style premium sobre."
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <BadgeCard
              title="Felora Premium"
              subtitle="Variante A — Anneau dégradé"
              description="Capsule circulaire avec glow signature."
              badge={
                <div className="relative inline-flex">
                  <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#FF6B9D] via-[#A78BFA] to-[#4FD1C7] blur-[6px] opacity-60" />
                  <div className="relative inline-flex h-10 w-10 items-center justify-center rounded-full bg-black/80 border border-white/12">
                    <Crown className="w-5 h-5 text-[#FF6B9D]" />
                  </div>
                </div>
              }
            />
            <BadgeCard
              title="Felora VIP"
              subtitle="Variante B — Ruban latéral"
              description="Pill claire, ruban dégradé vertical accentué."
              badge={
                <span className="relative inline-flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full bg-white/5 border border-white/12">
                  <span className="absolute left-0 top-0 bottom-0 w-1 rounded-l-full bg-gradient-to-b from-[#FF6B9D] to-[#4FD1C7]" />
                  <Diamond className="w-4 h-4 text-[#4FD1C7]" />
                  <span className="text-xs text-white/90">Felora VIP</span>
                </span>
              }
            />
            <BadgeCard
              title="Compte vérifié"
              subtitle="Variante C — Chip néomorphique"
              description="Effet relief discret, utilisable dans un carrousel."
              badge={
                <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#0B0B0B] text-white border border-white/6 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
                  <BadgeCheck className="w-4 h-4 text-[#A78BFA]" />
                  <span className="text-xs">Vérifié</span>
                </span>
              }
            />
            <BadgeCard
              title="Felora Secure"
              subtitle="Variante D — Outline minimal"
              description="Outline fin, texte dégradé, posture institutionnelle."
              badge={
                <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/15 bg-black/40">
                  <ShieldCheck className="w-4 h-4 text-white/85" />
                  <span className="text-xs bg-clip-text text-transparent bg-gradient-to-r from-[#FF6B9D] via-[#A78BFA] to-[#4FD1C7]">
                    Felora Secure
                  </span>
                </span>
              }
            />
            <BadgeCard
              title="Felora Elite"
              subtitle="Variante E — Glassmorphism"
              description="Effet verre, idéal pour surfaces lumineuses."
              badge={
                <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/12 backdrop-blur-md border border-white/25 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]">
                  <Diamond className="w-4 h-4 text-[#4FD1C7]" />
                  <span className="text-xs text-white/90">Felora Elite</span>
                </span>
              }
            />
            <BadgeCard
              title="Vérifié Felora"
              subtitle="Variante F — Ticket Tag"
              description="Badge type étiquette avec notch coloré."
              badge={
                <span className="relative inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#0B0B0B] border border-white/10">
                  <span className="absolute -left-1.5 top-1/2 -translate-y-1/2 h-3 w-3 rounded-full bg-gradient-to-tr from-[#FF6B9D] to-[#4FD1C7] shadow-[0_0_0_2px_rgba(0,0,0,0.55)]" />
                  <BadgeCheck className="w-4 h-4 text-[#A78BFA]" />
                  <span className="text-xs text-white/90">Vérifié Felora</span>
                </span>
              }
            />
          </div>
        </SectionBlock>

        <SectionBlock
          title="Prototypes Felora — Série 2"
          subtitle="6 styles plus expressifs (creator, top, club officiel, etc.)."
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <BadgeCard
              title="Creator"
              subtitle="Variante G — Capsule halo"
              description="Dégradé dynamique, halo doux autour du badge."
              badge={
                <div className="relative inline-flex">
                  <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-white/95 border border-white/10 bg-gradient-to-r from-[#FF6B9D] via-[#A78BFA] to-[#4FD1C7]">
                    <Sparkles className="w-4 h-4" />
                    <span className="text-xs font-medium">Creator</span>
                  </span>
                  <span className="pointer-events-none absolute -inset-1 rounded-full bg-gradient-to-r from-[#FF6B9D]/25 via-[#A78BFA]/25 to-[#4FD1C7]/25 blur-[10px] opacity-70" />
                </div>
              }
            />
            <BadgeCard
              title="Top 1%"
              subtitle="Variante H — Coin emboss"
              description="Effet pièce/emboss avec reflets internes."
              badge={
                <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#0B0B0B] text-white border border-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_6px_24px_rgba(167,139,250,0.1)]">
                  <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-gradient-to-br from-[#A78BFA]/20 to-[#4FD1C7]/20 border border-white/8 shadow-inner">
                    <Diamond className="w-3.5 h-3.5 text-[#A78BFA]" />
                  </span>
                  <span className="text-xs">Top 1%</span>
                </span>
              }
            />
            <BadgeCard
              title="Club Officiel"
              subtitle="Variante I — Ruban de coin"
              description="Badge carré avec ruban nouveauté."
              badge={
                <div className="relative inline-flex">
                  <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-white/6 border border-white/12">
                    <Crown className="w-4 h-4 text-[#FF6B9D]" />
                    <span className="text-xs text-white/90">Club Officiel</span>
                  </span>
                  <span className="absolute -top-2 -right-2 rotate-45 px-3 py-0.5 rounded bg-gradient-to-r from-[#FF6B9D] to-[#A78BFA] text-[10px] font-medium text-white/95 border border-white/10">
                    NEW
                  </span>
                </div>
              }
            />
            <BadgeCard
              title="Verified Pro"
              subtitle="Variante J — Accent souligné"
              description="Ligne lumineuse sous le badge pour hiérarchie pro."
              badge={
                <div className="space-y-3">
                  <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/45 border border-white/10">
                    <BadgeCheck className="w-4 h-4 text-[#4FD1C7]" />
                    <span className="text-xs text-white/90">Verified Pro</span>
                  </span>
                  <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                </div>
              }
            />
            <BadgeCard
              title="Holo Pass"
              subtitle="Variante K — Holo shimmer"
              description="Fond irisé en rotation lente (CSS conic gradient)."
              badge={
                <span className="relative inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/12 bg-[#0B0B0B] overflow-hidden">
                  <span className="absolute inset-0 opacity-35 bg-[conic-gradient(at_50%_50%,#FF6B9D_0deg,#A78BFA_120deg,#4FD1C7_240deg,#FF6B9D_360deg)] animate-[spin_6s_linear_infinite]" />
                  <Star className="w-4 h-4 text-[#FF6B9D]" />
                  <span className="text-xs text-white/92">Holo Pass</span>
                </span>
              }
            />
            <BadgeCard
              title="Felora Neon"
              subtitle="Variante L — Neon edge"
              description="Contour néon doux pour un look plus fun."
              badge={
                <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/60 text-white border border-white/12 shadow-[0_0_15px_rgba(255,107,157,0.3)]">
                  <Sparkles className="w-4 h-4 text-[#FF6B9D]" />
                  <span className="text-xs font-medium">Felora Neon</span>
                </span>
              }
            />
          </div>
        </SectionBlock>
      </div>
    </div>
  )
}


