"use client"
import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { motion } from 'framer-motion'
import UploadDrop from '@/components/kyc-v2/UploadDrop'
import { CheckCircle, BadgeCheck, ShieldCheck, AlertCircle, FileText, Camera, Video, Shield, Sparkles } from 'lucide-react'

export default function Step3KYCMobile({ userId, role='ESCORT', onSubmitted }:{ userId:string; role:'ESCORT'|'CLUB'|'CLIENT'; onSubmitted:(ok:boolean)=>void }){
  const t = useTranslations('signup.kyc')
  console.log('Step3KYCMobile received userId:', userId, 'role:', role)
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
        console.error('No userId provided to Step3KYCMobile')
        setError(t('errors.missingUserId'))
        setBusy(false)
        return
      }

      // Optimisation: envoyer les clés courtes au lieu des URLs complètes pour éviter payload trop large (erreur 413)
      const extractKey = (url?: string) => {
        if (!url) return undefined
        // Si c'est déjà une clé (pas d'URL), la retourner
        if (!url.includes('/')) return url

        // Extraire la clé de l'URL en gardant le préfixe folder (kyc/filename)
        // Ex: https://media.felora.ch/kyc/12345-file.png → kyc/12345-file.png
        const parts = url.split('/')
        if (parts.length >= 2) {
          // Récupérer les 2 derniers segments (kyc/filename)
          return `${parts[parts.length - 2]}/${parts[parts.length - 1]}`
        }
        // Fallback: retourner juste le nom de fichier
        return parts.pop() || undefined
      }

      const optimizedPayload = {
        userId,
        role,
        docFrontKey: extractKey(docs.docFrontUrl),
        docBackKey: extractKey(docs.docBackUrl),
        selfieSignKey: extractKey(docs.selfieSignUrl),
        livenessKey: extractKey(docs.livenessVideoUrl)
      }

      console.log('Submitting KYC with optimized data:', optimizedPayload)
      const r = await fetch('/api/kyc-v2/submit', { method:'POST', headers:{ 'Content-Type':'application/json' }, body: JSON.stringify(optimizedPayload) })

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
      // Redirection automatique vers le dashboard après 3 secondes
      setTimeout(() => {
        onSubmitted(true)
        // Redirection directe vers le dashboard escort
        window.location.href = '/dashboard-escort/profil?success=kyc'
      }, 3000)
    } catch (e: any) {
      console.error('KYC submit failed:', e)
      setError(e?.message || t('errors.submitFailed'))
      setBusy(false)
    }
  }

  const documentTypes = [
    {
      key: 'docFrontUrl' as const,
      label: t('upload.idFront.label'),
      icon: FileText,
      description: t('upload.idFront.req1'),
      example: undefined, // Pas d'exemple pour les documents d'identité (sensible)
      requirements: [t('upload.idFront.req1'), t('upload.idFront.req2'), t('upload.idFront.req3')],
      tips: [t('upload.idFront.tip1'), t('upload.idFront.tip2')]
    },
    {
      key: 'docBackUrl' as const,
      label: t('upload.idBack.label'),
      icon: FileText,
      description: t('upload.idBack.req1'),
      example: undefined, // Pas d'exemple pour les documents d'identité (sensible)
      requirements: [t('upload.idBack.req1'), t('upload.idBack.req2'), t('upload.idBack.req3')],
      tips: [t('upload.idBack.tip1'), t('upload.idBack.tip2')]
    },
    {
      key: 'selfieSignUrl' as const,
      label: t('upload.selfie.label'),
      icon: Camera,
      description: t('upload.selfie.req1'),
      example: '/examples/selfie-example.jpg',
      requirements: [t('upload.selfie.req1'), t('upload.selfie.req2'), t('upload.selfie.req3')],
      tips: [t('upload.selfie.tip1'), t('upload.selfie.tip2')]
    },
    {
      key: 'livenessVideoUrl' as const,
      label: t('upload.video.label'),
      icon: Video,
      description: t('upload.video.req1'),
      example: '/examples/video-example.mp4',
      requirements: [t('upload.video.req1'), t('upload.video.req2'), t('upload.video.req3')],
      tips: [t('upload.video.tip1'), t('upload.video.tip2'), t('upload.video.tip3')]
    }
  ]

  if (showSuccess) {
    return (
      <div className="space-y-8">
        {/* Header avec même style que payment */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="mb-6"
          >
            <div className="inline-flex p-4 rounded-2xl bg-gradient-to-br from-green-500/20 via-emerald-500/15 to-teal-600/20 border border-green-500/30 shadow-lg shadow-green-500/10">
              <ShieldCheck className="w-10 h-10 text-green-300" strokeWidth={2} />
            </div>
          </motion.div>
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-black tracking-tight mb-3 bg-gradient-to-r from-white via-white/90 to-white/80 bg-clip-text text-transparent">
              {t('modal.success.title')}
            </h1>
            <p className="text-white/70 text-base md:text-lg max-w-2xl mx-auto font-light">
              {t('modal.success.docsSubmitted')}
            </p>
          </motion.div>
        </motion.div>

        {/* Success card */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="max-w-2xl mx-auto"
        >
          <div className="rounded-2xl bg-gradient-to-br from-green-500/10 via-emerald-500/5 to-transparent border border-green-500/20 p-8 backdrop-blur-xl">
            <div className="flex items-center justify-center mb-6">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-green-400" />
              </div>
            </div>

            <h3 className="text-green-400 text-2xl font-bold mb-4 text-center">{t('modal.success.congratulations')}</h3>

            <div className="space-y-4">
              <p className="text-green-300 font-semibold text-center">
                {t('modal.success.nextSteps.title')}
              </p>
              <div className="rounded-xl bg-green-500/10 border border-green-500/20 p-6">
                <ul className="space-y-3 text-green-200">
                  <li className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-400 rounded-full flex-shrink-0" />
                    <span>{t('modal.success.nextSteps.completeProfile')}</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-400 rounded-full flex-shrink-0" />
                    <span>{t('modal.success.nextSteps.addPhotos')}</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-400 rounded-full flex-shrink-0" />
                    <span>{t('modal.success.nextSteps.verificationTime')}</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="flex items-center justify-center gap-2 mt-6">
              <div className="w-3 h-3 bg-emerald-400 rounded-full animate-bounce" />
              <div className="w-3 h-3 bg-emerald-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}} />
              <div className="w-3 h-3 bg-emerald-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}} />
            </div>
            <p className="text-emerald-300 text-sm font-medium text-center mt-2">
              {t('modal.success.goToDashboard')}...
            </p>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header avec même style que payment */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="mb-6"
        >
          <div className="inline-flex p-4 rounded-2xl bg-gradient-to-br from-pink-500/20 via-purple-500/15 to-violet-600/20 border border-pink-500/30 shadow-lg shadow-pink-500/10">
            <ShieldCheck className="w-10 h-10 text-pink-300" strokeWidth={2} />
          </div>
        </motion.div>
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-black tracking-tight mb-3 bg-gradient-to-r from-white via-white/90 to-white/80 bg-clip-text text-transparent">
            {t('header.title')}
          </h1>
          <p className="text-white/70 text-base md:text-lg max-w-2xl mx-auto font-light mb-3">
            {t('header.subtitle')}
          </p>
          <p className="text-green-400/80 text-sm md:text-base max-w-2xl mx-auto font-medium">
            {t('header.privacy')}
          </p>
        </motion.div>
      </motion.div>

      {/* Documents upload */}
      <div className="max-w-4xl mx-auto space-y-6">
        {documentTypes.map((doc, idx) => {
          const Icon = doc.icon
          const isUploaded = !!docs[doc.key]

          return (
            <motion.div
              key={doc.key}
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 + idx * 0.1 }}
              className={`rounded-2xl bg-gradient-to-br transition-all duration-300 border backdrop-blur-xl p-6 ${
                isUploaded
                  ? 'from-green-500/10 via-emerald-500/5 to-transparent border-green-500/30'
                  : 'from-white/5 to-transparent border-white/10'
              }`}
            >
              <div className="flex items-start gap-4 mb-4">
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center border transition-all duration-300 ${
                  isUploaded
                    ? 'bg-green-500/20 border-green-500/30'
                    : 'bg-white/10 border-white/20'
                }`}>
                  <Icon className={isUploaded ? 'text-green-400' : 'text-white/60'} size={26} strokeWidth={2} />
                </div>
                <div className="flex-1">
                  <h3 className="text-white text-lg font-bold mb-1">{doc.label}</h3>
                  <p className="text-white/60 text-sm mb-3">{doc.description}</p>

                  {isUploaded && (
                    <div className="flex items-center gap-2 text-green-400 text-sm font-semibold">
                      <CheckCircle size={18} />
                      <span>{t('checklist.status.provided')} ✓</span>
                    </div>
                  )}
                </div>
              </div>

              <UploadDrop
                label={doc.label}
                onUploaded={(url) => setDocs(prev => ({ ...prev, [doc.key]: url }))}
                accept={doc.key.includes('Video') ? 'video/*' : 'image/*'}
                exampleImage={doc.example}
                requirements={doc.requirements}
                tips={doc.tips}
                isRequired={true}
              />
            </motion.div>
          )
        })}
      </div>

      {/* Progress summary */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="max-w-2xl mx-auto"
      >
        <div className="rounded-2xl bg-gradient-to-br from-white/5 to-transparent border border-white/10 p-6 backdrop-blur-xl">
          <div className="flex items-center gap-3 mb-4">
            <CheckCircle className="text-pink-300" size={24} />
            <h4 className="text-white font-bold text-lg">{t('checklist.title')}</h4>
          </div>

          <div className="space-y-3 mb-6">
            {documentTypes.map((doc) => {
              const Icon = doc.icon
              const isUploaded = !!docs[doc.key]

              return (
                <div key={doc.key} className={`flex items-center gap-4 p-3 rounded-xl transition-all ${
                  isUploaded
                    ? 'bg-green-500/10 border border-green-500/20'
                    : 'bg-white/5 border border-white/10'
                }`}>
                  <div className="flex items-center gap-3">
                    {isUploaded ? (
                      <BadgeCheck className="text-green-400" size={22} />
                    ) : (
                      <div className="w-5 h-5 border-2 border-white/30 rounded-full" />
                    )}
                    <Icon className={isUploaded ? 'text-green-400' : 'text-white/50'} size={20} />
                  </div>
                  <div className="flex-1">
                    <p className={`font-medium text-sm ${isUploaded ? 'text-green-400' : 'text-white/70'}`}>
                      {doc.label}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Status badge */}
          <div className="flex items-center justify-center">
            {isComplete ? (
              <div className="flex items-center gap-2 px-5 py-2.5 bg-green-500/20 border border-green-500/30 rounded-full">
                <ShieldCheck className="text-green-400" size={20} />
                <span className="text-sm font-bold text-green-400">✓ {t('status.allReady')}</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 px-5 py-2.5 bg-orange-500/20 border border-orange-500/30 rounded-full">
                <AlertCircle className="text-orange-400" size={20} />
                <span className="text-sm font-bold text-orange-400">{t('checklist.status.missingCount', { count: missing.length })}</span>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Error message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto"
        >
          <div className="flex items-center gap-3 p-4 bg-red-500/20 border border-red-500/30 rounded-xl backdrop-blur-xl">
            <AlertCircle className="text-red-400" size={22} />
            <span className="text-red-400 text-sm font-medium">{error}</span>
          </div>
        </motion.div>
      )}

      {/* Action buttons */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="max-w-2xl mx-auto space-y-4"
      >
        <button
          onClick={submit}
          disabled={busy || !isComplete}
          className={`w-full py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2 ${
            isComplete && !busy
              ? 'bg-gradient-to-r from-pink-500/20 to-purple-500/20 hover:from-pink-500/30 hover:to-purple-500/30 border border-pink-500/30 hover:border-pink-500/50 text-white shadow-lg hover:shadow-pink-500/20'
              : 'bg-white/5 border border-white/10 text-white/40 cursor-not-allowed'
          }`}
        >
          {busy ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              {t('actions.submitting')}
            </>
          ) : (
            <>
              <Shield size={20} />
              {t('actions.validateVerification')}
            </>
          )}
        </button>

        <button
          onClick={() => setShowLater(true)}
          className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white/70 hover:text-white rounded-xl font-medium transition-all"
        >
          {t('actions.completeLater')}
        </button>
      </motion.div>

      {/* Later modal */}
      {showLater && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/20 max-w-sm w-full"
          >
            <h3 className="text-white text-xl font-bold mb-4">{t('modal.later.title')}</h3>
            <p className="text-white/70 text-sm mb-6">
              {t('modal.later.description')}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowLater(false)}
                className="flex-1 py-3 bg-white/10 hover:bg-white/15 border border-white/20 text-white rounded-xl font-medium transition-all"
              >
                {t('modal.later.cancelBtn')}
              </button>
              <button
                onClick={() => onSubmitted(false)}
                className="flex-1 py-3 bg-gradient-to-r from-pink-500/20 to-purple-500/20 hover:from-pink-500/30 hover:to-purple-500/30 border border-pink-500/30 text-white rounded-xl font-medium transition-all"
              >
                {t('modal.later.continueBtn')}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
