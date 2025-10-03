/**
 * Utilitaires pour la gestion des médias
 */

export interface MediaUpdateData {
  visibility?: 'PUBLIC' | 'PRIVATE' | 'PREMIUM'
  price?: number
}

export interface MediaItem {
  id?: string
  type: 'image' | 'video'
  url: string
  visibility?: 'PUBLIC' | 'PRIVATE' | 'PREMIUM'
  price?: number
}

/**
 * Met à jour un média existant
 */
export async function updateMedia(mediaUrl: string, updates: MediaUpdateData): Promise<void> {
  try {
    // Pour l'instant, on utilise l'API de mise à jour du statut
    const response = await fetch('/api/escort/media/update-status', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        mediaUrl, // Utiliser l'URL comme identifiant temporaire
        isPrivate: updates.visibility === 'PRIVATE',
        price: updates.price
      })
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Erreur lors de la mise à jour')
    }

    const result = await response.json()
    if (!result.success) {
      throw new Error(result.error || 'Erreur lors de la mise à jour')
    }
  } catch (error) {
    console.error('Erreur updateMedia:', error)
    throw error
  }
}

/**
 * Supprime un média
 */
export async function deleteMedia(mediaUrl: string, mediaIndex: number): Promise<void> {
  try {
    // Utiliser l'API de suppression existante
    const response = await fetch('/api/escort/media/delete', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        mediaUrl, // Utiliser l'URL comme identifiant
        type: 'gallery' // Supposer que c'est de la galerie
      })
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Erreur lors de la suppression')
    }

    const result = await response.json()
    if (!result.success) {
      throw new Error(result.error || 'Erreur lors de la suppression')
    }
  } catch (error) {
    console.error('Erreur deleteMedia:', error)
    throw error
  }
}

/**
 * Met à jour un média avec gestion d'erreur améliorée
 */
export async function updateMediaWithErrorHandling(
  mediaUrl: string, 
  updates: MediaUpdateData
): Promise<{ success: boolean; error?: string }> {
  try {
    await updateMedia(mediaUrl, updates)
    return { success: true }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue'
    return { success: false, error: errorMessage }
  }
}

/**
 * Supprime un média avec gestion d'erreur améliorée
 */
export async function deleteMediaWithErrorHandling(
  mediaUrl: string, 
  mediaIndex: number
): Promise<{ success: boolean; error?: string }> {
  try {
    await deleteMedia(mediaUrl, mediaIndex)
    return { success: true }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue'
    return { success: false, error: errorMessage }
  }
}
