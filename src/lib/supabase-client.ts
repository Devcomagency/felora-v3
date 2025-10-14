/**
 * Supabase Client pour Realtime
 * Utilisé pour recevoir les messages en temps réel via Supabase Realtime
 * Fonctionne en dev ET prod (Vercel serverless)
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('[SUPABASE] Variables d\'environnement manquantes. Ajoutez NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_ANON_KEY à .env.local')
}

// Client Supabase pour le frontend
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  realtime: {
    params: {
      eventsPerSecond: 10, // Limite du nombre d'événements par seconde
    },
  },
})
