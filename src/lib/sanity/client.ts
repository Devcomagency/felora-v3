import { createClient } from 'next-sanity'

// Configuration par défaut pour éviter les erreurs
const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'fallback-project'
const token = process.env.SANITY_API_TOKEN
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-01-01'

// Validation basique du projectId
const isValidProjectId = /^[a-z0-9-]+$/.test(projectId) && projectId !== 'fallback-project' && projectId !== 'temp-fallback'

if (!isValidProjectId && process.env.NODE_ENV === 'development') {
  console.warn('⚠️  Configuration Sanity invalide. Consultez SANITY_SETUP.md pour configurer.')
}

export const client = createClient({
  projectId: isValidProjectId ? projectId : 'temp-fallback',
  dataset: 'production',
  apiVersion,
  useCdn: false,
  token,
  ignoreBrowserTokenWarning: true,
})

// Export de l'état de configuration pour les services
export const isSanityConfigured = isValidProjectId && Boolean(token)