"use client"
import { 
  CheckCircle, 
  Check, 
  BadgeCheck, 
  ShieldCheck, 
  Shield, 
  Lock, 
  Key, 
  Crown, 
  Gem, 
  Award,
  AlertCircle,
  XCircle,
  Clock,
  Star,
  Heart,
  ThumbsUp,
  Eye,
  Flame,
  Zap,
  Play,
  Pause,
  Camera,
  Image,
  Video,
  MessageCircle,
  Send,
  Phone,
  Mail,
  Share2,
  Plus,
  Minus,
  ChevronRight,
  ChevronLeft,
  MoreHorizontal,
  Filter,
  Settings,
  Bell,
  Home,
  Search,
  MapPin,
  User,
  Menu,
  X,
  DollarSign,
  CreditCard,
  Wallet,
  Gift,
  ShoppingCart,
  Building,
  Calendar,
  Trophy,
  Medal,
  Target,
  Sparkles,
  Activity,
  Instagram,
  Twitter,
  Facebook,
  Linkedin
} from 'lucide-react'

export default function IconsDemoPage() {
  const iconCategories = [
    {
      title: "✅ VALIDATION & CONFIRMATION",
      icons: [
        { name: "CheckCircle", component: CheckCircle, description: "Cercle vert avec check" },
        { name: "Check", component: Check, description: "Check simple" },
        { name: "BadgeCheck", component: BadgeCheck, description: "Badge avec check" },
        { name: "ShieldCheck", component: ShieldCheck, description: "Bouclier avec check" },
        { name: "Shield", component: Shield, description: "Bouclier simple" },
        { name: "XCircle", component: XCircle, description: "Cercle rouge avec X" },
        { name: "AlertCircle", component: AlertCircle, description: "Cercle orange avec !" }
      ]
    },
    {
      title: "👤 PROFILS & STATUTS",
      icons: [
        { name: "Crown", component: Crown, description: "Couronne (Premium)" },
        { name: "Gem", component: Gem, description: "Gemme (Vérifié)" },
        { name: "Award", component: Award, description: "Récompense" },
        { name: "Lock", component: Lock, description: "Verrouillé" },
        { name: "Key", component: Key, description: "Clé (Accès)" }
      ]
    },
    {
      title: "❤️ INTERACTIONS & RÉACTIONS",
      icons: [
        { name: "Heart", component: Heart, description: "Cœur (Like)" },
        { name: "Star", component: Star, description: "Étoile (Rating)" },
        { name: "ThumbsUp", component: ThumbsUp, description: "Pouce levé" },
        { name: "Eye", component: Eye, description: "Œil (Vues)" },
        { name: "Flame", component: Flame, description: "Flamme (Hot)" },
        { name: "Zap", component: Zap, description: "Éclair (Super Like)" }
      ]
    },
    {
      title: "🎬 MÉDIA & CONTENU",
      icons: [
        { name: "Play", component: Play, description: "Lecture" },
        { name: "Pause", component: Pause, description: "Pause" },
        { name: "Camera", component: Camera, description: "Appareil photo" },
        { name: "Image", component: Image, description: "Image" },
        { name: "Video", component: Video, description: "Vidéo" }
      ]
    },
    {
      title: "💬 COMMUNICATION",
      icons: [
        { name: "MessageCircle", component: MessageCircle, description: "Message" },
        { name: "Send", component: Send, description: "Envoyer" },
        { name: "Phone", component: Phone, description: "Téléphone" },
        { name: "Mail", component: Mail, description: "Email" },
        { name: "Share2", component: Share2, description: "Partager" }
      ]
    },
    {
      title: "⚙️ INTERFACE & ACTIONS",
      icons: [
        { name: "Plus", component: Plus, description: "Ajouter" },
        { name: "Minus", component: Minus, description: "Supprimer" },
        { name: "ChevronRight", component: ChevronRight, description: "Flèche droite" },
        { name: "ChevronLeft", component: ChevronLeft, description: "Flèche gauche" },
        { name: "MoreHorizontal", component: MoreHorizontal, description: "Plus d'options" },
        { name: "Filter", component: Filter, description: "Filtres" },
        { name: "Settings", component: Settings, description: "Paramètres" },
        { name: "Bell", component: Bell, description: "Notifications" }
      ]
    },
    {
      title: "🏠 NAVIGATION",
      icons: [
        { name: "Home", component: Home, description: "Accueil" },
        { name: "Search", component: Search, description: "Recherche" },
        { name: "MapPin", component: MapPin, description: "Carte" },
        { name: "User", component: User, description: "Profil" },
        { name: "Menu", component: Menu, description: "Menu" },
        { name: "X", component: X, description: "Fermer" }
      ]
    },
    {
      title: "💰 PAIEMENT & PREMIUM",
      icons: [
        { name: "DollarSign", component: DollarSign, description: "Prix" },
        { name: "CreditCard", component: CreditCard, description: "Paiement" },
        { name: "Wallet", component: Wallet, description: "Portefeuille" },
        { name: "Gift", component: Gift, description: "Cadeau" },
        { name: "ShoppingCart", component: ShoppingCart, description: "Panier" }
      ]
    },
    {
      title: "🏢 GÉOLOCALISATION & INFOS",
      icons: [
        { name: "Building", component: Building, description: "Établissement" },
        { name: "Calendar", component: Calendar, description: "Calendrier" },
        { name: "Clock", component: Clock, description: "Horloge" }
      ]
    },
    {
      title: "🎮 GAMIFICATION & FUN",
      icons: [
        { name: "Trophy", component: Trophy, description: "Trophée" },
        { name: "Medal", component: Medal, description: "Médaille" },
        { name: "Target", component: Target, description: "Cible" },
        { name: "Sparkles", component: Sparkles, description: "Étincelles" },
        { name: "Activity", component: Activity, description: "Activité" }
      ]
    },
    {
      title: "📱 RÉSEAUX SOCIAUX",
      icons: [
        { name: "Instagram", component: Instagram, description: "Instagram" },
        { name: "Twitter", component: Twitter, description: "Twitter" },
        { name: "Facebook", component: Facebook, description: "Facebook" },
        { name: "Linkedin", component: Linkedin, description: "LinkedIn" }
      ]
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">
            🎨 FELORA ICONS DEMO
          </h1>
          <p className="text-white/70 text-lg">
            Toutes les icônes disponibles dans Felora V2
          </p>
        </div>

        {iconCategories.map((category, categoryIndex) => (
          <div key={categoryIndex} className="mb-12">
            <h2 className="text-2xl font-semibold text-white mb-6 border-b border-white/20 pb-2">
              {category.title}
            </h2>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              {category.icons.map((icon, iconIndex) => {
                const IconComponent = icon.component
                return (
                  <div 
                    key={iconIndex}
                    className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 hover:bg-white/20 transition-all duration-200 group"
                  >
                    <div className="flex flex-col items-center space-y-3">
                      <div className="p-3 bg-white/20 rounded-lg group-hover:bg-white/30 transition-colors">
                        <IconComponent size={32} className="text-white" />
                      </div>
                      <div className="text-center">
                        <div className="text-white font-medium text-sm mb-1">
                          {icon.name}
                        </div>
                        <div className="text-white/60 text-xs">
                          {icon.description}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ))}

        <div className="mt-16 p-8 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20">
          <h3 className="text-xl font-semibold text-white mb-4">
            💡 Comment utiliser ces icônes
          </h3>
          <div className="text-white/80 space-y-2">
            <p>• Importez l'icône depuis <code className="bg-white/20 px-2 py-1 rounded">lucide-react</code></p>
            <p>• Utilisez <code className="bg-white/20 px-2 py-1 rounded">size={16}</code> pour les petites icônes</p>
            <p>• Utilisez <code className="bg-white/20 px-2 py-1 rounded">size={24}</code> pour les icônes moyennes</p>
            <p>• Utilisez <code className="bg-white/20 px-2 py-1 rounded">size={32}</code> pour les grandes icônes</p>
            <p>• Ajoutez des classes Tailwind pour la couleur : <code className="bg-white/20 px-2 py-1 rounded">text-green-400</code></p>
          </div>
        </div>
      </div>
    </div>
  )
}
