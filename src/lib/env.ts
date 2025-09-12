import { z } from 'zod'

// Environment variables validation schema
const envSchema = z.object({
  // === CORE SYSTEM ===
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  NEXT_PUBLIC_APP_URL: z.string().url('NEXT_PUBLIC_APP_URL must be a valid URL'),
  
  // === DATABASE ===
  DATABASE_URL: z.string().url('DATABASE_URL must be a valid PostgreSQL URL'),
  
  // === AUTHENTICATION ===
  NEXTAUTH_URL: z.string().url('NEXTAUTH_URL must match your deployment URL'),
  NEXTAUTH_SECRET: z.string().min(32, 'NEXTAUTH_SECRET must be at least 32 characters'),
  
  // === FEATURE FLAGS ===
  FEATURE_UPLOAD: z.coerce.boolean().default(false),
  FEATURE_CADEAU: z.coerce.boolean().default(true),
  FEATURE_AUTH_MIDDLEWARE: z.coerce.boolean().default(false),
  FEATURE_UI_NEW_DESIGN: z.coerce.boolean().default(false),
  NEXT_PUBLIC_ENABLE_TEST_PAGES: z.coerce.boolean().default(false),
  NEXT_PUBLIC_DEBUG_MODE: z.coerce.boolean().default(false),
  
  // === STORAGE - All R2 vars must be present together ===
  STORAGE_PROVIDER: z.enum(['local', 'cloudflare-r2', 'aws-s3', 'base64']).default('local'),
  CLOUDFLARE_R2_ENDPOINT: z.string().url().optional(),
  CLOUDFLARE_R2_ACCESS_KEY: z.string().optional(),
  CLOUDFLARE_R2_SECRET_KEY: z.string().optional(),
  CLOUDFLARE_R2_BUCKET: z.string().optional(),
  CLOUDFLARE_R2_ACCOUNT_ID: z.string().optional(),
  
  // === EMAIL ===
  SMTP_HOST: z.string().min(1, 'SMTP_HOST is required'),
  SMTP_PORT: z.coerce.number().int().min(1).max(65535).default(587),
  SMTP_USER: z.string().min(1, 'SMTP_USER is required'),
  SMTP_PASS: z.string().min(1, 'SMTP_PASS is required'),
  SMTP_FROM: z.string().email('SMTP_FROM must be a valid email'),
  
  // === MAPS & LOCATION ===
  NEXT_PUBLIC_MAPBOX_TOKEN: z.string().optional(),
  NEXT_PUBLIC_GOOGLE_PLACES_KEY: z.string().optional(),
  
  // === OBSERVABILITY ===
  SENTRY_DSN: z.string().url().optional(),
  SENTRY_TRACES_SAMPLE_RATE: z.coerce.number().min(0).max(1).default(0.1),
  SENTRY_ENVIRONMENT: z.string().optional(),
  
  // === LIMITS & SECURITY ===
  MAX_FILE_SIZE: z.coerce.number().positive().default(10485760), // 10MB default
  MAX_FILES_PER_REQUEST: z.coerce.number().int().positive().default(10),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().positive().default(60000), // 1 minute
  RATE_LIMIT_MAX_REQUESTS: z.coerce.number().int().positive().default(100),
  
  // === BUSINESS LOGIC ===
  WALLET_MAX_FUND_PER_DAY: z.coerce.number().positive().default(2000),
  GIFT_MAX_PER_HOUR: z.coerce.number().int().positive().default(20),
  ADMIN_FUND_ONLY: z.coerce.boolean().default(false),
  
  // === CANARY SETTINGS ===
  CANARY_UPLOAD_PERCENTAGE: z.coerce.number().min(0).max(100).default(0),
  CANARY_CADEAU_PERCENTAGE: z.coerce.number().min(0).max(100).default(0),
  CANARY_UI_PERCENTAGE: z.coerce.number().min(0).max(100).default(0),
})

// Custom validation for R2 configuration
const validateR2Config = (data: any) => {
  if (data.STORAGE_PROVIDER === 'cloudflare-r2') {
    const r2Fields = [
      'CLOUDFLARE_R2_ENDPOINT',
      'CLOUDFLARE_R2_ACCESS_KEY', 
      'CLOUDFLARE_R2_SECRET_KEY',
      'CLOUDFLARE_R2_BUCKET'
    ]
    
    const missingFields = r2Fields.filter(field => !data[field])
    
    if (missingFields.length > 0) {
      throw new Error(`When STORAGE_PROVIDER=cloudflare-r2, these fields are required: ${missingFields.join(', ')}`)
    }
  }
  
  return data
}

// Validation with custom refinements
const validatedEnvSchema = envSchema.refine(validateR2Config, {
  message: "R2 configuration incomplete"
})

// Parse and validate environment variables
let env: z.infer<typeof envSchema>

try {
  env = validatedEnvSchema.parse(process.env)
  
  // Success logging in development
  if (process.env.NODE_ENV === 'development') {
    console.log('✅ Environment validation passed')
    
    // Log important settings
    const settings = {
      storage: env.STORAGE_PROVIDER,
      features: {
        upload: env.FEATURE_UPLOAD,
        cadeau: env.FEATURE_CADEAU,
        testPages: env.NEXT_PUBLIC_ENABLE_TEST_PAGES
      },
      r2Configured: !!(env.CLOUDFLARE_R2_ENDPOINT && env.CLOUDFLARE_R2_ACCESS_KEY),
      sentryEnabled: !!env.SENTRY_DSN
    }
    
    console.log('📊 Environment settings:', JSON.stringify(settings, null, 2))
  }
  
} catch (error) {
  console.error('❌ Environment validation failed:')
  
  if (error instanceof z.ZodError) {
    console.error('Missing or invalid environment variables:')
    error.issues.forEach((issue) => {
      const field = issue.path.join('.')
      console.error(`  • ${field}: ${issue.message}`)
    })
  } else {
    console.error(error)
  }
  
  console.error('\n📖 Fix by updating your .env file. See .env.example for reference.')
  
  // In production, fail hard. In development, continue with warnings.
  if (process.env.NODE_ENV === 'production') {
    console.error('🚨 Production build failed due to environment validation errors')
    process.exit(1)
  } else {
    console.warn('⚠️ Development mode: continuing with invalid environment (some features may not work)')
    env = {} as any // Fallback to empty object in dev
  }
}

export { env }
export type EnvConfig = z.infer<typeof envSchema>

// Helper functions
export function isR2Configured(): boolean {
  return !!(env.CLOUDFLARE_R2_ENDPOINT && env.CLOUDFLARE_R2_ACCESS_KEY && env.CLOUDFLARE_R2_SECRET_KEY && env.CLOUDFLARE_R2_BUCKET)
}

export function isSentryEnabled(): boolean {
  return !!env.SENTRY_DSN
}

export function isProduction(): boolean {
  return env.NODE_ENV === 'production'
}

export function getStorageConfig() {
  return {
    provider: env.STORAGE_PROVIDER,
    r2: {
      endpoint: env.CLOUDFLARE_R2_ENDPOINT,
      bucket: env.CLOUDFLARE_R2_BUCKET,
      accountId: env.CLOUDFLARE_R2_ACCOUNT_ID,
      configured: isR2Configured()
    },
    limits: {
      maxFileSize: env.MAX_FILE_SIZE,
      maxFilesPerRequest: env.MAX_FILES_PER_REQUEST
    }
  }
}

// Development helper to validate specific field
export function validateEnvField(field: keyof EnvConfig, value: any): boolean {
  try {
    const fieldSchema = envSchema.shape[field]
    fieldSchema.parse(value)
    return true
  } catch {
    return false
  }
}