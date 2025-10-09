// Thin adapter to manage key bundles with the server. For real Signal, use @signalapp/libsignal-client.

export async function uploadKeyBundle(payload: any) {
  const res = await fetch('/api/e2ee/keys/upload', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(payload),
  })
  if (!res.ok) throw new Error('keys_upload_failed')
  return res.json()
}

export async function fetchBundle(userId: string) {
  const res = await fetch(`/api/e2ee/keys/${encodeURIComponent(userId)}`, {
    credentials: 'include'
  })
  if (!res.ok) throw new Error('keys_fetch_failed')
  return res.json()
}

// Helper to generate a minimal pseudo-bundle (keeps existing PoC flow alive)
export async function generateSimpleBundle(userId: string, deviceId: string) {
  const rand = (len = 16) => Array.from(crypto.getRandomValues(new Uint8Array(len))).map(b => b.toString(16).padStart(2, '0')).join('')
  return {
    userId,
    deviceId,
    identityKeyPub: `IKP-${rand(16)}`,
    signedPreKeyId: 1,
    signedPreKeyPub: `SPK-${rand(16)}`,
    signedPreKeySig: `SIG-${rand(16)}`,
    preKeys: Array.from({ length: 5 }, (_, i) => ({ id: i + 2, pubKey: `PK-${rand(8)}` })),
  }
}
