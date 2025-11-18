'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { useState, Suspense } from 'react'
import { AlertTriangle, ChevronLeft } from 'lucide-react'
import { useTranslations } from 'next-intl'

function ReportForm() {
  const t = useTranslations('reportPage')
  const searchParams = useSearchParams()
  const router = useRouter()
  const type = searchParams.get('type') // 'media', 'profile', 'message'
  const id = searchParams.get('id')

  const [reason, setReason] = useState('')
  const [details, setDetails] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)

  // Mapping des clés de traduction par type
  const reportReasonKeys = {
    media: ['inappropriate', 'nudity', 'violence', 'illegal', 'spam', 'copyright', 'fake', 'other'],
    profile: ['fake', 'inappropriate', 'harassment', 'impersonation', 'spam', 'other'],
    message: ['harassment', 'inappropriate', 'spam', 'threats', 'other']
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!reason) {
      alert(t('selectReason'))
      return
    }

    setSubmitting(true)

    try {
      const response = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          targetId: id,
          reason,
          details
        })
      })

      const data = await response.json()

      if (data.success) {
        setSuccess(true)
        setTimeout(() => {
          router.back()
        }, 2000)
      } else {
        alert(t('errorSubmitting'))
      }
    } catch (error) {
      console.error('Error submitting report:', error)
      alert(t('connectionError'))
    } finally {
      setSubmitting(false)
    }
  }

  if (!type || !id) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center p-4">
        <div className="text-center">
          <AlertTriangle size={48} className="mx-auto mb-4 text-red-500" />
          <h1 className="text-xl font-bold text-white mb-2">{t('missingParams.title')}</h1>
          <p className="text-gray-400 mb-4">{t('missingParams.description')}</p>
          <button
            onClick={() => router.back()}
            className="px-6 py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors"
          >
            {t('missingParams.back')}
          </button>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-500/20 flex items-center justify-center">
            <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-white mb-2">{t('success.title')}</h1>
          <p className="text-gray-400">{t('success.description')}</p>
        </div>
      </div>
    )
  }

  const currentReasonKeys = reportReasonKeys[type as keyof typeof reportReasonKeys] || reportReasonKeys.media

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      <div className="max-w-2xl mx-auto p-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-400 hover:text-white mb-4 transition-colors"
          >
            <ChevronLeft size={20} />
            {t('back')}
          </button>

          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center">
              <AlertTriangle size={24} className="text-red-500" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">
                {type === 'media' ? t('title.media') : type === 'profile' ? t('title.profile') : t('title.message')}
              </h1>
              <p className="text-gray-400 text-sm">{t('subtitle')}</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-black/30 backdrop-blur-xl border border-white/10 rounded-xl p-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  {t('reasonLabel')}
                </label>
                <div className="space-y-2">
                  {currentReasonKeys.map((key) => {
                    const reasonText = t(`reasons.${type}.${key}`)
                    return (
                      <label
                        key={key}
                        className={`flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-all ${
                          reason === reasonText
                            ? 'bg-red-500/20 border-red-500/50'
                            : 'bg-white/5 border-white/10 hover:border-white/20'
                        }`}
                      >
                        <input
                          type="radio"
                          name="reason"
                          value={reasonText}
                          checked={reason === reasonText}
                          onChange={(e) => setReason(e.target.value)}
                          className="w-4 h-4"
                        />
                        <span className="text-white">{reasonText}</span>
                      </label>
                    )
                  })}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  {t('detailsLabel')}
                </label>
                <textarea
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white resize-none focus:outline-none focus:border-red-500"
                  rows={4}
                  placeholder={t('detailsPlaceholder')}
                />
              </div>
            </div>
          </div>

          {/* Info */}
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
            <div className="flex gap-3">
              <AlertTriangle size={20} className="text-yellow-500 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-yellow-200">
                <p className="font-medium mb-1">{t('importantNote')}</p>
                <p className="text-yellow-200/80">
                  {t('importantNoteDescription')}
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-lg font-medium transition-colors"
              disabled={submitting}
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              disabled={!reason || submitting}
              className="flex-1 px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? t('submitting') : t('submit')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function ReportPage() {
  const t = useTranslations('reportPage')

  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <div className="text-white">{t('loading')}</div>
      </div>
    }>
      <ReportForm />
    </Suspense>
  )
}
