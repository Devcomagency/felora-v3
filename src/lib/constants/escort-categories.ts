/**
 * Constantes et utilitaires pour les catégories d'escortes
 */

export const ESCORT_CATEGORIES = {
  ESCORT: 'ESCORT',
  MASSEUSE: 'MASSEUSE',
  DOMINATRICE: 'DOMINATRICE',
  TRANSSEXUELLE: 'TRANSSEXUELLE',
  AUTRE: 'AUTRE',
} as const

export type EscortCategory = keyof typeof ESCORT_CATEGORIES

// Labels affichés dans l'interface
export const ESCORT_CATEGORY_LABELS: Record<EscortCategory, string> = {
  ESCORT: 'Escort',
  MASSEUSE: 'Masseuse',
  DOMINATRICE: 'Dominatrice',
  TRANSSEXUELLE: 'Transsexuelle',
  AUTRE: 'Autre',
}

// Descriptions pour chaque catégorie
export const ESCORT_CATEGORY_DESCRIPTIONS: Record<EscortCategory, string> = {
  ESCORT: 'Services d\'accompagnement classique',
  MASSEUSE: 'Massages érotiques et sensuels',
  DOMINATRICE: 'Pratiques BDSM et domination',
  TRANSSEXUELLE: 'Escorte transsexuelle',
  AUTRE: 'Autres services',
}

// Icônes/emojis pour chaque catégorie (désactivés)
export const ESCORT_CATEGORY_ICONS: Record<EscortCategory, string> = {
  ESCORT: '',
  MASSEUSE: '',
  DOMINATRICE: '',
  TRANSSEXUELLE: '',
  AUTRE: '',
}

// Label pour le rôle ESCORT (affiché comme "Indépendante")
export const ESCORT_ROLE_LABEL = 'Indépendante'

/**
 * Obtenir le label d'affichage pour une catégorie
 */
export function getCategoryLabel(category: EscortCategory | string): string {
  return ESCORT_CATEGORY_LABELS[category as EscortCategory] || category
}

/**
 * Obtenir la description d'une catégorie
 */
export function getCategoryDescription(category: EscortCategory | string): string {
  return ESCORT_CATEGORY_DESCRIPTIONS[category as EscortCategory] || ''
}

/**
 * Obtenir l'icône d'une catégorie
 */
export function getCategoryIcon(category: EscortCategory | string): string {
  return ESCORT_CATEGORY_ICONS[category as EscortCategory] || ''
}

/**
 * Obtenir le label complet avec icône
 */
export function getCategoryLabelWithIcon(category: EscortCategory | string): string {
  const icon = getCategoryIcon(category)
  const label = getCategoryLabel(category)
  return icon ? `${icon} ${label}` : label
}

/**
 * Obtenir toutes les catégories sous forme de tableau pour un select
 */
export function getCategoryOptions() {
  return Object.entries(ESCORT_CATEGORY_LABELS).map(([value, label]) => ({
    value,
    label,
    icon: ESCORT_CATEGORY_ICONS[value as EscortCategory],
    description: ESCORT_CATEGORY_DESCRIPTIONS[value as EscortCategory],
  }))
}

/**
 * Mapping des anciennes valeurs du dashboard vers les nouvelles valeurs enum
 */
export const LEGACY_CATEGORY_MAPPING: Record<string, EscortCategory> = {
  'escort': 'ESCORT',
  'masseuse-erotique': 'MASSEUSE',
  'dominatrice-bdsm': 'DOMINATRICE',
  'transsexuel': 'TRANSSEXUELLE',
  'autre': 'AUTRE',
}

/**
 * Convertir une ancienne valeur en valeur enum
 */
export function normalizeCategoryValue(value: string | undefined | null): EscortCategory {
  if (!value) return 'ESCORT'
  const upper = value.toUpperCase()
  if (upper in ESCORT_CATEGORIES) return upper as EscortCategory
  return LEGACY_CATEGORY_MAPPING[value.toLowerCase()] || 'ESCORT'
}
