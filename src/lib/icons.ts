// 🎯 ICÔNES FELORA VALIDÉES - Centralisées pour toute l'application

import {
  // Navigation Principale
  Home,
  Search,
  MapPin,
  User,
  Menu,
  X,
  Settings,
  Bell,
  
  // Profils & Utilisateurs
  Crown,
  Gem,
  BadgeCheck,
  Shield,
  Award,
  Users,
  
  // Communication & Social
  MessageCircle,
  Send,
  Phone,
  Video,
  Mail,
  Share2,
  
  // Interactions & Réactions
  Heart,
  Star,
  ThumbsUp,
  Eye,
  Flame,
  Zap,
  
  // Média & Contenu
  Play,
  Pause,
  Volume2,
  VolumeX,
  Camera,
  Image,
  Film,
  
  // Géolocalisation & Infos
  Building,
  Clock,
  Calendar,
  
  // Paiement & Premium
  DollarSign,
  CreditCard,
  Wallet,
  Gift,
  ShoppingCart,
  
  // Interface & Actions
  Plus,
  Minus,
  Check,
  ChevronRight,
  ChevronLeft,
  MoreHorizontal,
  Filter,
  
  // Sécurité & Confidentialité
  Lock,
  Unlock,
  Key,
  ShieldCheck,
  
  // Réseaux Sociaux
  Instagram,
  Twitter,
  Facebook,
  Linkedin,
  
  // Gamification & Fun
  Trophy,
  Medal,
  Target,
  Sparkles,
  
  // Stats & Analytics
  Activity
} from 'lucide-react'

// 🏠 NAVIGATION PRINCIPALE
export const NavigationIcons = {
  home: Home,           // #83 - Accueil feed (Bottom nav)
  search: Search,       // #85 - Page recherche (Bottom nav)  
  map: MapPin,          // #118 - Page carte (Bottom nav)
  profile: User,        // #90 - Profil utilisateur (Bottom nav)
  menu: Menu,           // #87 - Menu hamburger (Header)
  close: X,             // #88 - Fermer menu/modal (Header)
  settings: Settings,   // #89 - Paramètres (Header)
  notifications: Bell   // #99 - Notifications (Header)
}

// 👤 PROFILS & UTILISATEURS
export const ProfileIcons = {
  premium: Crown,       // #71 - Profil premium (ProfileCard, Feed)
  verified: Gem,        // #72 - Profil vérifié (ProfileCard)
  certified: BadgeCheck, // #81 - Compte vérifié (Profile)
  security: Shield,     // #79 - Sécurité/Protection (Profile)  
  rewards: Award,       // #76 - Récompenses (Profile)
  salon: Users          // #163 - Salon (plusieurs escort) (SalonCard)
}

// 💬 COMMUNICATION & SOCIAL
export const CommunicationIcons = {
  chat: MessageCircle,  // #97 - Chat/Messages (Profile, Feed)
  send: Send,           // #98 - Envoyer message (Chat)
  phone: Phone,         // #95 - Appel téléphone (Profile)
  videoCall: Video,     // #101 - Appel vidéo (Profile, Chat)
  email: Mail,          // #96 - Email contact (Profile)
  share: Share2         // #100 - Partager profil (Profile, Feed)
}

// ❤️ INTERACTIONS & RÉACTIONS  
export const InteractionIcons = {
  like: Heart,          // #73 - Like/Favoris (Feed, Profile)
  rating: Star,         // #74 - Note/Rating (Profile, Reviews)
  thumbsUp: ThumbsUp,   // #110 - J'aime (Feed, Comments)
  views: Eye,           // #109 - Vues profil (Profile stats)
  hot: Flame,           // #120 - Contenu hot (Feed)
  superLike: Zap        // #121 - Super like (Feed)
}

// 🎬 MÉDIA & CONTENU
export const MediaIcons = {
  play: Play,           // #103 - Lecture vidéo (VideoFeed)
  pause: Pause,         // #104 - Pause vidéo (VideoFeed)
  volumeOn: Volume2,    // #112 - Son activé (VideoFeed)
  volumeOff: VolumeX,   // #113 - Son coupé (VideoFeed)
  camera: Camera,       // #102 - Appareil photo (Upload)
  image: Image,         // #140 - Images/Photos (Gallery)
  video: Film           // #141 - Vidéos (Gallery)
}

// 🗺️ GÉOLOCALISATION & INFOS
export const LocationIcons = {
  location: MapPin,     // #118 - Localisation (Profile, Map)
  establishment: Building, // #162 - Salon/Établissement (SalonProfile)
  hours: Clock,         // #116 - Horaires (Profile)
  availability: Calendar // #115 - Disponibilités (Profile)
}

// 💰 PAIEMENT & PREMIUM
export const PaymentIcons = {
  price: DollarSign,    // #117 - Tarifs/Prix (Profile)
  payment: CreditCard,  // #160 - Paiement (Checkout)
  wallet: Wallet,       // #161 - Portefeuille (Profile)
  gifts: Gift,          // #75 - Cadeaux virtuels (Chat)
  cart: ShoppingCart    // #158 - Panier services (Profile)
}

// ⚙️ INTERFACE & ACTIONS
export const InterfaceIcons = {
  add: Plus,            // #105 - Ajouter/Créer (Interface)
  remove: Minus,        // #106 - Supprimer/Réduire (Interface)
  confirm: Check,       // #107 - Valider/Confirmer (Forms)
  cancel: X,            // #88 - Fermer/Annuler (Modals)
  next: ChevronRight,   // #93 - Suivant/Droite (Navigation)
  previous: ChevronLeft, // #94 - Précédent/Gauche (Navigation)
  moreOptions: MoreHorizontal, // #114 - Plus d'options (Profile)
  filter: Filter        // #86 - Filtres (Search)
}

// 🔒 SÉCURITÉ & CONFIDENTIALITÉ
export const SecurityIcons = {
  private: Lock,        // #124 - Contenu privé (Profile)
  public: Unlock,       // #125 - Contenu public (Profile)
  premium: Key,         // #126 - Accès premium (Profile)
  protection: Shield,   // #79 - Protection/Sécurité (Profile)
  secured: ShieldCheck  // #80 - Vérifié sécurisé (Profile)
}

// 📱 RÉSEAUX SOCIAUX
export const SocialIcons = {
  instagram: Instagram, // #170 - Lien Instagram (Profile)
  twitter: Twitter,     // #171 - Partage Twitter (Share)
  facebook: Facebook,   // #169 - Partage Facebook (Share)
  linkedin: Linkedin    // #173 - Profil pro (Profile)
}

// 🎮 GAMIFICATION & FUN
export const GamificationIcons = {
  topRank: Trophy,      // #77 - Top escort (Leaderboard)
  achievement: Medal,   // #78 - Récompenses (Achievements)
  target: Target,       // #123 - Objectifs (Dashboard)
  special: Sparkles     // #122 - Effets spéciaux (Feed)
}

// 📊 STATS & ANALYTICS
export const StatsIcons = {
  analytics: Activity   // #119 - Statistiques (Dashboard)
}

// 🎯 EXPORT GLOBAL - Toutes les icônes FELORA
export const FeloraIcons = {
  navigation: NavigationIcons,
  profile: ProfileIcons,
  communication: CommunicationIcons,
  interaction: InteractionIcons,
  media: MediaIcons,
  location: LocationIcons,
  payment: PaymentIcons,
  interface: InterfaceIcons,
  security: SecurityIcons,
  social: SocialIcons,
  gamification: GamificationIcons,
  stats: StatsIcons
}

// 📋 TYPES pour TypeScript
export type NavigationIconKey = keyof typeof NavigationIcons
export type ProfileIconKey = keyof typeof ProfileIcons  
export type CommunicationIconKey = keyof typeof CommunicationIcons
export type InteractionIconKey = keyof typeof InteractionIcons
export type MediaIconKey = keyof typeof MediaIcons
export type LocationIconKey = keyof typeof LocationIcons
export type PaymentIconKey = keyof typeof PaymentIcons
export type InterfaceIconKey = keyof typeof InterfaceIcons
export type SecurityIconKey = keyof typeof SecurityIcons
export type SocialIconKey = keyof typeof SocialIcons
export type GamificationIconKey = keyof typeof GamificationIcons
export type StatsIconKey = keyof typeof StatsIcons

export type FeloraIconCategory = keyof typeof FeloraIcons

// 🔧 UTILITAIRES
export const getIcon = (category: FeloraIconCategory, iconKey: string) => {
  return FeloraIcons[category][iconKey as keyof typeof FeloraIcons[typeof category]]
}

// 📊 STATISTIQUES
export const FELORA_ICONS_COUNT = {
  navigation: Object.keys(NavigationIcons).length,        // 8 icônes
  profile: Object.keys(ProfileIcons).length,              // 6 icônes  
  communication: Object.keys(CommunicationIcons).length,  // 6 icônes
  interaction: Object.keys(InteractionIcons).length,      // 6 icônes
  media: Object.keys(MediaIcons).length,                  // 7 icônes
  location: Object.keys(LocationIcons).length,            // 4 icônes
  payment: Object.keys(PaymentIcons).length,              // 5 icônes
  interface: Object.keys(InterfaceIcons).length,          // 8 icônes
  security: Object.keys(SecurityIcons).length,            // 5 icônes
  social: Object.keys(SocialIcons).length,                // 4 icônes
  gamification: Object.keys(GamificationIcons).length,    // 4 icônes
  stats: Object.keys(StatsIcons).length,                  // 1 icône
  total: 64 // Total final validé
}