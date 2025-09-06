export function toQS(obj: Record<string, any>) {
  const p = new URLSearchParams()
  Object.entries(obj).forEach(([k, v]) => {
    if (v === undefined || v === null || v === '') return
    p.set(k, String(v))
  })
  return p.toString()
}