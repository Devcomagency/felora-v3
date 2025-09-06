import { Buffer } from 'buffer'
// WebCrypto helpers for attachments (AES-GCM)

function b64FromBytes(bytes: Uint8Array): string {
  return Buffer.from(bytes).toString('base64')
}
function bytesFromB64(b64: string): Uint8Array {
  return Uint8Array.from(Buffer.from(b64, 'base64'))
}

export async function encryptFile(file: Blob): Promise<{ cipherBlob: Blob; meta: any }> {
  // Backward-compatible helper (keeps meta.key)
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const key = await crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, true, ['encrypt', 'decrypt'])
  const raw = await file.arrayBuffer()
  const cipher = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, raw)
  const exported = new Uint8Array(await crypto.subtle.exportKey('raw', key))
  return {
    cipherBlob: new Blob([cipher], { type: 'application/octet-stream' }),
    meta: {
      iv: b64FromBytes(iv),
      key: b64FromBytes(exported),
      mime: file.type || 'application/octet-stream',
      size: file.size,
    }
  }
}

export async function decryptFile(cipherBlob: Blob, meta: any): Promise<Blob> {
  const iv = bytesFromB64(meta.iv)
  const keyRaw = bytesFromB64(meta.key)
  const key = await crypto.subtle.importKey('raw', keyRaw, { name: 'AES-GCM' }, false, ['decrypt'])
  const cipherBuf = await cipherBlob.arrayBuffer()
  const plain = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, cipherBuf)
  return new Blob([plain], { type: meta.mime || 'application/octet-stream' })
}

// New helpers: envelopes (do not store the AES key in meta; put per-recipient envelopes instead)
export async function encryptFileWithEnvelopes(
  file: Blob,
  wrapForUser: (keyB64: string, recipientUserId: string) => Promise<string>,
  recipients: string[]
): Promise<{ cipherBlob: Blob; meta: any }> {
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const key = await crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, true, ['encrypt', 'decrypt'])
  const raw = await file.arrayBuffer()
  const cipher = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, raw)
  const exported = new Uint8Array(await crypto.subtle.exportKey('raw', key))
  const keyB64 = b64FromBytes(exported)
  const envelopes: Record<string, string> = {}
  for (const r of recipients) {
    try {
      envelopes[r] = await wrapForUser(keyB64, r)
    } catch {
      // As a last resort, store plaintext key for self only
      if (r === recipients[0]) envelopes[r] = keyB64
    }
  }
  return {
    cipherBlob: new Blob([cipher], { type: 'application/octet-stream' }),
    meta: {
      iv: b64FromBytes(iv),
      mime: file.type || 'application/octet-stream',
      size: file.size,
      envelopes,
    }
  }
}

export async function decryptFileWithEnvelopes(
  cipherBlob: Blob,
  meta: any,
  unwrapForSelf: (envelope: string) => Promise<string>,
  selfUserId: string
): Promise<Blob> {
  const iv = bytesFromB64(meta.iv)
  // Backward compatibility
  let keyB64: string | null = meta.key || null
  if (!keyB64) {
    const env = meta.envelopes?.[selfUserId]
    if (!env) throw new Error('no_envelope')
    keyB64 = await unwrapForSelf(env)
  }
  const keyRaw = bytesFromB64(String(keyB64))
  const key = await crypto.subtle.importKey('raw', keyRaw, { name: 'AES-GCM' }, false, ['decrypt'])
  const cipherBuf = await cipherBlob.arrayBuffer()
  const plain = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, cipherBuf)
  return new Blob([plain], { type: meta.mime || 'application/octet-stream' })
}
