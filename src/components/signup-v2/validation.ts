import { z } from 'zod'

// Simple +41 E.164 validator without external libs
const e164CH = z.string({ required_error: 'Téléphone suisse requis' }).refine(v => /^\+41\d{9}$/.test(v || ''), {
  message: 'Numéro suisse invalide (ex: 079 888 88 88 ou +41 79 888 88 88)'
})

export const passwordSchema = z.string({ required_error: 'Mot de passe requis' })
  .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
  .refine(v => /[a-z]/.test(v), { message: 'Le mot de passe doit contenir au moins une lettre minuscule' })
  .refine(v => /[A-Z]/.test(v), { message: 'Le mot de passe doit contenir au moins une lettre majuscule' })
  .refine(v => /\d/.test(v),   { message: 'Le mot de passe doit contenir au moins un chiffre' })

export const baseChecksSchema = z.object({
  isAdult: z.literal(true, { errorMap: () => ({ message: 'Vous devez avoir 18+' }) }),
  acceptTos: z.literal(true, { errorMap: () => ({ message: 'Acceptez les CGU/Confidentialité' }) }),
})

export const escortPreSignupSchema = z.object({
  email: z.string({ required_error: 'Email requis' }).email('Email invalide'),
  phoneE164: e164CH,
  handle: z.string({ required_error: 'Handle requis' }).min(3, 'Handle trop court (min 3)').max(24, 'Handle trop long (max 24)').regex(/^[a-z0-9_\.]+$/i, 'Caractères autorisés: lettres, chiffres, _ et .'),
  emailVerified: z.literal(true, { errorMap: () => ({ message: 'Vérifiez votre email' }) }),
  birthDate: z.string({ required_error: 'Date de naissance requise' }).refine(v => {
    const d = new Date(v)
    if (Number.isNaN(d.getTime())) return false
    const now = new Date()
    const age = now.getFullYear() - d.getFullYear() - ((now.getMonth() < d.getMonth() || (now.getMonth() === d.getMonth() && now.getDate() < d.getDate())) ? 1 : 0)
    return age >= 18
  }, { message: 'Vous devez avoir 18+' }),
  password: passwordSchema.refine(Boolean, { message: 'Mot de passe requis' }),
  confirm: z.string({ required_error: 'Confirmation requise' }),
  isAdult: z.boolean(),
  acceptTos: z.boolean(),
}).superRefine((val, ctx) => {
  if (val.password !== val.confirm) {
    ctx.addIssue({ code: 'custom', message: 'Les mots de passe ne correspondent pas', path: ['confirm'] })
  }
  const checks = baseChecksSchema.safeParse({ isAdult: val.isAdult, acceptTos: val.acceptTos })
  if (!checks.success) {
    checks.error.issues.forEach(i => ctx.addIssue(i))
  }
})

// Version allégée pour pré‑inscription ESCORT (sans handle ni date de naissance)
export const escortPreSignupLite = z.object({
  email: z.string({ required_error: 'Email requis' }).email('Email invalide'),
  phoneE164: e164CH,
  emailVerified: z.literal(true, { errorMap: () => ({ message: 'Vérifiez votre email' }) }),
  // facultatifs à ce stade
  handle: z.string().min(3).max(24).regex(/^[a-z0-9_\.]+$/i).optional(),
  birthDate: z.string().optional(),
  password: passwordSchema.refine(Boolean, { message: 'Mot de passe requis' }),
  confirm: z.string({ required_error: 'Confirmation requise' }),
  isAdult: z.boolean(),
  acceptTos: z.boolean(),
}).superRefine((val, ctx) => {
  if (val.password !== val.confirm) {
    ctx.addIssue({ code: 'custom', message: 'Les mots de passe ne correspondent pas', path: ['confirm'] })
  }
  const checks = baseChecksSchema.safeParse({ isAdult: val.isAdult, acceptTos: val.acceptTos })
  if (!checks.success) {
    checks.error.issues.forEach(i => ctx.addIssue(i))
  }
  if (val.birthDate) {
    const d = new Date(val.birthDate)
    if (Number.isNaN(d.getTime())) ctx.addIssue({ code:'custom', message:'Date de naissance invalide', path:['birthDate'] })
    else {
      const now = new Date()
      const age = now.getFullYear() - d.getFullYear() - ((now.getMonth() < d.getMonth() || (now.getMonth() === d.getMonth() && now.getDate() < d.getDate())) ? 1 : 0)
      if (age < 18) ctx.addIssue({ code:'custom', message:'Vous devez avoir 18+', path:['birthDate'] })
    }
  }
})

export const clientSignupSchema = z.object({
  email: z.string().email(),
  pseudo: z.string({ required_error: 'Pseudo requis' })
    .min(3, 'Pseudo trop court (min 3)')
    .max(24, 'Pseudo trop long (max 24)')
    .regex(/^[a-z0-9_\.\-]+$/i, 'Caractères autorisés: lettres, chiffres, _ . -'),
  phoneE164: z.string().optional(),
  password: passwordSchema,
  confirm: z.string(),
  isAdult: z.boolean(),
  acceptTos: z.boolean(),
}).superRefine((val, ctx) => {
  if (val.phoneE164 && !/^\+41\d{9}$/.test(val.phoneE164)) {
    ctx.addIssue({ code: 'custom', message: 'Numéro suisse +41 invalide', path: ['phoneE164'] })
  }
  if (val.password !== val.confirm) {
    ctx.addIssue({ code: 'custom', message: 'Les mots de passe ne correspondent pas', path: ['confirm'] })
  }
  const checks = baseChecksSchema.safeParse({ isAdult: val.isAdult, acceptTos: val.acceptTos })
  if (!checks.success) checks.error.issues.forEach(i => ctx.addIssue(i))
})

export const clubPreSignupSchema = z.object({
  email: z.string().email(),
  handle: z.string().min(3).max(24).regex(/^[a-z0-9_\.]+$/i),
  companyName: z.string().min(2, 'Nom de la société requis'),
  ideNumber: z.string().min(3, 'IDE requis').regex(/^[A-Za-z0-9\-\. ]+$/, 'IDE invalide'),
  managerName: z.string().min(2, 'Responsable requis'),
  phoneE164: z.string().optional(),
  password: passwordSchema,
  confirm: z.string(),
  isAdult: z.boolean(),
  acceptTos: z.boolean(),
}).superRefine((val, ctx) => {
  if (val.phoneE164 && !/^\+41\d{9}$/.test(val.phoneE164)) {
    ctx.addIssue({ code: 'custom', message: 'Numéro suisse +41 invalide', path: ['phoneE164'] })
  }
  if (val.password !== val.confirm) {
    ctx.addIssue({ code: 'custom', message: 'Les mots de passe ne correspondent pas', path: ['confirm'] })
  }
  const checks = baseChecksSchema.safeParse({ isAdult: val.isAdult, acceptTos: val.acceptTos })
  if (!checks.success) checks.error.issues.forEach(i => ctx.addIssue(i))
})

export type EscortPreSignup = z.infer<typeof escortPreSignupSchema>
export type EscortPreSignupLite = z.infer<typeof escortPreSignupLite>
export type ClientSignup = z.infer<typeof clientSignupSchema>
export type ClubPreSignup = z.infer<typeof clubPreSignupSchema>
