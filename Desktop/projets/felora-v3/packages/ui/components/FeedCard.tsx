import { Heart, MessageCircle, Share, Crown, Diamond, Flame } from 'lucide-react'
import type { MediaItem } from '../../core/services/media'

interface FeedCardProps {
  item: MediaItem
  onLike?: (itemId: string) => void
  onMessage?: (itemId: string) => void
  onShare?: (item: MediaItem) => void
}

export default function FeedCard({ item, onLike, onMessage, onShare }: FeedCardProps) {
  return (
    <div className="relative h-dvh w-full overflow-hidden">
      {/* Media Background */}
      <div className="absolute inset-0">
        {item.type === 'VIDEO' ? (
          <video
            className="w-full h-full object-cover"
            autoPlay
            loop
            muted
            playsInline
            poster={item.thumb}
          >
            <source src={item.url} type="video/mp4" />
          </video>
        ) : (
          <div 
            className="w-full h-full bg-cover bg-center"
            style={{ 
              backgroundImage: `url(${item.url})`,
              backgroundColor: '#1a1a1a'
            }}
          />
        )}
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20" />
      </div>

      {/* Content Overlay */}
      <div className="relative z-10 flex h-full">
        {/* Profile Info - Left */}
        <div className="flex-1 flex flex-col justify-end p-6 pb-32">
          <div className="space-y-4">
            {/* Author Info */}
            <div className="flex items-center gap-3">
              <div>
                <h2 className="text-2xl font-bold text-white">
                  {item.author.name}
                </h2>
                <p className="text-sm text-white/70">
                  {item.author.handle}
                </p>
              </div>
              <Crown className="w-6 h-6 text-[#FF6B9D]" />
              <Diamond className="w-5 h-5 text-[#4FD1C7]" />
            </div>

            {/* Stats */}
            <div className="space-y-2 text-white/90">
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Heart className="w-4 h-4 text-[#FF6B9D]" />
                  <span>{item.likeCount.toLocaleString()} likes</span>
                </div>
                <div className="flex items-center gap-2">
                  <MessageCircle className="w-4 h-4 text-white/70" />
                  <span>{item.reactCount.toLocaleString()}</span>
                </div>
              </div>
              
              <div className="flex items-center gap-3 text-xs">
                <span className="text-white/60">
                  {new Date(item.createdAt).toLocaleDateString('fr-FR', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
                <span className="text-[#4FD1C7] font-semibold">
                  • {item.type === 'VIDEO' ? 'Vidéo' : 'Photo'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Actions - Right */}
        <div className="flex flex-col items-center justify-end gap-6 p-6 pb-32">
          {/* Avatar */}
          <div className="relative">
            <div className="w-14 h-14 rounded-full border-2 border-white overflow-hidden bg-gray-800">
              <div 
                className="w-full h-full bg-cover bg-center"
                style={{ backgroundImage: `url(${item.author.avatar || item.url})` }}
              />
            </div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-black" />
          </div>

          {/* Like Button */}
          <div className="flex flex-col items-center gap-2">
            <button
              onClick={() => onLike?.(item.id)}
              className="p-3 rounded-full backdrop-blur-sm transition-all duration-200 bg-white/10 text-white hover:bg-[#FF6B9D]/20 hover:text-[#FF6B9D]"
            >
              <Heart className="w-6 h-6" />
            </button>
            <span className="text-xs text-white font-medium">
              {item.likeCount.toLocaleString()}
            </span>
          </div>

          {/* Message Button */}
          <div className="flex flex-col items-center gap-2">
            <button 
              onClick={() => onMessage?.(item.id)}
              className="p-3 rounded-full bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 transition-all duration-200"
            >
              <MessageCircle className="w-6 h-6" />
            </button>
            <span className="text-xs text-white font-medium">Message</span>
          </div>

          {/* Share Button */}
          <div className="flex flex-col items-center gap-2">
            <button
              onClick={() => onShare?.(item)}
              className="p-3 rounded-full bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 transition-all duration-200"
            >
              <Share className="w-6 h-6" />
            </button>
            <span className="text-xs text-white font-medium">Partager</span>
          </div>

          {/* Media Type Icon */}
          <div className="flex flex-col items-center gap-2 mt-4">
            <Flame className="w-6 h-6 text-[#FF6B9D]" />
            <span className="text-xs text-white/80 text-center">
              {item.type === 'VIDEO' ? 'Vidéo' : 'Photo'}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
