"use client"
import { useState } from 'react'
import { useTranslations } from 'next-intl'
import UploadDrop from '@/components/kyc-v2/UploadDrop'
import { CheckCircle, BadgeCheck, ShieldCheck, AlertCircle } from 'lucide-react'

export default function Step3KYC({ userId, role='ESCORT', onSubmitted }:{ userId:string; role:'ESCORT'|'CLUB'|'CLIENT'; onSubmitted:(ok:boolean)=>void }){
  const t = useTranslations('signup.kyc')
  console.log('Step3KYC received userId:', userId, 'role:', role)
  const [docs, setDocs] = useState<{[k:string]: string}>({})
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string|null>(null)
  const [showLater, setShowLater] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  // Requis: recto, verso, selfie papier "FELORA", vidéo de vérification
  const requiredKeys = ['docFrontUrl','docBackUrl','selfieSignUrl','livenessVideoUrl'] as const
  const missing = requiredKeys.filter(k => !docs[k])
  const isComplete = missing.length === 0


  const submit = async () => {
    setBusy(true); setError(null)
    try {
      if (!isComplete) {
        setError(t('errors.missingDocs', { missing: missing.join(', ') }))
        setBusy(false)
        return
      }

      if (!userId || userId === '') {
        console.error('No userId provided to Step3KYC')
        setError(t('errors.missingUserId'))
        setBusy(false)
        return
      }
      
      console.log('Submitting KYC with data:', { userId, role, docs })
      
      // Envoyer seulement les clés des fichiers, pas les URLs complètes
      const fileKeys = {
        docFrontKey: docs.docFrontUrl?.split('/').pop() || '',
        docBackKey: docs.docBackUrl?.split('/').pop() || '',
        selfieSignKey: docs.selfieSignUrl?.split('/').pop() || '',
        livenessKey: docs.livenessVideoUrl?.split('/').pop() || ''
      }

      console.log('Sending fileKeys:', fileKeys)
      
      const r = await fetch('/api/kyc-v2/submit', { 
        method:'POST', 
        headers:{ 'Content-Type':'application/json' }, 
        body: JSON.stringify({ userId, role, ...fileKeys }) 
      })
      
      // Lire la réponse une seule fois
      const responseText = await r.text()
      let d
      
      try {
        d = JSON.parse(responseText)
      } catch (jsonError) {
        console.error('Response is not JSON:', r.status, responseText)
        throw new Error(`Erreur serveur ${r.status} - Réponse invalide`)
      }
      
      console.log('KYC submit response:', r.status, d)
      
      if (!r.ok || !d?.ok) {
        console.error('KYC submit failed:', { status: r.status, response: d })
        if (d?.debug) {
          console.error('Debug info:', d.debug)
        }
        
        // Message d'erreur spécifique pour 413
        if (r.status === 413) {
          throw new Error(t('errors.filesTooLarge'))
        }

        throw new Error(d?.error || t('errors.serverError', { status: r.status }))
      }

      setShowSuccess(true)
    } catch (e:any) {
      console.error('KYC submit error:', e)
      setError(e.message || t('errors.submitFailed'))
      // Ne pas appeler onSubmitted(false) pour éviter la redirection vers login
    } finally { 
      setBusy(false) 
    }
  }

  return (
    <div className="space-y-6">
      {/* Header amélioré */}
      <div className="glass-card p-6 rounded-xl border border-white/10 bg-gradient-to-r from-purple-500/10 to-pink-500/10">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
            <span className="text-white font-bold text-lg">3</span>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="text-white font-semibold text-lg">{t('header.title')}</h3>
              <ShieldCheck size={20} className="text-green-400" />
            </div>
            <p className="text-white/70 text-sm">{t('header.subtitle')}</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="text-white/90 font-medium mb-2 text-sm">{t('required.title')}</h4>
            <ul className="space-y-1 text-white/80 text-sm">
              <li className="flex items-center gap-2">
                <CheckCircle size={14} className="text-green-400" />
                {t('required.idFront')}
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle size={14} className="text-green-400" />
                {t('required.idBack')}
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle size={14} className="text-green-400" />
                {t('required.selfie')}
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle size={14} className="text-green-400" />
                {t('required.video')}
              </li>
            </ul>
          </div>

          <div className="bg-black/20 rounded-lg p-3">
            <h4 className="text-white/90 font-medium mb-2 text-sm">{t('tips.title')}</h4>
            <ul className="space-y-1 text-white/70 text-xs">
              <li>• {t('tips.naturalLight')}</li>
              <li>• {t('tips.avoidReflections')}</li>
              <li>• {t('tips.readable')}</li>
              <li>• {t('tips.formats')}</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Uploads documentaires */}
      <div className="grid sm:grid-cols-2 gap-4">
        <UploadDrop
          label={t('upload.idFront.label')}
          accept="image/*"
          onUploaded={url=>setDocs(s=>({ ...s, docFrontUrl: url }))}
          exampleImage="/examples/id-front.jpg"
          requirements={[
            t('upload.idFront.req1'),
            t('upload.idFront.req2'),
            t('upload.idFront.req3')
          ]}
          tips={[
            t('upload.idFront.tip1'),
            t('upload.idFront.tip2')
          ]}
          isRequired={true}
        />

        <UploadDrop
          label={t('upload.idBack.label')}
          accept="image/*"
          onUploaded={url=>setDocs(s=>({ ...s, docBackUrl: url }))}
          exampleImage="/examples/id-back.jpg"
          requirements={[
            t('upload.idBack.req1'),
            t('upload.idBack.req2'),
            t('upload.idBack.req3')
          ]}
          tips={[
            t('upload.idBack.tip1'),
            t('upload.idBack.tip2')
          ]}
          isRequired={true}
        />

        <UploadDrop
          label={t('upload.selfie.label')}
          accept="image/*"
          onUploaded={url=>setDocs(s=>({ ...s, selfieSignUrl: url }))}
          exampleImage="/examples/selfie-felora.jpg"
          requirements={[
            t('upload.selfie.req1'),
            t('upload.selfie.req2'),
            t('upload.selfie.req3')
          ]}
          tips={[
            t('upload.selfie.tip1'),
            t('upload.selfie.tip2')
          ]}
          isRequired={true}
        />
      </div>

      {/* Upload vidéo de vérification */}
      <div className="glass-card p-4 rounded-xl border border-white/10">
        <div className="flex items-center justify-between mb-3">
          <p className="text-white/80 text-sm font-medium">{t('upload.video.header')}</p>
          <span className="text-xs bg-red-500/20 text-red-400 px-2 py-1 rounded">{t('upload.video.required')}</span>
        </div>
        <p className="text-white/60 text-xs mb-4">{t('upload.video.description')}</p>

        <UploadDrop
          label={t('upload.video.selectLabel')}
          accept="video/mp4,video/webm,video/quicktime,video/mov"
          maxMb={25}
          onUploaded={url=>setDocs(s=>({ ...s, livenessVideoUrl: url }))}
          exampleImage="/examples/video-presentation.jpg"
          requirements={[
            t('upload.video.req1'),
            t('upload.video.req2'),
            t('upload.video.req3')
          ]}
          tips={[
            t('upload.video.tip1'),
            t('upload.video.tip2'),
            t('upload.video.tip3')
          ]}
          isRequired={true}
        />
      </div>

      {error && <div className="text-red-400 text-sm">{error}</div>}

      {/* Actions améliorées */}
      <div className="glass-card p-4 rounded-xl border border-white/10">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {!isComplete ? (
              <div className="flex items-center gap-2">
                <AlertCircle size={16} className="text-orange-400" />
                <span className="text-white/80 text-sm">
                  {t('status.missingDocs', { count: missing.length })}
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <BadgeCheck size={16} className="text-green-400" />
                <span className="text-green-400 text-sm font-medium">
                  {t('status.allReady')}
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowLater(true)}
              disabled={busy}
              className="px-4 py-2 text-white/60 hover:text-white/80 transition-colors disabled:opacity-50 text-sm"
            >
              {t('actions.completeLater')}
            </button>

            <button
              onClick={submit}
              disabled={busy || !isComplete}
              className="px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm flex items-center gap-2"
            >
              {busy ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  {t('actions.submitting')}
                </>
              ) : (
                <>
                  <ShieldCheck size={16} />
                  {t('actions.validateVerification')}
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Checklist améliorée avec icônes */}
      <div className="glass-card p-4 rounded-xl border border-white/10 mt-4">
        <h4 className="text-white/90 font-medium mb-3 text-sm flex items-center gap-2">
          <CheckCircle size={16} className="text-green-400" />
          {t('checklist.title')}
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {(
            [
              ['docFrontUrl', t('checklist.items.idFront'), '📄'],
              ['docBackUrl', t('checklist.items.idBack'), '📄'],
              ['selfieSignUrl', t('checklist.items.selfie'), '🤳'],
              ['livenessVideoUrl', t('checklist.items.video'), '🎥'],
            ] as Array<[keyof typeof docs, string, string]>
          ).map(([key, label, emoji]) => (
            <div key={String(key)} className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
              docs[key]
                ? 'bg-green-500/10 border border-green-500/20'
                : 'bg-white/5 border border-white/10'
            }`}>
              <div className="flex items-center gap-2">
                {docs[key] ? (
                  <BadgeCheck size={18} className="text-green-400" />
                ) : (
                  <div className="w-4 h-4 border-2 border-white/30 rounded-full" />
                )}
                <span className="text-lg">{emoji}</span>
              </div>
              <div className="flex-1">
                <p className={`text-sm font-medium ${docs[key] ? 'text-green-400' : 'text-white/70'}`}>
                  {label}
                </p>
                <p className={`text-xs ${docs[key] ? 'text-green-300' : 'text-white/50'}`}>
                  {docs[key] ? t('checklist.status.provided') : t('checklist.status.pending')}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Badges de statut */}
        <div className="mt-4 pt-4 border-t border-white/10">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${isComplete ? 'bg-green-400' : 'bg-orange-400'}`} />
              <span className="text-sm text-white/80">
                {isComplete ? t('checklist.status.allProvided') : t('checklist.status.missingCount', { count: missing.length })}
              </span>
            </div>

            {isComplete && (
              <div className="flex items-center gap-2 px-3 py-1 bg-green-500/20 border border-green-500/30 rounded-full">
                <ShieldCheck size={14} className="text-green-400" />
                <span className="text-xs font-medium text-green-400">{t('checklist.badge.readyForValidation')}</span>
              </div>
            )}

            {!isComplete && (
              <div className="flex items-center gap-2 px-3 py-1 bg-orange-500/20 border border-orange-500/30 rounded-full">
                <AlertCircle size={14} className="text-orange-400" />
                <span className="text-xs font-medium text-orange-400">{t('checklist.badge.incomplete')}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal "Vérifier plus tard" */}
      {showLater && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60" onClick={()=>setShowLater(false)} />
          <div className="relative w-[min(92vw,32rem)] rounded-xl border border-white/10 bg-gray-900/95 backdrop-blur p-5 text-white">
            <h4 className="text-lg font-semibold mb-2">{t('modal.later.title')}</h4>
            <ul className="list-disc list-inside text-white/80 text-sm space-y-1 mb-3">
              <li>{t('modal.later.consequences.visibility')}</li>
              <li>{t('modal.later.consequences.features')}</li>
              <li>{t('modal.later.consequences.badge')}</li>
            </ul>
            <p className="text-white/60 text-sm mb-4">{t('modal.later.description')}</p>
            <div className="flex items-center justify-end gap-2">
              <button onClick={()=>setShowLater(false)} className="px-3 py-2 rounded-lg bg-white/10 hover:bg-white/15">{t('modal.later.continueBtn')}</button>
              <button onClick={()=>{ setShowLater(false); onSubmitted(false) }} className="px-3 py-2 rounded-lg bg-gradient-to-r from-pink-500 to-purple-600">{t('modal.later.laterBtn')}</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de succès */}
      {showSuccess && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/80" />
          <div className="relative w-[min(92vw,36rem)] rounded-xl border border-emerald-500/20 bg-gradient-to-br from-gray-900/95 to-emerald-900/20 backdrop-blur-xl p-6 text-white">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">✅</span>
              </div>
              <h3 className="text-xl font-bold mb-3 text-emerald-400">{t('modal.success.title')}</h3>
              <div className="space-y-2 text-sm text-white/80 mb-6">
                <p><strong>{t('modal.success.congratulations')}</strong> {t('modal.success.docsSubmitted')}</p>
                <p>{t('modal.success.canComplete')}</p>
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3 mt-3">
                  <p className="font-semibold text-emerald-300">{t('modal.success.nextSteps.title')}</p>
                  <ul className="list-disc list-inside text-xs space-y-1 mt-2">
                    <li>{t('modal.success.nextSteps.completeProfile')}</li>
                    <li>{t('modal.success.nextSteps.addPhotos')}</li>
                    <li>{t('modal.success.nextSteps.verificationTime')}</li>
                    <li>{t('modal.success.nextSteps.badgeAuto')}</li>
                  </ul>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowSuccess(false)
                  onSubmitted(true)
                  // Redirection vers dashboard avec paramètre success
                  window.location.href = '/dashboard-escort/profil?success=kyc'
                }}
                className="w-full px-6 py-3 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold hover:from-emerald-600 hover:to-teal-700 transition-all"
              >
                {t('modal.success.goToDashboard')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
