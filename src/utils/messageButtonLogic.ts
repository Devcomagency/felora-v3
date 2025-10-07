// Logique pour l'affichage et le comportement des boutons Message

export interface MessageButtonConfig {
  showButton: boolean
  onClick: () => void
  buttonText: string
  disabled?: boolean
}

export function getMessageButtonConfig(
  currentUser: any, // session.user
  targetProfile: any, // profil de l'escorte
  router: any
): MessageButtonConfig {
  // Si pas connecté → Afficher bouton mais rediriger vers login
  if (!currentUser) {
    return {
      showButton: true,
      buttonText: 'Message',
      onClick: () => {
        router.push('/login?redirect=' + encodeURIComponent(window.location.pathname))
      }
    }
  }

  const currentUserRole = currentUser.role?.toLowerCase()
  const targetUserRole = (targetProfile?.user?.role || 'escort')?.toLowerCase() // Par défaut escorte

  // Escortes entre elles → Masquer le bouton
  if (currentUserRole === 'escort' && targetUserRole === 'escort') {
    return {
      showButton: false,
      buttonText: '',
      onClick: () => {}
    }
  }

  // Clubs vers escortes → Masquer le bouton
  if (currentUserRole === 'club' && targetUserRole === 'escort') {
    return {
      showButton: false,
      buttonText: '',
      onClick: () => {}
    }
  }

  // Escortes vers clubs → Masquer le bouton
  if (currentUserRole === 'escort' && targetUserRole === 'club') {
    return {
      showButton: false,
      buttonText: '',
      onClick: () => {}
    }
  }

  // Clubs entre eux → Masquer le bouton
  if (currentUserRole === 'club' && targetUserRole === 'club') {
    return {
      showButton: false,
      buttonText: '',
      onClick: () => {}
    }
  }

  // Seuls les clients peuvent écrire aux escortes
  if (currentUserRole === 'client' && targetUserRole === 'escort') {
    return {
      showButton: true,
      buttonText: 'Message',
      onClick: () => {
        const targetUserId = targetProfile?.userId || targetProfile?.id
        if (targetUserId) {
          router.push(`/messages?to=${encodeURIComponent(targetUserId)}`)
        } else {
          router.push('/messages')
        }
      }
    }
  }

  // Par défaut, masquer le bouton
  return {
    showButton: false,
    buttonText: '',
    onClick: () => {}
  }
}
