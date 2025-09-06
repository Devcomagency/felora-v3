"use client"
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import UploadDrop from '@/components/kyc-v2/UploadDrop'
import { CheckCircle, Shield, Timer, Users, Image as ImageIcon, ArrowLeft, Verified } from 'lucide-react'

export default function CertificationPage() {
  const router = useRouter()
  const [userId, setUserId] = useState('')
  const [faceUrl, setFaceUrl] = useState<string>('')          // Visage de face
  const [faceKey, setFaceKey] = useState<string>('')
  const [profileUrl, setProfileUrl] = useState<string>('')    // Profil (visage de côté)
  const [profileKey, setProfileKey] = useState<string>('')
  const [bodyFrontUrl, setBodyFrontUrl] = useState<string>('')// Corps de face
  const [bodyFrontKey, setBodyFrontKey] = useState<string>('')
  const [bodyBackUrl, setBodyBackUrl] = useState<string>('')  // Corps de dos
  const [bodyBackKey, setBodyBackKey] = useState<string>('')
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState<string>('')
  const [showCongrats, setShowCongrats] = useState(false)
  const [err, setErr] = useState<string>('')
  const completed = [faceUrl, profileUrl, bodyFrontUrl, bodyBackUrl].filter(Boolean).length
  const [showSkip, setShowSkip] = useState(false)

  useEffect(() => {
    try {
      const uid = localStorage.getItem('felora-signup-userId') || ''
      setUserId(uid)
      if (!uid) {
        // Redirige vers l'inscription escort uniformisée
        router.replace('/register/indepandante')
      }
    } catch {}
  }, [router])

  const handleBack = () => {
    try {} catch {}
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back()
    } else {
      router.push('/')
    }
  }

  const submit = async () => {
    setErr(''); setMsg('')
    if (!faceUrl || !profileUrl || !bodyFrontUrl || !bodyBackUrl) { setErr('Ajoutez les 4 photos demandées'); return }
    setBusy(true)
    try {
      // Mappe vers l'API KYC v2 pour le traitement admin
      const payload = {
        userId,
        role: 'ESCORT',
        selfieSignUrl: faceUrl,     // visage de face avec papier "Velora"
        selfieUrl: profileUrl,      // visage de profil
        docFrontUrl: bodyFrontUrl,  // corps de face (utilisé ici comme recto)
        docBackUrl: bodyBackUrl     // corps de dos (utilisé ici comme verso)
      }
      const r = await fetch('/api/kyc-v2/submit', {
        method:'POST',
        headers:{ 'Content-Type':'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload)
      })
      if (r.status === 401) {
        setErr('Non connecté: connecte-toi avec ton compte escort puis réessaie.')
        return
      }
      const d = await r.json()
      if (!r.ok || !d?.ok) throw new Error(d?.error || 'submit_failed')
      setMsg('Votre demande de certification a bien été envoyée. Délai de modération: 48h.')
      setShowCongrats(true)
      // Redirection automatique vers le dashboard après un court délai
      setTimeout(() => {
        try { router.push('/escort/profile') } catch {}
      }, 1400)
    } catch (e:any) { setErr(e?.message || 'Erreur d' + 'envoi') } finally { setBusy(false) }
  }

  return (
    <>
    <main className="max-w-3xl mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={handleBack} aria-label="Retour" className="p-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-white/80">
          <ArrowLeft size={18} />
        </button>
        <h1 className="text-2xl font-extrabold bg-gradient-to-r from-pink-500 via-purple-400 to-teal-300 bg-clip-text text-transparent drop-shadow">Certification (badge)</h1>
      </div>

      {/* Hero */}
      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-[#1a1022] via-[#0d0d0f] to-[#10101a] p-6">
        <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full blur-3xl opacity-30" style={{ background: 'radial-gradient(circle, rgba(255,107,157,0.35) 0%, rgba(183,148,246,0.18) 60%, transparent 70%)' }} />
        <div className="absolute -bottom-24 -left-24 w-64 h-64 rounded-full blur-3xl opacity-30" style={{ background: 'radial-gradient(circle, rgba(79,209,199,0.35) 0%, rgba(183,148,246,0.18) 60%, transparent 70%)' }} />
        <p className="relative text-white/70 text-sm">Obtenez votre badge et renforcez la confiance: quelques photos dédiées, un contrôle doux, et c'est tout.</p>
      </div>

      {/* Bandeau mise en avant */}
      <div className="flex items-center gap-3 rounded-2xl border border-violet-500/30 bg-violet-500/10 p-4">
        {/* Badge Vérifié (design #verified-3) */}
        <div className="relative shrink-0 pb-2" aria-hidden>
          <div 
            className="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center shadow-lg"
            style={{
              background: 'linear-gradient(135deg, #4FD1C7 0%, #00D4AA 100%)',
              border: '2px solid rgba(255, 255, 255, 0.3)',
              boxShadow: '0 4px 20px rgba(79, 209, 199, 0.4)'
            }}
          >
            <Verified className="w-6 h-6 sm:w-8 sm:h-8 text-white drop-shadow-lg" />
          </div>
          <div 
            className="absolute -bottom-1 left-1/2 -translate-x-1/2 px-1 py-0.5 rounded text-[9px] font-bold"
            style={{
              background: 'linear-gradient(135deg, #4FD1C7 0%, #00D4AA 100%)',
              color: 'white'
            }}
          >
            VÉRIFIÉ
          </div>
        </div>
        <p className="text-sm text-white/90">
          <strong>Un badge certifié = +300% de contacts.</strong> Gratuit et rapide. Vos photos restent <strong>100% privées</strong>.
        </p>
      </div>

      {/* Instructions */}
      <div className="glass-card p-4 rounded-xl border border-white/10">
        <h3 className="text-white font-semibold mb-2">Ce que nous attendons</h3>
        <ul className="list-disc list-inside text-white/80 text-sm space-y-1">
          <li>Transmettez <strong>4 photos dédiées</strong>, récentes, nettes et prises en format portrait.</li>
          <li>Angles demandés: <strong>visage de face avec un papier "Velora"</strong>, <strong>visage de profil (côté)</strong>, <strong>corps de face avec un papier "Velora"</strong>, <strong>corps de dos</strong>.</li>
          <li>Ces images restent <strong>strictement confidentielles</strong> et ne paraissent pas sur votre profil public.</li>
          <li>Le contrôle qualité peut prendre jusqu'à <strong>48 heures ouvrées</strong>.</li>
          <li>Pour les profils duo, les <strong>deux personnes</strong> doivent figurer clairement sur l'ensemble des prises de vue.</li>
          <li>Assurez‑vous d'avoir <strong>au moins 3 photos publiques</strong> sur votre profil pour permettre la comparaison.</li>
          <li>Mettez en évidence vos <strong>signes distinctifs</strong> (tatouages, piercings, grains de beauté, cicatrices…).</li>
          <li>Nous procédons à des vérifications à la fois <strong>automatisées et manuelles</strong>; une image non conforme ou douteuse peut conduire au rejet de la demande.</li>
        </ul>
      </div>

      {/* Points clés (confidentialité, délais, duo) */}
      <div className="grid sm:grid-cols-3 gap-3">
        <div className="flex items-start gap-2 rounded-xl border border-white/10 bg-white/5 p-3">
          <Shield size={16} className="text-teal-300 mt-0.5" />
          <div className="text-xs text-white/80">Photos privées, <span className="text-white/90">jamais</span> publiées</div>
        </div>
        <div className="flex items-start gap-2 rounded-xl border border-white/10 bg-white/5 p-3">
          <Timer size={16} className="text-pink-300 mt-0.5" />
          <div className="text-xs text-white/80">Validation sous 48h ouvrées</div>
        </div>
        <div className="flex items-start gap-2 rounded-xl border border-white/10 bg-white/5 p-3">
          <Users size={16} className="text-purple-300 mt-0.5" />
          <div className="text-xs text-white/80">Profils duo: les 2 personnes visibles</div>
        </div>
      </div>

      {/* Progression */}
      <div className="rounded-xl border border-white/10 bg-white/5 p-3">
        <div className="flex items-center justify-between text-xs text-white/70 mb-2">
          <span>Progression</span>
          <span>{completed}/4</span>
        </div>
        <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
          <div className="h-full bg-gradient-to-r from-pink-500 to-purple-500" style={{ width: `${(completed/4)*100}%` }} />
        </div>
      </div>

      {/* Upload zones */}
      <div className="grid sm:grid-cols-2 gap-4">
        {/* Face */}
        <div className="rounded-xl border border-white/10 bg-white/5 p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-white/90 text-sm"><ImageIcon size={14} /> Visage de face avec papier "Velora"</div>
            {faceUrl ? <CheckCircle size={16} className="text-teal-400" /> : null}
          </div>
          <UploadDrop label="Ajouter" accept="image/jpeg,image/png" onUploaded={setFaceUrl} onUploadedMeta={(m)=> m.key && setFaceKey(m.key)} />
          {faceUrl && (
            <div className="mt-2 rounded-lg overflow-hidden border border-white/10 relative h-48">
              <Image src={faceUrl} alt="visage de face" fill sizes="(max-width:768px) 100vw, 50vw" className="object-cover" />
              {faceKey && <div className="absolute bottom-1 left-1 bg-black/60 text-white/70 text-[10px] px-1.5 py-0.5 rounded">clé: {faceKey}</div>}
            </div>
          )}
        </div>
        {/* Profile */}
        <div className="rounded-xl border border-white/10 bg-white/5 p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-white/90 text-sm"><ImageIcon size={14} /> Profil (visage de côté)</div>
            {profileUrl ? <CheckCircle size={16} className="text-teal-400" /> : null}
          </div>
          <UploadDrop label="Ajouter" accept="image/jpeg,image/png" onUploaded={setProfileUrl} onUploadedMeta={(m)=> m.key && setProfileKey(m.key)} />
          {profileUrl && (
            <div className="mt-2 rounded-lg overflow-hidden border border-white/10 relative h-48">
              <Image src={profileUrl} alt="profil" fill sizes="(max-width:768px) 100vw, 50vw" className="object-cover" />
              {profileKey && <div className="absolute bottom-1 left-1 bg-black/60 text-white/70 text-[10px] px-1.5 py-0.5 rounded">clé: {profileKey}</div>}
            </div>
          )}
        </div>
        {/* Corps face */}
        <div className="rounded-xl border border-white/10 bg-white/5 p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-white/90 text-sm"><ImageIcon size={14} /> Corps de face avec papier "Velora"</div>
            {bodyFrontUrl ? <CheckCircle size={16} className="text-teal-400" /> : null}
          </div>
          <UploadDrop label="Ajouter" accept="image/jpeg,image/png" onUploaded={setBodyFrontUrl} onUploadedMeta={(m)=> m.key && setBodyFrontKey(m.key)} />
          {bodyFrontUrl && (
            <div className="mt-2 rounded-lg overflow-hidden border border-white/10 relative h-48">
              <Image src={bodyFrontUrl} alt="corps face" fill sizes="(max-width:768px) 100vw, 50vw" className="object-cover" />
              {bodyFrontKey && <div className="absolute bottom-1 left-1 bg-black/60 text-white/70 text-[10px] px-1.5 py-0.5 rounded">clé: {bodyFrontKey}</div>}
            </div>
          )}
        </div>
        {/* Corps dos */}
        <div className="rounded-xl border border-white/10 bg-white/5 p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-white/90 text-sm"><ImageIcon size={14} /> Corps de dos</div>
            {bodyBackUrl ? <CheckCircle size={16} className="text-teal-400" /> : null}
          </div>
          <UploadDrop label="Ajouter" accept="image/jpeg,image/png" onUploaded={setBodyBackUrl} onUploadedMeta={(m)=> m.key && setBodyBackKey(m.key)} />
          {bodyBackUrl && (
            <div className="mt-2 rounded-lg overflow-hidden border border-white/10 relative h-48">
              <Image src={bodyBackUrl} alt="corps dos" fill sizes="(max-width:768px) 100vw, 50vw" className="object-cover" />
              {bodyBackKey && <div className="absolute bottom-1 left-1 bg-black/60 text-white/70 text-[10px] px-1.5 py-0.5 rounded">clé: {bodyBackKey}</div>}
            </div>
          )}
        </div>
      </div>

      {err && <div className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg p-3">{err}</div>}
      {msg && !showCongrats && <div className="text-green-400 text-sm bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3">{msg}</div>}

      <div className="flex items-center justify-between">
        <button onClick={()=>setShowSkip(true)} className="text-xs text-white/70 hover:text-white underline decoration-white/30">
          Passer pour l'instant
        </button>
        <div className="flex items-center gap-2">
          <button disabled={busy} onClick={submit} className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-violet-600 text-white font-medium shadow hover:shadow-violet-500/20 disabled:opacity-60">Envoyer la demande</button>
        </div>
      </div>
    </main>
    {showCongrats && (
      <div className="fixed inset-0 z-[11000] flex items-center justify-center">
        <div className="absolute inset-0 bg-black/60" onClick={()=>setShowCongrats(false)} />
        <div className="relative w-[min(92vw,32rem)] rounded-2xl border border-white/10 bg-gradient-to-br from-[#1a1022] via-[#0d0d0f] to-[#10101a] p-6 text-white">
          <h3 className="text-xl font-bold mb-2">Félicitations 🎉</h3>
          <p className="text-white/80 text-sm mb-4">Votre demande de certification a été transmise. Notre équipe procède aux vérifications — vous recevrez votre badge sous 48h ouvrées.</p>
          <div className="flex items-center justify-end">
            <a href="/escort/profile" className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-violet-600 text-white font-medium">OK, direction dashboard</a>
          </div>
        </div>
      </div>
    )}
    {showSkip && (
      <div className="fixed inset-0 z-[11000] flex items-center justify-center">
        <div className="absolute inset-0 bg-black/60" onClick={()=>setShowSkip(false)} />
        <div className="relative w-[min(92vw,32rem)] rounded-2xl border border-white/10 bg-gray-900/95 backdrop-blur p-6 text-white">
          <h3 className="text-lg font-semibold mb-2">Pourquoi finaliser la certification ?</h3>
          <ul className="list-disc list-inside text-white/80 text-sm space-y-1 mb-3">
            <li>Plus de visibilité et de contacts (+300% en moyenne)</li>
            <li>Confiance accrue des visiteurs grâce au badge</li>
            <li>Accès à certaines fonctionnalités avancées</li>
          </ul>
          <p className="text-white/60 text-sm mb-4">Vous pouvez revenir plus tard compléter la procédure, mais nous recommandons de la terminer maintenant pour activer pleinement votre profil.</p>
          <div className="flex items-center justify-end gap-2">
            <button onClick={()=>setShowSkip(false)} className="px-3 py-2 rounded-lg bg-white/10 hover:bg-white/15">Continuer la certification</button>
            <a href="/escort/profile" className="px-4 py-2 rounded-lg bg-gradient-to-r from-pink-500 to-violet-600 text-white font-medium">Passer et aller au dashboard</a>
          </div>
        </div>
      </div>
    )}
    </>
  )
}
