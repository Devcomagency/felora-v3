"use client"
import { useState } from 'react'
import UploadDrop from '@/components/kyc-v2/UploadDrop'

export default function Step3KYC({ userId, role='ESCORT', onSubmitted }:{ userId:string; role:'ESCORT'|'CLUB'|'CLIENT'; onSubmitted:(ok:boolean)=>void }){
  const [docs, setDocs] = useState<{[k:string]: string}>({})
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string|null>(null)
  const [showLater, setShowLater] = useState(false)
  // Requis: recto, verso, selfie papier "FELORA", vidéo de vérification
  const requiredKeys = ['docFrontUrl','docBackUrl','selfieSignUrl','livenessVideoUrl'] as const
  const missing = requiredKeys.filter(k => !docs[k])
  const isComplete = missing.length === 0


  const submit = async () => {
    setBusy(true); setError(null)
    try {
      if (!isComplete) {
        setError(`Pièces manquantes: ${missing.join(', ')}`)
        setBusy(false)
        return
      }
      const r = await fetch('/api/kyc-v2/submit', { method:'POST', headers:{ 'Content-Type':'application/json' }, body: JSON.stringify({ userId, role, ...docs }) })
      const d = await r.json(); if (!r.ok || !d?.ok) throw new Error(d?.error || 'submit_failed')
      onSubmitted(true)
    } catch (e:any) { setError(e.message); onSubmitted(false) } finally { setBusy(false) }
  }

  return (
    <div className="space-y-5">
      {/* Instructions claires */}
      <div className="glass-card p-4 rounded-xl border border-white/10">
        <h3 className="text-white font-semibold mb-2">Vérification d’identité — étapes à suivre</h3>
        <ul className="list-disc list-inside text-white/80 text-sm space-y-1">
          <li>Photo nette de votre pièce d'identité — recto</li>
          <li>Photo nette de votre pièce d'identité — verso</li>
          <li>Selfie où l'on vous voit tenir un papier avec le mot « FELORA »</li>
          <li>Vidéo courte (max 30s) où vous vous présentez en disant votre nom</li>
        </ul>
        <p className="text-white/60 text-xs mt-2">Formats acceptés: JPG/PNG pour les photos, WEBM/MP4/MOV pour la vidéo. Lumière naturelle et fond neutre recommandés.</p>
      </div>

      {/* Uploads documentaires */}
      <div className="grid sm:grid-cols-2 gap-4">
        <UploadDrop label="Pièce d'identité — recto" accept="image/jpeg,image/png" onUploaded={url=>setDocs(s=>({ ...s, docFrontUrl: url }))} />
        <UploadDrop label="Pièce d'identité — verso" accept="image/jpeg,image/png" onUploaded={url=>setDocs(s=>({ ...s, docBackUrl: url }))} />
        <UploadDrop label="Selfie avec 'FELORA'" accept="image/jpeg,image/png" onUploaded={url=>setDocs(s=>({ ...s, selfieSignUrl: url }))} />
      </div>

      {/* Upload vidéo de vérification */}
      <div className="glass-card p-4 rounded-xl border border-white/10">
        <p className="text-white/80 mb-3 text-sm">Vidéo de présentation (max 30s)</p>
        <p className="text-white/60 text-xs mb-3">Présentez-vous en disant votre nom complet. Filmez en mode portrait avec une bonne luminosité.</p>
        <UploadDrop 
          label="Sélectionner votre vidéo" 
          accept="video/mp4,video/webm,video/quicktime,video/mov" 
          maxMb={50}
          onUploaded={url=>setDocs(s=>({ ...s, livenessVideoUrl: url }))} 
        />
      </div>

      {error && <div className="text-red-400 text-sm">{error}</div>}

      {/* Actions */}
      <div className="flex items-center justify-between">
        <button onClick={()=>setShowLater(true)} className="text-white/70 text-sm hover:text-white underline decoration-white/30">Vérifier plus tard</button>
        <button disabled={busy || !isComplete} onClick={submit} className={`px-4 py-2 rounded-lg text-white font-medium ${(!isComplete||busy)?'opacity-60 cursor-not-allowed bg-white/10':'bg-gradient-to-r from-teal-500 to-emerald-600'}`}>{busy ? 'Envoi…' : 'Envoyer'}</button>
      </div>

      {/* Checklist */}
      <div className="text-xs text-white/70 mt-2">
        Requis:
        {(
          [
            ['docFrontUrl','Pièce — recto'],
            ['docBackUrl','Pièce — verso'],
            ['selfieSignUrl','Selfie "FELORA"'],
            ['livenessVideoUrl','Vidéo présentation'],
          ] as Array<[keyof typeof docs, string]>
        ).map(([key,label]) => (
          <span key={String(key)} className={`inline-flex items-center gap-1 mr-3 ${docs[key] ? 'text-emerald-400' : 'text-white/50'}`}>
            <span>{docs[key] ? '✓' : '•'}</span> {label}
          </span>
        ))}
      </div>

      {/* Modal "Vérifier plus tard" */}
      {showLater && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60" onClick={()=>setShowLater(false)} />
          <div className="relative w-[min(92vw,32rem)] rounded-xl border border-white/10 bg-gray-900/95 backdrop-blur p-5 text-white">
            <h4 className="text-lg font-semibold mb-2">Attention — vérification non complétée</h4>
            <ul className="list-disc list-inside text-white/80 text-sm space-y-1 mb-3">
              <li>Visibilité réduite dans la recherche</li>
              <li>Fonctionnalités limitées (ex: retrait, certains envois)</li>
              <li>Badge “Non vérifié” visible sur le profil</li>
            </ul>
            <p className="text-white/60 text-sm mb-4">Vous pourrez terminer votre vérification plus tard depuis votre tableau de bord. Pour une meilleure visibilité et la confiance des clients, nous recommandons de finaliser la vérification maintenant.</p>
            <div className="flex items-center justify-end gap-2">
              <button onClick={()=>setShowLater(false)} className="px-3 py-2 rounded-lg bg-white/10 hover:bg-white/15">Continuer la vérification</button>
              <button onClick={()=>{ setShowLater(false); onSubmitted(false) }} className="px-3 py-2 rounded-lg bg-gradient-to-r from-pink-500 to-purple-600">Compris, je ferai plus tard</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
