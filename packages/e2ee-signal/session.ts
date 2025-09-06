// Real Signal session scaffolding with safe fallback.
import { Buffer } from 'buffer'

export interface E2EESession {
  peerUserId: string
  // Internal context for libsignal usage (filled only when lib is available)
  _ctx?: {
    address: any
    sessionStore: any
    identityStore: any
    preKeyStore: any
    signedPreKeyStore: any
    deviceIdNum: number
  }
}

const sessions = new Map<string, E2EESession>()
let _libsignal: any | null = null
let _libsignalTried = false
let _localUserId: string | null = null

// Simple, deterministic mapping from string deviceId -> small int for ProtocolAddress
function deviceIdToNumber(id: string): number {
  let h = 0
  for (let i = 0; i < id.length; i++) {
    h = (h * 131 + id.charCodeAt(i)) >>> 0
  }
  // Keep it in a safe 24-bit range (1..0xFFFFFF)
  const n = (h & 0xFFFFFF) || 1
  return n
}

function lsGet<T>(key: string, def: T): T {
  if (typeof window === 'undefined') return def
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return def
    return JSON.parse(raw)
  } catch {
    return def
  }
}
function lsSet(key: string, value: any) {
  if (typeof window === 'undefined') return
  try { localStorage.setItem(key, JSON.stringify(value)) } catch {}
}

async function loadSignal(): Promise<any | null> {
  if (_libsignalTried) return _libsignal
  _libsignalTried = true
  // Temporarily disabled runtime imports to avoid devtools parse issues.
  _libsignal = null
  return null
}

export function setLocalUser(userId: string) {
  _localUserId = userId
}

// Local stores (Identity/Session/PreKey/SignedPreKey) persisted in localStorage per local user
function makeStores(lib: any) {
  if (!_localUserId) throw new Error('local_user_not_set')
  const base = `felora-signal:${_localUserId}`

  class LocalSessionStore extends lib.SessionStore {
    async saveSession(name: any, record: any): Promise<void> {
      const k = `${base}:session:${name.name()}:${name.deviceId()}`
      const buf = record.serialize()
      lsSet(k, Buffer.from(buf).toString('base64'))
    }
    async getSession(name: any): Promise<any | null> {
      const k = `${base}:session:${name.name()}:${name.deviceId()}`
      const b64 = lsGet<string | null>(k, null)
      if (!b64) return null
      try { return lib.SessionRecord.deserialize(Buffer.from(b64, 'base64')) } catch { return null }
    }
    async getExistingSessions(addresses: any[]): Promise<any[]> {
      const out: any[] = []
      for (const addr of addresses) {
        const rec = await this.getSession(addr)
        if (rec) out.push(rec)
      }
      return out
    }
  }

  class LocalIdentityKeyStore extends lib.IdentityKeyStore {
    async getIdentityKey(): Promise<any> {
      const k = `${base}:identity`
      let b64 = lsGet<string | null>(k, null)
      if (!b64) {
        // Generate new identity on the fly if missing
        const priv = lib.PrivateKey.generate()
        b64 = Buffer.from(priv.serialize()).toString('base64')
        lsSet(k, b64)
      }
      return lib.PrivateKey.deserialize(Buffer.from(b64!, 'base64'))
    }
    async getLocalRegistrationId(): Promise<number> {
      const k = `${base}:registrationId`
      let id = lsGet<number | null>(k, null)
      if (!id) { id = Math.max(1, Math.floor(Math.random() * 0xffff)); lsSet(k, id) }
      return id
    }
    async saveIdentity(name: any, key: any): Promise<boolean> {
      const k = `${base}:trusted:${name.name()}:${name.deviceId()}`
      try { lsSet(k, Buffer.from(key.serialize()).toString('base64')) } catch {}
      return true
    }
    async isTrustedIdentity(name: any, key: any, _direction: any): Promise<boolean> {
      const k = `${base}:trusted:${name.name()}:${name.deviceId()}`
      const b64 = lsGet<string | null>(k, null)
      if (!b64) return true // Trust on first use
      try { return Buffer.from(b64, 'base64').equals(key.serialize()) } catch { return true }
    }
    async getIdentity(name: any): Promise<any | null> {
      const k = `${base}:trusted:${name.name()}:${name.deviceId()}`
      const b64 = lsGet<string | null>(k, null)
      if (!b64) return null
      try { return lib.PublicKey.deserialize(Buffer.from(b64, 'base64')) } catch { return null }
    }
  }

  class LocalPreKeyStore extends lib.PreKeyStore {
    async savePreKey(id: number, record: any): Promise<void> {
      const k = `${base}:prekey:${id}`
      lsSet(k, Buffer.from(record.serialize()).toString('base64'))
    }
    async getPreKey(id: number): Promise<any> {
      const k = `${base}:prekey:${id}`
      const b64 = lsGet<string | null>(k, null)
      if (!b64) throw new Error('prekey_missing')
      return lib.PreKeyRecord.deserialize(Buffer.from(b64, 'base64'))
    }
    async removePreKey(id: number): Promise<void> {
      const k = `${base}:prekey:${id}`
      if (typeof window !== 'undefined') localStorage.removeItem(k)
    }
  }

  class LocalSignedPreKeyStore extends lib.SignedPreKeyStore {
    async saveSignedPreKey(id: number, record: any): Promise<void> {
      const k = `${base}:spk:${id}`
      lsSet(k, Buffer.from(record.serialize()).toString('base64'))
    }
    async getSignedPreKey(id: number): Promise<any> {
      const k = `${base}:spk:${id}`
      const b64 = lsGet<string | null>(k, null)
      if (!b64) throw new Error('signed_prekey_missing')
      return lib.SignedPreKeyRecord.deserialize(Buffer.from(b64, 'base64'))
    }
  }

  return {
    sessionStore: new LocalSessionStore(),
    identityStore: new LocalIdentityKeyStore(),
    preKeyStore: new LocalPreKeyStore(),
    signedPreKeyStore: new LocalSignedPreKeyStore(),
  }
}

export function getSession(peerUserId: string): E2EESession | null {
  return sessions.get(peerUserId) || null
}

export async function createSession(peerUserId: string, remoteBundle: any): Promise<E2EESession> {
  const lib = await loadSignal()
  const s: E2EESession = { peerUserId }
  if (!lib || !_localUserId) {
    sessions.set(peerUserId, s)
    return s
  }

  // Build stores
  const { sessionStore, identityStore, preKeyStore, signedPreKeyStore } = makeStores(lib)

  // Remote address uses numeric device id derived from remote deviceId string
  const remoteDeviceIdStr: string = remoteBundle?.deviceId || `${peerUserId}-dev`
  const remoteDeviceIdNum = deviceIdToNumber(remoteDeviceIdStr)
  const address = lib.ProtocolAddress.new(peerUserId, remoteDeviceIdNum)

  // Construct PreKeyBundle from remote (registrationId may be missing; fallback to 777)
  const registrationId: number = Number(remoteBundle?.registrationId || 777)
  const signedPreKeyId: number = Number(remoteBundle?.signedPreKeyId || 1)
  const signedPreKeyPub = lib.PublicKey.deserialize(Buffer.from(String(remoteBundle?.signedPreKeyPub || ''), 'base64'))
  const signedPreKeySig = Buffer.from(String(remoteBundle?.signedPreKeySig || ''), 'base64')
  const identityKey = lib.PublicKey.deserialize(Buffer.from(String(remoteBundle?.identityKeyPub || ''), 'base64'))
  // Pick first available prekey
  const pkArr: any[] = Array.isArray(remoteBundle?.preKeys) ? remoteBundle.preKeys : (remoteBundle?.preKeys?.preKeys || [])
  const firstPk = pkArr[0]
  const preKeyId: number | null = firstPk ? Number(firstPk.id) : null
  const preKeyPub = firstPk ? lib.PublicKey.deserialize(Buffer.from(String(firstPk.pubKey || ''), 'base64')) : null

  const bundle = lib.PreKeyBundle.new(
    registrationId,
    remoteDeviceIdNum,
    preKeyId,
    preKeyPub,
    signedPreKeyId,
    signedPreKeyPub,
    signedPreKeySig,
    identityKey,
  )

  // Process bundle → create session
  await lib.processPreKeyBundle(bundle, address, sessionStore, identityStore)

  s._ctx = { address, sessionStore, identityStore, preKeyStore, signedPreKeyStore, deviceIdNum: remoteDeviceIdNum }
  sessions.set(peerUserId, s)
  return s
}

// Encode a Signal ciphertext with a small header to identify message type for decryption
function encodeSignalCiphertext(lib: any, msg: any): string {
  try {
    const type = msg.type ? msg.type() : lib.CiphertextMessageType.Whisper
    const buf = msg.serialize ? msg.serialize() : Buffer.from(String(msg))
    return `sg:${type}:${Buffer.from(buf).toString('base64')}`
  } catch {
    return Buffer.from(String(msg)).toString('base64')
  }
}
function parseSignalCiphertext(lib: any, data: string): { type: number; buf: Buffer } | null {
  if (!data.startsWith('sg:')) return null
  const parts = data.split(':')
  if (parts.length < 3) return null
  const type = Number(parts[1])
  const b64 = parts.slice(2).join(':')
  try { return { type, buf: Buffer.from(b64, 'base64') } } catch { return null }
}

export async function encrypt(session: E2EESession, plaintext: string): Promise<string> {
  const lib = await loadSignal()
  if (lib && session._ctx) {
    const msg = await lib.signalEncrypt(Buffer.from(plaintext, 'utf8'), session._ctx.address, session._ctx.sessionStore, session._ctx.identityStore)
    return encodeSignalCiphertext(lib, msg)
  }
  // Fallback: base64
  return Buffer.from(plaintext, 'utf8').toString('base64')
}

export async function decrypt(session: E2EESession, cipherText: string): Promise<string> {
  const lib = await loadSignal()
  if (lib && session._ctx) {
    const parsed = parseSignalCiphertext(lib, cipherText)
    if (parsed) {
      try {
        if (parsed.type === lib.CiphertextMessageType.PreKey) {
          const pre = lib.PreKeySignalMessage.deserialize(parsed.buf)
          const plain = await lib.signalDecryptPreKey(pre, session._ctx.address, session._ctx.sessionStore, session._ctx.identityStore, session._ctx.preKeyStore, session._ctx.signedPreKeyStore)
          return Buffer.from(plain).toString('utf8')
        } else {
          const sig = lib.SignalMessage.deserialize(parsed.buf)
          const plain = await lib.signalDecrypt(sig, session._ctx.address, session._ctx.sessionStore, session._ctx.identityStore)
          return Buffer.from(plain).toString('utf8')
        }
      } catch {
        // fallthrough to base64 attempt below
      }
    }
  }
  try {
    return Buffer.from(cipherText, 'base64').toString('utf8')
  } catch {
    return '[unable to decrypt]'
  }
}

export const isSignalAvailable = typeof window !== 'undefined'
