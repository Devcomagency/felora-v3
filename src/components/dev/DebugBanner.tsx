'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { AlertTriangle, CheckCircle, X, RefreshCw, ExternalLink } from 'lucide-react'

interface HealthData {
  success: boolean
  debug?: {
    session?: any
    user?: any
    escortProfile?: any
    clubProfile?: any
    wallet?: any
    media?: any
  }
  error?: string
}

interface MediaHealthData {
  success: boolean
  debug?: {
    database?: any
    storage?: any
    recentMedia?: any
    environment?: any
  }
  error?: string
}

function DebugBanner() {
  const { data: session, status } = useSession()
  const [healthData, setHealthData] = useState<HealthData | null>(null)
  const [mediaHealthData, setMediaHealthData] = useState<MediaHealthData | null>(null)
  const [loading, setLoading] = useState(false)
  const [expanded, setExpanded] = useState(false)

  const fetchHealthData = async () => {
    setLoading(true)
    try {
      const [healthRes, mediaRes] = await Promise.all([
        fetch('/api/escort/profile/health'),
        fetch('/api/media/health')
      ])
      
      const health = await healthRes.json()
      const media = await mediaRes.json()
      
      setHealthData(health)
      setMediaHealthData(media)
    } catch (error) {
      console.error('Erreur fetch health data:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (status === 'authenticated') {
      fetchHealthData()
    }
  }, [status])

  const clearData = () => {
    setHealthData(null)
    setMediaHealthData(null)
  }

  if (status === 'loading') {
    return (
      <div className="bg-yellow-100 border-l-4 border-yellow-500 p-4">
        <div className="flex">
          <div className="ml-3">
            <p className="text-sm text-yellow-700">Chargement des données de debug...</p>
          </div>
        </div>
      </div>
    )
  }

  if (status === 'unauthenticated') {
    return (
      <div className="bg-red-100 border-l-4 border-red-500 p-4">
        <div className="flex">
          <AlertTriangle className="h-5 w-5 text-red-400" />
          <div className="ml-3">
            <p className="text-sm text-red-700">Non connecté - Debug non disponible</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-blue-100 border-l-4 border-blue-500 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          {healthData?.success ? (
            <CheckCircle className="h-5 w-5 text-green-500" />
          ) : (
            <AlertTriangle className="h-5 w-5 text-red-500" />
          )}
          <div className="ml-3">
            <p className="text-sm font-medium text-blue-800">
              Debug Mode - {healthData?.success ? 'Système OK' : 'Problèmes détectés'}
            </p>
            <p className="text-xs text-blue-600">
              Session: {session?.user?.email} | 
              User ID: {session?.user?.id} | 
              Role: {session?.user?.role}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={fetchHealthData}
            disabled={loading}
            className="p-1 text-blue-600 hover:text-blue-800 disabled:opacity-50"
            title="Actualiser"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          
          <button
            onClick={clearData}
            className="p-1 text-blue-600 hover:text-blue-800"
            title="Effacer"
          >
            <X className="h-4 w-4" />
          </button>
          
          <button
            onClick={() => setExpanded(!expanded)}
            className="px-2 py-1 text-xs bg-blue-200 text-blue-800 rounded hover:bg-blue-300"
          >
            {expanded ? 'Masquer' : 'Détails'}
          </button>
        </div>
      </div>

      {expanded && (
        <div className="mt-4 space-y-4">
          {/* Profil Health */}
          <div className="bg-white p-3 rounded border">
            <h4 className="font-medium text-sm text-gray-800 mb-2">Profil Health</h4>
            {healthData ? (
              <div className="text-xs space-y-1">
                <div className="flex justify-between">
                  <span>Status:</span>
                  <span className={healthData.success ? 'text-green-600' : 'text-red-600'}>
                    {healthData.success ? 'OK' : 'ERROR'}
                  </span>
                </div>
                {healthData.debug?.user && (
                  <>
                    <div className="flex justify-between">
                      <span>User Found:</span>
                      <span className="text-green-600">✓</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Has Password:</span>
                      <span className={healthData.debug.user.hasPassword ? 'text-green-600' : 'text-red-600'}>
                        {healthData.debug.user.hasPassword ? '✓' : '✗'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Has PasswordHash:</span>
                      <span className={healthData.debug.user.hasPasswordHash ? 'text-green-600' : 'text-red-600'}>
                        {healthData.debug.user.hasPasswordHash ? '✓' : '✗'}
                      </span>
                    </div>
                  </>
                )}
                {healthData.debug?.escortProfile && (
                  <div className="flex justify-between">
                    <span>Escort Profile:</span>
                    <span className="text-green-600">✓ {healthData.debug.escortProfile.stageName}</span>
                  </div>
                )}
                {healthData.debug?.clubProfile && (
                  <div className="flex justify-between">
                    <span>Club Profile:</span>
                    <span className="text-green-600">✓ {healthData.debug.clubProfile.name}</span>
                  </div>
                )}
                {healthData.debug?.wallet && (
                  <div className="flex justify-between">
                    <span>Wallet:</span>
                    <span className="text-green-600">✓ {healthData.debug.wallet.balance} CHF</span>
                  </div>
                )}
                {healthData.error && (
                  <div className="text-red-600">Error: {healthData.error}</div>
                )}
              </div>
            ) : (
              <div className="text-gray-500">Aucune donnée</div>
            )}
          </div>

          {/* Media Health */}
          <div className="bg-white p-3 rounded border">
            <h4 className="font-medium text-sm text-gray-800 mb-2">Media Health</h4>
            {mediaHealthData ? (
              <div className="text-xs space-y-1">
                <div className="flex justify-between">
                  <span>Status:</span>
                  <span className={mediaHealthData.success ? 'text-green-600' : 'text-red-600'}>
                    {mediaHealthData.success ? 'OK' : 'ERROR'}
                  </span>
                </div>
                {mediaHealthData.debug?.database && (
                  <div className="flex justify-between">
                    <span>DB Connected:</span>
                    <span className="text-green-600">✓</span>
                  </div>
                )}
                {mediaHealthData.debug?.storage && (
                  <div className="flex justify-between">
                    <span>Storage:</span>
                    <span className={mediaHealthData.debug.storage.testResult.success ? 'text-green-600' : 'text-red-600'}>
                      {mediaHealthData.debug.storage.provider} - {mediaHealthData.debug.storage.testResult.success ? 'OK' : 'ERROR'}
                    </span>
                  </div>
                )}
                {mediaHealthData.error && (
                  <div className="text-red-600">Error: {mediaHealthData.error}</div>
                )}
              </div>
            ) : (
              <div className="text-gray-500">Aucune donnée</div>
            )}
          </div>

          {/* Actions */}
          <div className="flex space-x-2">
            <a
              href="/api/escort/profile/health"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center px-2 py-1 text-xs bg-blue-200 text-blue-800 rounded hover:bg-blue-300"
            >
              <ExternalLink className="h-3 w-3 mr-1" />
              Profil Health API
            </a>
            <a
              href="/api/media/health"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center px-2 py-1 text-xs bg-blue-200 text-blue-800 rounded hover:bg-blue-300"
            >
              <ExternalLink className="h-3 w-3 mr-1" />
              Media Health API
            </a>
          </div>
        </div>
      )}
    </div>
  )
}

export default DebugBanner