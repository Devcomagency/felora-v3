'use client'

import { useEffect, useState } from 'react'
import { Calendar, Loader2, ShieldCheck, BadgeCheck } from 'lucide-react'
import * as Dialog from '@radix-ui/react-dialog'
import UploadDrop from '@/components/kyc-v2/UploadDrop'

type ProfileStatus = 'PENDING' | 'ACTIVE' | 'PAUSED' | 'VERIFIED'

export default function HeaderClient() {
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
    <div className="sticky top-[52px] z-30 bg-black/70 backdrop-blur border border-white/10 rounded-xl px-4 py-3 text-sm">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3 flex-wrap">
          <div className={`px-2.5 py-1 rounded-lg text-xs font-medium border ${status === 'ACTIVE' || status === 'VERIFIED' ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' : status === 'PAUSED' ? 'bg-yellow-500/15 text-yellow-300 border-yellow-500/30' : 'bg-gray-500/15 text-gray-300 border-gray-500/30'}`}>
            {loading ? '…' : status === 'ACTIVE' ? 'Actif' : status === 'VERIFIED' ? 'Vérifié' : status === 'PAUSED' ? 'En pause' : 'Inactif'}
          </div>
          {/* Progression et vérification retirées du header global */}
        </div>
        {/* Boutons spécifiques retirés du header (Agenda, KYC) */}
      </div>
      {loading && (
        <div className="mt-2 text-xs text-white/60 flex items-center"><Loader2 size={14} className="animate-spin mr-2"/> Chargement…</div>
      )}
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
      <span className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-lg bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"><BadgeCheck size={14}/> Vérifié</span>
    )
  }
  if (kycStatus === 'PENDING') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-lg bg-yellow-500/15 text-yellow-200 border border-yellow-500/30">Vérification en cours…</span>
    )
  }
  // NONE or REJECTED
  return (
    <a href="/certification" className="px-3 py-2 rounded-lg bg-white/5 text-white/80 border border-white/10 hover:bg-white/10">Certifier mon compte</a>
  )
}