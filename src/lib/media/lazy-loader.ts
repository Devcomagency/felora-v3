/**
 * Lazy Loader - Chargement paresseux des médias
 * Système de lazy loading pour améliorer les performances
 */

export interface LazyLoadConfig {
  rootMargin: string
  threshold: number
  enableIntersectionObserver: boolean
  placeholder: string
  errorPlaceholder: string
}

export interface LazyLoadItem {
  id: string
  src: string
  alt: string
  loaded: boolean
  error: boolean
  element?: HTMLElement
}

export class LazyLoader {
  private static instance: LazyLoader
  private config: LazyLoadConfig
  private observer: IntersectionObserver | null = null
  private items: Map<string, LazyLoadItem> = new Map()
  private loadedCount = 0
  private errorCount = 0

  private constructor() {
    this.config = {
      rootMargin: '50px',
      threshold: 0.1,
      enableIntersectionObserver: true,
      placeholder: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjYwMCIgdmlld0JveD0iMCAwIDQwMCA2MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iNjAwIiBmaWxsPSIjMzMzIi8+CjxwYXRoIGQ9Ik0yMDAgMzAwTDE1MCAyNTBMMjUwIDI1MEwyMDAgMzAwWiIgZmlsbD0iIzk5OSIvPgo8L3N2Zz4K',
      errorPlaceholder: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjYwMCIgdmlld0JveD0iMCAwIDQwMCA2MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iNjAwIiBmaWxsPSIjNjY2Ii8+Cjx0ZXh0IHg9IjIwMCIgeT0iMzAwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjOTk5IiBmb250LXNpemU9IjE0Ij5FcnJldXI8L3RleHQ+Cjwvc3ZnPgo='
    }
  }

  static getInstance(): LazyLoader {
    if (!LazyLoader.instance) {
      LazyLoader.instance = new LazyLoader()
    }
    return LazyLoader.instance
  }

  /**
   * Initialise le lazy loader
   */
  init(): void {
    if (!this.config.enableIntersectionObserver || typeof window === 'undefined') {
      return
    }

    this.observer = new IntersectionObserver(
      (entries) => this.handleIntersection(entries),
      {
        rootMargin: this.config.rootMargin,
        threshold: this.config.threshold
      }
    )
  }

  /**
   * Ajoute un élément à observer
   */
  observe(element: HTMLElement, item: LazyLoadItem): void {
    if (!this.observer) {
      this.loadImage(item)
      return
    }

    this.items.set(item.id, { ...item, element })
    this.observer.observe(element)
  }

  /**
   * Retire un élément de l'observation
   */
  unobserve(itemId: string): void {
    const item = this.items.get(itemId)
    if (item?.element && this.observer) {
      this.observer.unobserve(item.element)
    }
    this.items.delete(itemId)
  }

  /**
   * Gère l'intersection des éléments
   */
  private handleIntersection(entries: IntersectionObserverEntry[]): void {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const itemId = entry.target.getAttribute('data-lazy-id')
        if (itemId) {
          const item = this.items.get(itemId)
          if (item && !item.loaded) {
            this.loadImage(item)
            this.observer?.unobserve(entry.target)
          }
        }
      }
    })
  }

  /**
   * Charge une image
   */
  private async loadImage(item: LazyLoadItem): Promise<void> {
    try {
      const img = new Image()
      
      img.onload = () => {
        this.loadedCount++
        this.updateItem(item.id, { loaded: true, error: false })
        this.onImageLoaded(item)
      }
      
      img.onerror = () => {
        this.errorCount++
        this.updateItem(item.id, { loaded: true, error: true })
        this.onImageError(item)
      }
      
      img.src = item.src
    } catch (error) {
      console.error('Error loading image:', error)
      this.errorCount++
      this.updateItem(item.id, { loaded: true, error: true })
    }
  }

  /**
   * Met à jour un élément
   */
  private updateItem(id: string, updates: Partial<LazyLoadItem>): void {
    const item = this.items.get(id)
    if (item) {
      Object.assign(item, updates)
      this.items.set(id, item)
    }
  }

  /**
   * Callback appelé quand une image est chargée
   */
  private onImageLoaded(item: LazyLoadItem): void {
    if (item.element) {
      item.element.classList.add('lazy-loaded')
      item.element.classList.remove('lazy-loading')
    }
  }

  /**
   * Callback appelé quand une image échoue
   */
  private onImageError(item: LazyLoadItem): void {
    if (item.element) {
      item.element.classList.add('lazy-error')
      item.element.classList.remove('lazy-loading')
      
      // Remplacer par l'image d'erreur
      const img = item.element.querySelector('img')
      if (img) {
        img.src = this.config.errorPlaceholder
        img.alt = 'Erreur de chargement'
      }
    }
  }

  /**
   * Obtient les statistiques de chargement
   */
  getStats(): { total: number; loaded: number; errors: number; loading: number } {
    const total = this.items.size
    const loaded = this.loadedCount
    const errors = this.errorCount
    const loading = total - loaded

    return { total, loaded, errors, loading }
  }

  /**
   * Nettoie les ressources
   */
  cleanup(): void {
    if (this.observer) {
      this.observer.disconnect()
      this.observer = null
    }
    this.items.clear()
    this.loadedCount = 0
    this.errorCount = 0
  }

  /**
   * Met à jour la configuration
   */
  updateConfig(config: Partial<LazyLoadConfig>): void {
    this.config = { ...this.config, ...config }
    
    // Recréer l'observer si nécessaire
    if (this.observer) {
      this.cleanup()
      this.init()
    }
  }

  /**
   * Obtient la configuration actuelle
   */
  getConfig(): LazyLoadConfig {
    return { ...this.config }
  }
}

// Instance singleton
export const lazyLoader = LazyLoader.getInstance()

// Hook React pour le lazy loading
export function useLazyLoad() {
  const observe = (element: HTMLElement, item: LazyLoadItem) => {
    lazyLoader.observe(element, item)
  }

  const unobserve = (itemId: string) => {
    lazyLoader.unobserve(itemId)
  }

  const getStats = () => {
    return lazyLoader.getStats()
  }

  return { observe, unobserve, getStats }
}

// Fonction utilitaire pour créer un ID unique
export const createLazyId = (): string => {
  return `lazy-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}
