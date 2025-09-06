export interface SubscriptionPlan {
  id: string
  name: string
  price: number
  features: string[]
  stripePriceId?: string
}

export const SUBSCRIPTION_PLANS: Record<string, SubscriptionPlan> = {
  basic: {
    id: 'basic',
    name: 'Plan Basique',
    price: 0,
    features: [
      'Profil de base',
      'Photos limitées',
      'Messagerie de base'
    ]
  },
  premium: {
    id: 'premium',
    name: 'Plan Premium',
    price: 29,
    features: [
      'Profil complet',
      'Photos illimitées',
      'Messagerie prioritaire',
      'Boost de visibilité'
    ],
    stripePriceId: process.env.STRIPE_PREMIUM_PRICE_ID
  },
  vip: {
    id: 'vip',
    name: 'Plan VIP',
    price: 99,
    features: [
      'Toutes les fonctionnalités Premium',
      'Badge vérifié',
      'Support prioritaire',
      'Analytics avancées'
    ],
    stripePriceId: process.env.STRIPE_VIP_PRICE_ID
  }
}

export const getSubscriptionPlan = (planId: string): SubscriptionPlan | undefined => {
  return SUBSCRIPTION_PLANS[planId]
}

export const calculateEndDate = (_planId: string, startDate: Date = new Date()): Date => {
  const endDate = new Date(startDate)
  endDate.setMonth(endDate.getMonth() + 1) // Tous les plans sont mensuels pour l'instant
  return endDate
}