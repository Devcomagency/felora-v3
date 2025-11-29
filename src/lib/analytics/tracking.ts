/**
 * Centralized Umami Analytics Tracking Utility
 * Provides safe, typed tracking functions for all events
 */

// Extend window interface for Umami
declare global {
  interface Window {
    umami?: {
      track: (eventName: string, eventData?: Record<string, any>) => void
      identify: (id?: string, data?: Record<string, any>) => void
    }
  }
}

/**
 * Safe wrapper for Umami tracking
 * Handles errors gracefully and provides type safety
 */
export const track = {
  // ============================================
  // 1. NAVIGATION & PAGES
  // ============================================
  searchPerformed: (query: string, resultCount: number, section: 'escorts' | 'clubs') => {
    try {
      window.umami?.track('Search Performed', { query, resultCount, section })
    } catch (e) {
      console.debug('Analytics tracking failed:', e)
    }
  },

  tabChange: (section: 'escorts' | 'clubs') => {
    try {
      window.umami?.track('Tab Change', { section })
    } catch (e) {
      console.debug('Analytics tracking failed:', e)
    }
  },

  filtersOpened: () => {
    try {
      window.umami?.track('Filters Opened')
    } catch (e) {
      console.debug('Analytics tracking failed:', e)
    }
  },

  filtersClosed: (appliedFiltersCount: number) => {
    try {
      window.umami?.track('Filters Closed', { appliedFiltersCount })
    } catch (e) {
      console.debug('Analytics tracking failed:', e)
    }
  },

  mapViewed: (zoom?: number, center?: string) => {
    try {
      window.umami?.track('Map Viewed', { zoom, center })
    } catch (e) {
      console.debug('Analytics tracking failed:', e)
    }
  },

  feedScroll: (depth: number, mediaCount: number) => {
    try {
      window.umami?.track('Feed Scroll', { depth, mediaCount })
    } catch (e) {
      console.debug('Analytics tracking failed:', e)
    }
  },

  // ============================================
  // 2. PROFILES & CARDS
  // ============================================
  escortCardClick: (escortId: string, city?: string, category?: string) => {
    try {
      window.umami?.track('Escort Card Click', { escortId, city, category })
    } catch (e) {
      console.debug('Analytics tracking failed:', e)
    }
  },

  clubCardClick: (clubId: string, city?: string) => {
    try {
      window.umami?.track('Club Card Click', { clubId, city })
    } catch (e) {
      console.debug('Analytics tracking failed:', e)
    }
  },

  profileView: (profileId: string, profileType: 'escort' | 'club', category?: string, verified?: boolean) => {
    try {
      window.umami?.track('Profile View', { profileId, profileType, category, verified })
    } catch (e) {
      console.debug('Analytics tracking failed:', e)
    }
  },

  profileLike: (profileId: string, profileType: 'escort' | 'club') => {
    try {
      window.umami?.track('Profile Like', { profileId, profileType })
    } catch (e) {
      console.debug('Analytics tracking failed:', e)
    }
  },

  profileUnlike: (profileId: string, profileType: 'escort' | 'club') => {
    try {
      window.umami?.track('Profile Unlike', { profileId, profileType })
    } catch (e) {
      console.debug('Analytics tracking failed:', e)
    }
  },

  profileShare: (profileId: string, method: 'native' | 'clipboard') => {
    try {
      window.umami?.track('Profile Share', { profileId, method })
    } catch (e) {
      console.debug('Analytics tracking failed:', e)
    }
  },

  profileReport: (profileId: string, reason: string) => {
    try {
      window.umami?.track('Profile Report', { profileId, reason })
    } catch (e) {
      console.debug('Analytics tracking failed:', e)
    }
  },

  addToFavorites: (profileId: string) => {
    try {
      window.umami?.track('Add to Favorites', { profileId })
    } catch (e) {
      console.debug('Analytics tracking failed:', e)
    }
  },

  removeFromFavorites: (profileId: string) => {
    try {
      window.umami?.track('Remove from Favorites', { profileId })
    } catch (e) {
      console.debug('Analytics tracking failed:', e)
    }
  },

  // ============================================
  // 3. MEDIA & FEED
  // ============================================
  mediaView: (mediaId: string) => {
    try {
      window.umami?.track('Media View', { mediaId })
    } catch (e) {
      console.debug('Analytics tracking failed:', e)
    }
  },

  mediaLike: (mediaId: string, mediaType: 'IMAGE' | 'VIDEO', authorId: string) => {
    try {
      window.umami?.track('Media Like', { mediaId, mediaType, authorId })
    } catch (e) {
      console.debug('Analytics tracking failed:', e)
    }
  },

  mediaReaction: (mediaId: string, emoji: string, authorId: string) => {
    try {
      window.umami?.track('Media Reaction', { mediaId, emoji, authorId })
    } catch (e) {
      console.debug('Analytics tracking failed:', e)
    }
  },

  videoPlay: (mediaId: string, duration?: number) => {
    try {
      window.umami?.track('Video Play', { mediaId, duration })
    } catch (e) {
      console.debug('Analytics tracking failed:', e)
    }
  },

  videoPause: (mediaId: string, watchTime: number) => {
    try {
      window.umami?.track('Video Pause', { mediaId, watchTime })
    } catch (e) {
      console.debug('Analytics tracking failed:', e)
    }
  },

  videoCompleted: (mediaId: string, duration: number) => {
    try {
      window.umami?.track('Video Completed', { mediaId, duration })
    } catch (e) {
      console.debug('Analytics tracking failed:', e)
    }
  },

  videoMuteToggle: (muted: boolean) => {
    try {
      window.umami?.track('Video Mute Toggle', { muted })
    } catch (e) {
      console.debug('Analytics tracking failed:', e)
    }
  },

  galleryImageClick: (imageIndex: number, profileId: string) => {
    try {
      window.umami?.track('Gallery Image Click', { imageIndex, profileId })
    } catch (e) {
      console.debug('Analytics tracking failed:', e)
    }
  },

  mediaZoom: (mediaId: string, mediaType: 'IMAGE' | 'VIDEO') => {
    try {
      window.umami?.track('Media Zoom', { mediaId, mediaType })
    } catch (e) {
      console.debug('Analytics tracking failed:', e)
    }
  },

  // ============================================
  // 4. CONTACT & ACTIONS
  // ============================================
  contactWhatsApp: (profileId: string, profileType: 'escort' | 'club') => {
    try {
      window.umami?.track('Contact WhatsApp', { profileId, profileType })
    } catch (e) {
      console.debug('Analytics tracking failed:', e)
    }
  },

  contactPhone: (profileId: string, profileType: 'escort' | 'club') => {
    try {
      window.umami?.track('Contact Phone', { profileId, profileType })
    } catch (e) {
      console.debug('Analytics tracking failed:', e)
    }
  },

  contactSMS: (profileId: string, profileType: 'escort' | 'club') => {
    try {
      window.umami?.track('Contact SMS', { profileId, profileType })
    } catch (e) {
      console.debug('Analytics tracking failed:', e)
    }
  },

  contactWebsite: (profileId: string, profileType: 'escort' | 'club') => {
    try {
      window.umami?.track('Contact Website', { profileId, profileType })
    } catch (e) {
      console.debug('Analytics tracking failed:', e)
    }
  },

  phoneRevealed: (profileId: string) => {
    try {
      window.umami?.track('Phone Revealed', { profileId })
    } catch (e) {
      console.debug('Analytics tracking failed:', e)
    }
  },

  phoneCopied: (profileId: string) => {
    try {
      window.umami?.track('Phone Copied', { profileId })
    } catch (e) {
      console.debug('Analytics tracking failed:', e)
    }
  },

  messageButtonClick: (profileId: string, authenticated: boolean) => {
    try {
      window.umami?.track('Message Button Click', { profileId, authenticated })
    } catch (e) {
      console.debug('Analytics tracking failed:', e)
    }
  },

  messageSent: (conversationId: string, hasMedia: boolean, hasPaid: boolean) => {
    try {
      window.umami?.track('Message Sent', { conversationId, hasMedia, hasPaid })
    } catch (e) {
      console.debug('Analytics tracking failed:', e)
    }
  },

  giftSent: (giftType: string, value: number, recipientId: string) => {
    try {
      window.umami?.track('Gift Sent', { giftType, value, recipientId })
    } catch (e) {
      console.debug('Analytics tracking failed:', e)
    }
  },

  // ============================================
  // 5. FILTERS & SEARCH
  // ============================================
  filterAge: (minAge: number, maxAge: number) => {
    try {
      window.umami?.track('Filter Age', { minAge, maxAge })
    } catch (e) {
      console.debug('Analytics tracking failed:', e)
    }
  },

  filterCity: (city: string, canton?: string) => {
    try {
      window.umami?.track('Filter City', { city, canton })
    } catch (e) {
      console.debug('Analytics tracking failed:', e)
    }
  },

  filterCategory: (category: string) => {
    try {
      window.umami?.track('Filter Category', { category })
    } catch (e) {
      console.debug('Analytics tracking failed:', e)
    }
  },

  filterServices: (services: string[]) => {
    try {
      window.umami?.track('Filter Services', { services: services.join(','), count: services.length })
    } catch (e) {
      console.debug('Analytics tracking failed:', e)
    }
  },

  filterLanguages: (languages: string[]) => {
    try {
      window.umami?.track('Filter Languages', { languages: languages.join(','), count: languages.length })
    } catch (e) {
      console.debug('Analytics tracking failed:', e)
    }
  },

  filterRates: (minRate: number, maxRate: number) => {
    try {
      window.umami?.track('Filter Rates', { minRate, maxRate })
    } catch (e) {
      console.debug('Analytics tracking failed:', e)
    }
  },

  filterAvailability: (availableNow?: boolean, incall?: boolean, outcall?: boolean) => {
    try {
      window.umami?.track('Filter Availability', { availableNow, incall, outcall })
    } catch (e) {
      console.debug('Analytics tracking failed:', e)
    }
  },

  filterVerified: (verifiedOnly: boolean) => {
    try {
      window.umami?.track('Filter Verified', { verifiedOnly })
    } catch (e) {
      console.debug('Analytics tracking failed:', e)
    }
  },

  filterNew: (newOnly: boolean) => {
    try {
      window.umami?.track('Filter New', { newOnly })
    } catch (e) {
      console.debug('Analytics tracking failed:', e)
    }
  },

  filtersReset: () => {
    try {
      window.umami?.track('Filters Reset')
    } catch (e) {
      console.debug('Analytics tracking failed:', e)
    }
  },

  filtersApplied: (filterCount: number, activeFilters: string[]) => {
    try {
      window.umami?.track('Filters Applied', { filterCount, filters: activeFilters.join(',') })
    } catch (e) {
      console.debug('Analytics tracking failed:', e)
    }
  },

  // ============================================
  // 6. AUTHENTICATION
  // ============================================
  loginPageView: (referrer?: string) => {
    try {
      window.umami?.track('Login Page View', { referrer })
    } catch (e) {
      console.debug('Analytics tracking failed:', e)
    }
  },

  loginSuccess: (provider: string, userType: string) => {
    try {
      window.umami?.track('Login Success', { provider, userType })
    } catch (e) {
      console.debug('Analytics tracking failed:', e)
    }
  },

  loginFailed: (error: string, provider: string) => {
    try {
      window.umami?.track('Login Failed', { error, provider })
    } catch (e) {
      console.debug('Analytics tracking failed:', e)
    }
  },

  registerPageView: (type: 'client' | 'escort' | 'club') => {
    try {
      window.umami?.track('Register Page View', { type })
    } catch (e) {
      console.debug('Analytics tracking failed:', e)
    }
  },

  accountTypeSelected: (type: 'client' | 'escort' | 'club') => {
    try {
      window.umami?.track('Account Type Selected', { type })
    } catch (e) {
      console.debug('Analytics tracking failed:', e)
    }
  },

  registerStep1: (accountType: string) => {
    try {
      window.umami?.track('Register Step 1', { accountType })
    } catch (e) {
      console.debug('Analytics tracking failed:', e)
    }
  },

  registerStep2: (planType: string) => {
    try {
      window.umami?.track('Register Step 2', { planType })
    } catch (e) {
      console.debug('Analytics tracking failed:', e)
    }
  },

  registerStep3KYC: () => {
    try {
      window.umami?.track('Register Step 3 KYC')
    } catch (e) {
      console.debug('Analytics tracking failed:', e)
    }
  },

  registrationComplete: (accountType: string, plan: string) => {
    try {
      window.umami?.track('Registration Complete', { accountType, plan })
    } catch (e) {
      console.debug('Analytics tracking failed:', e)
    }
  },

  logout: () => {
    try {
      window.umami?.track('Logout')
    } catch (e) {
      console.debug('Analytics tracking failed:', e)
    }
  },

  // ============================================
  // 7. CONVERSIONS & PAYMENTS
  // ============================================
  upgradeClick: (currentPlan: string, targetPlan: string) => {
    try {
      window.umami?.track('Upgrade Click', { currentPlan, targetPlan })
    } catch (e) {
      console.debug('Analytics tracking failed:', e)
    }
  },

  checkoutStarted: (plan: string, price: number) => {
    try {
      window.umami?.track('Checkout Started', { plan, price })
    } catch (e) {
      console.debug('Analytics tracking failed:', e)
    }
  },

  paymentSuccess: (plan: string, amount: number, currency: string) => {
    try {
      window.umami?.track('Payment Success', { plan, amount, currency })
    } catch (e) {
      console.debug('Analytics tracking failed:', e)
    }
  },

  paymentFailed: (plan: string, error: string) => {
    try {
      window.umami?.track('Payment Failed', { plan, error })
    } catch (e) {
      console.debug('Analytics tracking failed:', e)
    }
  },

  creditsPurchased: (amount: number, price: number) => {
    try {
      window.umami?.track('Credits Purchased', { amount, price })
    } catch (e) {
      console.debug('Analytics tracking failed:', e)
    }
  },

  creditsUsed: (amount: number, purpose: string) => {
    try {
      window.umami?.track('Credits Used', { amount, purpose })
    } catch (e) {
      console.debug('Analytics tracking failed:', e)
    }
  },

  // ============================================
  // 8. DASHBOARD ESCORT
  // ============================================
  mediaUpload: (mediaType: 'IMAGE' | 'VIDEO', fileSize: number, visibility: string) => {
    try {
      window.umami?.track('Media Upload', { mediaType, fileSize, visibility })
    } catch (e) {
      console.debug('Analytics tracking failed:', e)
    }
  },

  mediaDelete: (mediaId: string, mediaType: 'IMAGE' | 'VIDEO') => {
    try {
      window.umami?.track('Media Delete', { mediaId, mediaType })
    } catch (e) {
      console.debug('Analytics tracking failed:', e)
    }
  },

  profileUpdate: (fieldsChanged: string[]) => {
    try {
      window.umami?.track('Profile Update', { fields: fieldsChanged.join(','), count: fieldsChanged.length })
    } catch (e) {
      console.debug('Analytics tracking failed:', e)
    }
  },

  profilePhotoUpload: () => {
    try {
      window.umami?.track('Profile Photo Upload')
    } catch (e) {
      console.debug('Analytics tracking failed:', e)
    }
  },

  scheduleUpdate: (availabilityType: string) => {
    try {
      window.umami?.track('Schedule Update', { availabilityType })
    } catch (e) {
      console.debug('Analytics tracking failed:', e)
    }
  },

  availabilityToggle: (availableNow: boolean) => {
    try {
      window.umami?.track('Availability Toggle', { availableNow })
    } catch (e) {
      console.debug('Analytics tracking failed:', e)
    }
  },

  statsDashboardView: (period: string) => {
    try {
      window.umami?.track('Stats Dashboard View', { period })
    } catch (e) {
      console.debug('Analytics tracking failed:', e)
    }
  },

  // ============================================
  // 9. MAP
  // ============================================
  mapOpened: (defaultView: string) => {
    try {
      window.umami?.track('Map Opened', { defaultView })
    } catch (e) {
      console.debug('Analytics tracking failed:', e)
    }
  },

  mapZoom: (zoomLevel: number, location?: string) => {
    try {
      window.umami?.track('Map Zoom', { zoomLevel, location })
    } catch (e) {
      console.debug('Analytics tracking failed:', e)
    }
  },

  mapMoved: (center: string, bounds: string) => {
    try {
      window.umami?.track('Map Moved', { center, bounds })
    } catch (e) {
      console.debug('Analytics tracking failed:', e)
    }
  },

  mapMarkerClick: (profileId: string, profileType: 'escort' | 'club') => {
    try {
      window.umami?.track('Map Marker Click', { profileId, profileType })
    } catch (e) {
      console.debug('Analytics tracking failed:', e)
    }
  },

  mapPopupOpen: (profileId: string) => {
    try {
      window.umami?.track('Map Popup Open', { profileId })
    } catch (e) {
      console.debug('Analytics tracking failed:', e)
    }
  },

  // ============================================
  // 10. ERRORS
  // ============================================
  loadError: (resource: string, errorCode: string) => {
    try {
      window.umami?.track('Load Error', { resource, errorCode })
    } catch (e) {
      console.debug('Analytics tracking failed:', e)
    }
  },

  videoError: (mediaId: string, errorCode: number, message: string) => {
    try {
      window.umami?.track('Video Error', { mediaId, errorCode, message })
    } catch (e) {
      console.debug('Analytics tracking failed:', e)
    }
  },

  apiError: (endpoint: string, statusCode: number, method: string) => {
    try {
      window.umami?.track('API Error', { endpoint, statusCode, method })
    } catch (e) {
      console.debug('Analytics tracking failed:', e)
    }
  },

  notFoundError: (requestedUrl: string) => {
    try {
      window.umami?.track('404 Error', { requestedUrl })
    } catch (e) {
      console.debug('Analytics tracking failed:', e)
    }
  },

  // ============================================
  // 11. ENGAGEMENT
  // ============================================
  commentPosted: (profileId: string, length: number) => {
    try {
      window.umami?.track('Comment Posted', { profileId, length })
    } catch (e) {
      console.debug('Analytics tracking failed:', e)
    }
  },

  commentReply: (parentId: string, profileId: string) => {
    try {
      window.umami?.track('Comment Reply', { parentId, profileId })
    } catch (e) {
      console.debug('Analytics tracking failed:', e)
    }
  },

  commentLike: (commentId: string) => {
    try {
      window.umami?.track('Comment Like', { commentId })
    } catch (e) {
      console.debug('Analytics tracking failed:', e)
    }
  },

  reportSubmitted: (targetType: string, targetId: string, reason: string) => {
    try {
      window.umami?.track('Report Submitted', { targetType, targetId, reason })
    } catch (e) {
      console.debug('Analytics tracking failed:', e)
    }
  },

  // ============================================
  // 12. PREFERENCES
  // ============================================
  languageChange: (from: string, to: string) => {
    try {
      window.umami?.track('Language Change', { from, to })
    } catch (e) {
      console.debug('Analytics tracking failed:', e)
    }
  },
}

// Export tracking utility
export default track
