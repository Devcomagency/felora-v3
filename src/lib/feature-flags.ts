// Minimal server-side feature flag helper
// Reads process.env for server code; UI should use NEXT_PUBLIC_* via hooks

export function isFeatureEnabled(name: string): boolean {
  try {
    const val = process.env[name]
    if (typeof val === 'string') return val.toLowerCase() === 'true'
    return false
  } catch {
    return false
  }
}

