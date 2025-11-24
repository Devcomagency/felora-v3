'use client'

import { useEffect, useState } from 'react'
import { Calendar, Loader2, ShieldCheck, BadgeCheck } from 'lucide-react'
import * as Dialog from '@radix-ui/react-dialog'
import { useTranslations } from 'next-intl'
import UploadDrop from '@/components/kyc-v2/UploadDrop'

type ProfileStatus = 'PENDING' | 'ACTIVE' | 'PAUSED' | 'VERIFIED'

export default function HeaderClient() {
  const t = useTranslations('dashboardEscort.header')
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState<ProfileStatus>('PENDING')
  const [pct, setPct] = useState<number>(0)
  const [isVerified, setIsVerified] = useState(false)
  const [kycStatus, setKycStatus] = useState<'NONE' | 'PENDING' | 'APPROVED' | 'REJECTED'>('NONE')

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      setLoading(true)
      try {
        const r = await fetch('/api/escort/profile/status', { cache: 'no-store', credentials: 'include' })
        const d = await r.json().catch(()=>null)
        if (!cancelled && d) {
          if (d.status) setStatus(d.status)
          if (typeof d.isVerifiedBadge === 'boolean') setIsVerified(!!d.isVerifiedBadge)
        }
        const rk = await fetch('/api/kyc-v2/status', { cache: 'no-store', credentials: 'include' })
        const dk = await rk.json().catch(()=>null)
        if (!cancelled && dk?.status) setKycStatus(dk.status)
      } finally { if (!cancelled) setLoading(false) }
    }
    load()
    const onProgress = (e: any) => {
      const pctValue = e?.detail?.pct
      if (typeof pctValue === 'number' && !isNaN(pctValue) && isFinite(pctValue)) {
        setPct(Math.max(0, Math.min(100, Math.round(pctValue))))
      }
    }
    const onStatus = async () => { try { await load() } catch {} }
    window.addEventListener('profile:progress' as any, onProgress)
    window.addEventListener('profile:status-changed' as any, onStatus)
    return () => {
      cancelled = true
      window.removeEventListener('profile:progress' as any, onProgress)
      window.removeEventListener('profile:status-changed' as any, onStatus)
    }
  }, [])

  const dispatch = (name: string) => {
    window.dispatchEvent(new CustomEvent(name))
  }

  return (
    <div className="glass rounded-xl p-1.5 flex items-center justify-between mb-6">
      <div className="flex items-center gap-4 px-2">
        <div className="flex items-center gap-2">
          {(status === 'ACTIVE' || status === 'VERIFIED') && (
            <>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-xs font-medium text-emerald-400 tracking-wide uppercase">
                {loading ? '…' : status === 'VERIFIED' ? t('status.verified') : t('status.active')}
              </span>
            </>
          )}
          {status === 'PAUSED' && (
            <>
              <span className="relative flex h-2 w-2">
                <span className="relative inline-flex rounded-full h-2 w-2 bg-yellow-500"></span>
              </span>
              <span className="text-xs font-medium text-yellow-400 tracking-wide uppercase">{t('status.paused')}</span>
            </>
          )}
          {status === 'PENDING' && (
            <>
              <span className="relative flex h-2 w-2">
                <span className="relative inline-flex rounded-full h-2 w-2 bg-gray-500"></span>
              </span>
              <span className="text-xs font-medium text-gray-400 tracking-wide uppercase">{t('status.inactive')}</span>
            </>
          )}
        </div>
        <div className="h-3 w-px bg-white/10"></div>
        <div className="flex items-center gap-1.5 text-neutral-500">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span className="text-xs">{isVerified ? 'Vérifié' : 'Non vérifié'}</span>
        </div>
        {loading && (
          <>
            <div className="h-3 w-px bg-white/10"></div>
            <div className="text-xs text-neutral-500 flex items-center">
              <Loader2 size={14} className="animate-spin mr-1.5"/> {t('loading')}
            </div>
          </>
        )}
      </div>

      <div className="flex items-center gap-2">
        <AccountCert kycStatus={kycStatus} />
      </div>
    </div>
  )
}

function KycNudge() {
  const [frontUrl, setFrontUrl] = useState<string | null>(null)
  const [backUrl, setBackUrl] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const canSubmit = !!frontUrl && !!backUrl && !submitting
  const submit = async () => {
    try {
      setSubmitting(true)
      const r = await fetch('/api/kyc-v2/submit-self', { method:'POST', headers:{ 'Content-Type':'application/json' }, body: JSON.stringify({ role: 'ESCORT', docFrontUrl: frontUrl, docBackUrl: backUrl }) })
      const d = await r.json()
      if (!r.ok || !d?.ok) throw new Error(d?.error || 'submit_failed')
      window.location.href = '/certification?submitted=1'
    } catch(e) {
      alert('Envoi KYC impossible. Réessaie ou passe par la page Certification.')
    } finally { setSubmitting(false) }
  }
  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <button className="px-3 py-2 rounded-lg bg-pink-500/20 text-pink-200 border border-pink-500/30 hover:bg-pink-500/25">Certifier mon âge</button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/60" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[92vw] max-w-lg rounded-2xl border border-white/10 bg-gray-900 p-5 shadow-xl">
          <Dialog.Title className="text-white text-lg font-semibold mb-1">Certifier mon âge</Dialog.Title>
          <Dialog.Description className="text-white/70 text-sm mb-4">Plus de vues et mise en avant. Téléversez votre pièce d'identité (recto/verso). Les fichiers sont détruits après vérification.</Dialog.Description>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <UploadDrop label="Recto (ID)" accept="image/*,.jpg,.jpeg,.png,.webp" onUploaded={setFrontUrl} />
            <UploadDrop label="Verso (ID)" accept="image/*,.jpg,.jpeg,.png,.webp" onUploaded={setBackUrl} />
          </div>
          <div className="flex items-center justify-end gap-2 mt-4">
            <Dialog.Close asChild>
              <button className="px-3 py-2 rounded-lg border border-white/10 text-white/80 hover:bg-white/10">Plus tard</button>
            </Dialog.Close>
            <button disabled={!canSubmit} onClick={submit} className={`px-3 py-2 rounded-lg ${canSubmit ? 'bg-pink-500 hover:bg-pink-600 text-white' : 'bg-pink-500/40 text-white/70 cursor-not-allowed'}`}>{submitting ? 'Envoi…' : 'Envoyer pour vérification'}</button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

function AccountCert({ kycStatus }: { kycStatus: 'NONE' | 'PENDING' | 'APPROVED' | 'REJECTED' }) {
  if (kycStatus === 'APPROVED') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium uppercase tracking-wide">
        <BadgeCheck className="w-3 h-3" /> Vérifié
      </span>
    )
  }
  if (kycStatus === 'PENDING') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] rounded bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 font-medium uppercase tracking-wide">
        <Loader2 className="w-3 h-3 animate-spin" /> En cours…
      </span>
    )
  }
  // NONE or REJECTED
  return (
    <a
      href="/profile-test-signup/escort?step=3"
      className="px-3 py-1.5 rounded-lg text-xs font-medium text-neutral-400 hover:text-white hover:bg-white/5 transition-colors"
    >
      Certifier
    </a>
  )
}