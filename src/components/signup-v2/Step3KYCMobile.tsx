"use client"
import { useState } from 'react'
import UploadDrop from '@/components/kyc-v2/UploadDrop'
import { CheckCircle, BadgeCheck, ShieldCheck, AlertCircle, FileText, Camera, Video, User } from 'lucide-react'

export default function Step3KYCMobile({ userId, role='ESCORT', onSubmitted }:{ userId:string; role:'ESCORT'|'CLUB'|'CLIENT'; onSubmitted:(ok:boolean)=>void }){
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
        setError(`Pièces manquantes: ${missing.join(', ')}`)
        setBusy(false)
        return
      }
      
      if (!userId || userId === '') {
        console.error('No userId provided to Step3KYCMobile')
        setError('ID utilisateur manquant - veuillez recharger la page')
        setBusy(false)
        return
      }
      
      // Optimisation: envoyer les clés courtes au lieu des URLs complètes pour éviter payload trop large (erreur 413)
      const extractKey = (url?: string) => {
        if (!url) return undefined
        // Si c'est déjà une clé (pas d'URL), la retourner
        if (!url.includes('/')) return url
        // Sinon, extraire la clé de l'URL
        return url.split('/').pop() || undefined
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
          throw new Error('Fichiers trop volumineux. Veuillez compresser vos images/vidéos (max 3MB chacun).')
        }

        throw new Error(d?.error || `Erreur ${r.status}`)
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
      setError(e?.message || 'Erreur de soumission')
      setBusy(false)
    }
  }

  const documentTypes = [
    {
      key: 'docFrontUrl' as const,
      label: 'Pièce d\'identité — recto',
      icon: FileText,
      description: 'Carte d\'identité, passeport ou permis de conduire',
      example: '/examples/id-front.jpg',
      requirements: ['Document officiel valide', 'Photo claire et lisible', 'Toutes les informations visibles'],
      tips: ['Évitez les reflets', 'Assurez-vous que le texte est net', 'Cadrez bien le document']
    },
    {
      key: 'docBackUrl' as const,
      label: 'Pièce d\'identité — verso',
      icon: FileText,
      description: 'Arrière de votre pièce d\'identité',
      example: '/examples/id-back.jpg',
      requirements: ['Même document que le recto', 'Photo claire et lisible', 'Code-barres visible'],
      tips: ['Vérifiez que c\'est le même document', 'Évitez les reflets sur le code-barres', 'Cadrez bien le document']
    },
    {
      key: 'selfieSignUrl' as const,
      label: 'Selfie avec papier "FELORA"',
      icon: Camera,
      description: 'Photo de vous tenant un papier avec "FELORA" écrit',
      example: '/examples/selfie-sign.jpg',
      requirements: ['Votre visage bien visible', 'Papier avec "FELORA" lisible', 'Bonne luminosité'],
      tips: ['Écrivez "FELORA" sur un papier blanc', 'Tenez le papier près de votre visage', 'Regardez directement la caméra']
    },
    {
      key: 'livenessVideoUrl' as const,
      label: 'Vidéo de présentation',
      icon: Video,
      description: 'Vidéo courte de vous parlant à la caméra',
      example: '/examples/liveness-video.mp4',
      requirements: ['Vidéo de 10-30 secondes', 'Votre visage bien visible', 'Parlez clairement'],
      tips: ['Dites votre nom et "FELORA"', 'Bougez légèrement la tête', 'Assurez-vous d\'être bien éclairé']
    }
  ]

  if (showSuccess) {
    return (
      <div className="space-y-6">
        {/* Header mobile-first */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center animate-pulse">
              <ShieldCheck className="text-white" size={40} />
            </div>
          </div>
          <div>
            <h2 className="text-white text-2xl sm:text-3xl font-bold mb-2">🎉 Félicitations !</h2>
            <p className="text-white/70 text-base sm:text-lg max-w-md mx-auto leading-relaxed">
              Votre vérification d'identité a été soumise avec succès !
            </p>
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-500/10 via-emerald-500/10 to-teal-500/10 border border-green-500/30 rounded-2xl p-6 text-center space-y-4">
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center">
              <span className="text-3xl">✨</span>
            </div>
          </div>

          <h3 className="text-green-400 text-xl font-bold mb-2">Prêt à commencer !</h3>

          <div className="space-y-3 text-sm">
            <p className="text-green-300">
              <strong>📋 Prochaines étapes :</strong>
            </p>
            <div className="bg-green-500/10 rounded-xl p-4 text-left">
              <ul className="space-y-2 text-green-200">
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                  Finalisez votre profil avec photos et descriptions
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                  Configurez vos tarifs et disponibilités
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                  Votre vérification sera traitée sous 48h
                </li>
              </ul>
            </div>
          </div>

          <div className="flex items-center justify-center gap-2 text-emerald-300 mt-4">
            <div className="w-3 h-3 bg-emerald-400 rounded-full animate-bounce"></div>
            <div className="w-3 h-3 bg-emerald-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
            <div className="w-3 h-3 bg-emerald-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
          </div>
          <p className="text-emerald-300 text-sm font-medium">
            Redirection vers votre dashboard...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header mobile-first */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3">
          <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center">
            <ShieldCheck className="text-white" size={32} />
          </div>
        </div>
        <div>
          <h2 className="text-white text-2xl sm:text-3xl font-bold mb-2">Vérification d'identité</h2>
          <p className="text-white/70 text-base sm:text-lg max-w-md mx-auto leading-relaxed">
            Dernière étape pour sécuriser votre compte et commencer à gagner
          </p>
        </div>
      </div>

      {/* Documents upload */}
      <div className="space-y-6">
        {documentTypes.map((doc) => {
          const Icon = doc.icon
          const isUploaded = !!docs[doc.key]

          return (
            <div key={doc.key} className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
              <div className="flex items-start gap-4 mb-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  isUploaded ? 'bg-green-500/20' : 'bg-white/10'
                }`}>
                  <Icon className={isUploaded ? 'text-green-400' : 'text-white/60'} size={24} />
                </div>
                <div className="flex-1">
                  <h3 className="text-white text-lg font-semibold mb-1">{doc.label}</h3>
                  <p className="text-white/60 text-sm mb-3">{doc.description}</p>

                  {isUploaded && (
                    <div className="flex items-center gap-2 text-green-400 text-sm">
                      <CheckCircle size={16} />
                      <span>Document fourni</span>
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
            </div>
          )
        })}
      </div>

      {/* Checklist mobile */}
      <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
        <h4 className="text-white/90 font-semibold mb-4 text-lg flex items-center gap-2">
          <CheckCircle className="text-green-400" size={20} />
          Checklist des documents
        </h4>
        
        <div className="grid grid-cols-1 gap-4">
          {documentTypes.map((doc) => {
            const Icon = doc.icon
            const isUploaded = !!docs[doc.key]
            
            return (
              <div key={doc.key} className={`flex items-center gap-4 p-4 rounded-xl transition-colors ${
                isUploaded 
                  ? 'bg-green-500/10 border border-green-500/20' 
                  : 'bg-white/5 border border-white/10'
              }`}>
                <div className="flex items-center gap-3">
                  {isUploaded ? (
                    <BadgeCheck className="text-green-400" size={20} />
                  ) : (
                    <div className="w-5 h-5 border-2 border-white/30 rounded-full" />
                  )}
                  <Icon className={isUploaded ? 'text-green-400' : 'text-white/60'} size={20} />
                </div>
                <div className="flex-1">
                  <p className={`font-medium ${isUploaded ? 'text-green-400' : 'text-white/70'}`}>
                    {doc.label}
                  </p>
                  <p className={`text-sm ${isUploaded ? 'text-green-300' : 'text-white/50'}`}>
                    {isUploaded ? 'Document fourni' : 'En attente'}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
        
        {/* Status badges */}
        <div className="mt-6 pt-4 border-t border-white/10">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${isComplete ? 'bg-green-400' : 'bg-orange-400'}`} />
              <span className="text-sm text-white/80">
                {isComplete ? 'Tous les documents sont fournis' : `${missing.length} document(s) manquant(s)`}
              </span>
            </div>
            
            {isComplete && (
              <div className="flex items-center gap-2 px-4 py-2 bg-green-500/20 border border-green-500/30 rounded-full">
                <ShieldCheck className="text-green-400" size={16} />
                <span className="text-sm font-medium text-green-400">Prêt pour validation</span>
              </div>
            )}
            
            {!isComplete && (
              <div className="flex items-center gap-2 px-4 py-2 bg-orange-500/20 border border-orange-500/30 rounded-full">
                <AlertCircle className="text-orange-400" size={16} />
                <span className="text-sm font-medium text-orange-400">Documents incomplets</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="flex items-center gap-2 p-4 bg-red-500/20 border border-red-500/30 rounded-xl">
          <AlertCircle className="text-red-400" size={20} />
          <span className="text-red-400 text-sm">{error}</span>
        </div>
      )}

      {/* Action buttons */}
      <div className="space-y-4">
        <button
          onClick={submit}
          disabled={busy || !isComplete}
          className="w-full py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-bold text-lg disabled:opacity-60 flex items-center justify-center gap-2"
        >
          {busy ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Validation en cours...
            </>
          ) : (
            <>
              <ShieldCheck size={20} />
              Valider la vérification
            </>
          )}
        </button>

        <button
          onClick={() => setShowLater(true)}
          className="w-full py-3 bg-white/10 text-white rounded-xl font-medium hover:bg-white/20 transition-colors"
        >
          Compléter plus tard
        </button>
      </div>

      {/* Later modal */}
      {showLater && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 max-w-sm w-full">
            <h3 className="text-white text-xl font-bold mb-4">Compléter plus tard</h3>
            <p className="text-white/70 text-sm mb-6">
              Vous pourrez compléter votre vérification d'identité depuis votre tableau de bord.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowLater(false)}
                className="flex-1 py-3 bg-white/10 text-white rounded-xl font-medium hover:bg-white/20 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={() => onSubmitted(false)}
                className="flex-1 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-medium"
              >
                Continuer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
