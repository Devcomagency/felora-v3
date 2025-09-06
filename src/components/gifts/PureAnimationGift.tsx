'use client'

import { motion } from 'framer-motion'

interface PureAnimationGiftProps {
  giftType: 'heart' | 'diamond' | 'rose' | 'fireworks' | 'crown'
  className?: string
  isPlaying?: boolean
}

export function PureAnimationGift({ 
  giftType, 
  className = 'w-32 h-32',
  isPlaying = true 
}: PureAnimationGiftProps) {

  const animations = {
    heart: (
      <div className={`${className} relative flex items-center justify-center`}>
        {/* Background glow */}
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(255,107,157,0.4) 0%, rgba(255,20,147,0.1) 70%, transparent 100%)'
          }}
          animate={isPlaying ? {
            scale: [1, 1.3, 1],
            opacity: [0.6, 1, 0.6]
          } : {}}
          transition={{ duration: 2, repeat: Infinity }}
        />
        
        {/* Main heart */}
        <motion.div
          className="relative"
          animate={isPlaying ? {
            scale: [1, 1.2, 1],
            rotate: [0, -5, 5, 0]
          } : {}}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <svg width="60" height="60" viewBox="0 0 100 100" className="drop-shadow-lg">
            <defs>
              <linearGradient id="heartGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FF6B9D" />
                <stop offset="50%" stopColor="#FF1744" />
                <stop offset="100%" stopColor="#E91E63" />
              </linearGradient>
            </defs>
            <motion.path
              d="M50,25 C40,5 15,5 15,30 C15,55 50,80 50,80 C50,80 85,55 85,30 C85,5 60,5 50,25 Z"
              fill="url(#heartGrad)"
              animate={isPlaying ? {
                scale: [1, 1.1, 1]
              } : {}}
              transition={{ duration: 1.2, repeat: Infinity, delay: 0.2 }}
            />
          </svg>
        </motion.div>

        {/* Floating hearts */}
        {isPlaying && [...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute text-pink-400"
            style={{ fontSize: '12px' }}
            initial={{ 
              x: 0, 
              y: 0, 
              opacity: 0,
              scale: 0
            }}
            animate={{
              x: [0, (Math.cos(i * 60 * Math.PI / 180) * 40)],
              y: [0, (Math.sin(i * 60 * Math.PI / 180) * 40)],
              opacity: [0, 1, 0],
              scale: [0, 1, 0]
            }}
            transition={{
              duration: 2,
              delay: i * 0.3,
              repeat: Infinity,
              ease: "easeOut"
            }}
          >
            ♥
          </motion.div>
        ))}
      </div>
    ),

    diamond: (
      <div className={`${className} relative flex items-center justify-center`}>
        {/* Background sparkle */}
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(79,209,199,0.4) 0%, rgba(0,245,255,0.2) 70%, transparent 100%)'
          }}
          animate={isPlaying ? {
            scale: [1, 1.4, 1],
            rotate: [0, 180, 360]
          } : {}}
          transition={{ duration: 3, repeat: Infinity }}
        />

        {/* Main diamond */}
        <motion.div
          animate={isPlaying ? {
            rotateY: [0, 360],
            scale: [1, 1.3, 1]
          } : {}}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <svg width="60" height="60" viewBox="0 0 100 100" className="drop-shadow-xl">
            <defs>
              <linearGradient id="diamondGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#4FD1C7" />
                <stop offset="50%" stopColor="#00F5FF" />
                <stop offset="100%" stopColor="#7C3AED" />
              </linearGradient>
            </defs>
            <motion.polygon
              points="50,10 75,30 50,90 25,30"
              fill="url(#diamondGrad)"
              animate={isPlaying ? {
                opacity: [0.8, 1, 0.8]
              } : {}}
              transition={{ duration: 1, repeat: Infinity }}
            />
            <motion.polygon
              points="50,10 62.5,20 50,35 37.5,20"
              fill="rgba(255,255,255,0.6)"
              animate={isPlaying ? {
                opacity: [0.6, 1, 0.6]
              } : {}}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          </svg>
        </motion.div>

        {/* Sparkles */}
        {isPlaying && [...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute text-cyan-300"
            style={{ fontSize: '16px' }}
            initial={{ 
              x: 0, 
              y: 0, 
              opacity: 0,
              rotate: 0
            }}
            animate={{
              x: [0, (Math.cos(i * 45 * Math.PI / 180) * 50)],
              y: [0, (Math.sin(i * 45 * Math.PI / 180) * 50)],
              opacity: [0, 1, 0],
              rotate: [0, 360]
            }}
            transition={{
              duration: 1.5,
              delay: i * 0.1,
              repeat: Infinity,
              ease: "easeOut"
            }}
          >
            ✦
          </motion.div>
        ))}
      </div>
    ),

    rose: (
      <div className={`${className} relative flex items-center justify-center`}>
        {/* Background glow */}
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(236,72,153,0.3) 0%, rgba(219,39,119,0.1) 100%)'
          }}
          animate={isPlaying ? {
            scale: [1, 1.2, 1],
            opacity: [0.5, 0.8, 0.5]
          } : {}}
          transition={{ duration: 2.5, repeat: Infinity }}
        />

        {/* Main rose */}
        <motion.div
          animate={isPlaying ? {
            scale: [1, 1.1, 1],
            rotate: [0, 5, -5, 0]
          } : {}}
          transition={{ duration: 3, repeat: Infinity }}
        >
          <svg width="60" height="60" viewBox="0 0 100 100" className="drop-shadow-lg">
            <defs>
              <radialGradient id="roseGrad" cx="50%" cy="30%">
                <stop offset="0%" stopColor="#EC4899" />
                <stop offset="50%" stopColor="#DB2777" />
                <stop offset="100%" stopColor="#BE185D" />
              </radialGradient>
            </defs>
            {/* Rose petals */}
            {[0, 60, 120, 180, 240, 300].map((angle, i) => (
              <motion.ellipse
                key={i}
                cx="50"
                cy="40"
                rx="8"
                ry="15"
                fill="url(#roseGrad)"
                transform={`rotate(${angle} 50 40)`}
                animate={isPlaying ? {
                  rx: [8, 10, 8],
                  ry: [15, 18, 15]
                } : {}}
                transition={{ 
                  duration: 2, 
                  repeat: Infinity, 
                  delay: i * 0.1 
                }}
              />
            ))}
            {/* Center */}
            <circle cx="50" cy="40" r="6" fill="#F472B6" />
            {/* Stem */}
            <rect x="48" y="55" width="4" height="35" fill="#16A34A" />
            {/* Leaves */}
            <motion.ellipse
              cx="45"
              cy="70"
              rx="6"
              ry="3"
              fill="#22C55E"
              animate={isPlaying ? {
                rx: [6, 7, 6]
              } : {}}
              transition={{ duration: 2.5, repeat: Infinity }}
            />
          </svg>
        </motion.div>

        {/* Floating petals */}
        {isPlaying && [...Array(4)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute"
            style={{ 
              color: '#EC4899',
              fontSize: '14px'
            }}
            initial={{ 
              x: 0, 
              y: 0, 
              opacity: 0,
              rotate: 0
            }}
            animate={{
              x: [0, (Math.random() - 0.5) * 80],
              y: [0, -60],
              opacity: [0, 0.8, 0],
              rotate: [0, 360]
            }}
            transition={{
              duration: 3,
              delay: i * 0.5,
              repeat: Infinity,
              ease: "easeOut"
            }}
          >
            🌸
          </motion.div>
        ))}
      </div>
    ),

    fireworks: (
      <div className={`${className} relative flex items-center justify-center overflow-hidden`}>
        {/* Main explosion */}
        <motion.div
          className="absolute inset-0"
          animate={isPlaying ? {
            scale: [0, 1.5, 0],
            opacity: [0, 1, 0]
          } : {}}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div 
            className="w-full h-full rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(147,51,234,0.8) 0%, rgba(124,58,237,0.4) 50%, transparent 70%)'
            }}
          />
        </motion.div>

        {/* Firework particles */}
        {isPlaying && [...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full"
            style={{
              background: `hsl(${(i * 18) % 360}, 80%, 60%)`,
              left: '50%',
              top: '50%'
            }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{
              scale: [0, 2, 0],
              opacity: [0, 1, 0],
              x: [0, (Math.cos(i * 18 * Math.PI / 180) * 60)],
              y: [0, (Math.sin(i * 18 * Math.PI / 180) * 60)]
            }}
            transition={{
              duration: 1.5,
              delay: i * 0.1,
              repeat: Infinity,
              ease: "easeOut"
            }}
          />
        ))}

        {/* Secondary explosions */}
        {isPlaying && [...Array(3)].map((_, i) => (
          <motion.div
            key={`second-${i}`}
            className="absolute"
            style={{
              left: `${30 + i * 20}%`,
              top: `${40 + i * 10}%`
            }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{
              scale: [0, 1, 0],
              opacity: [0, 0.8, 0]
            }}
            transition={{
              duration: 1,
              delay: 0.5 + i * 0.3,
              repeat: Infinity,
              ease: "easeOut"
            }}
          >
            <div 
              className="w-8 h-8 rounded-full"
              style={{
                background: `radial-gradient(circle, hsl(${i * 120}, 70%, 60%) 0%, transparent 70%)`
              }}
            />
          </motion.div>
        ))}
      </div>
    ),

    crown: (
      <div className={`${className} relative flex items-center justify-center`}>
        {/* Background glow */}
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(251,191,36,0.4) 0%, rgba(245,158,11,0.2) 70%, transparent 100%)'
          }}
          animate={isPlaying ? {
            scale: [1, 1.3, 1],
            opacity: [0.6, 1, 0.6]
          } : {}}
          transition={{ duration: 2, repeat: Infinity }}
        />

        {/* Main crown */}
        <motion.div
          animate={isPlaying ? {
            scale: [1, 1.1, 1],
            rotate: [0, 2, -2, 0]
          } : {}}
          transition={{ duration: 2.5, repeat: Infinity }}
        >
          <svg width="60" height="60" viewBox="0 0 100 100" className="drop-shadow-lg">
            <defs>
              <linearGradient id="crownGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FbbF24" />
                <stop offset="50%" stopColor="#F59E0B" />
                <stop offset="100%" stopColor="#D97706" />
              </linearGradient>
            </defs>
            {/* Crown base */}
            <motion.rect
              x="20" y="60" width="60" height="15" rx="3"
              fill="url(#crownGrad)"
              animate={isPlaying ? {
                y: [60, 58, 60]
              } : {}}
              transition={{ duration: 2, repeat: Infinity }}
            />
            {/* Crown peaks */}
            <motion.polygon
              points="20,60 30,40 40,50 50,30 60,50 70,40 80,60"
              fill="url(#crownGrad)"
              animate={isPlaying ? {
                scale: [1, 1.05, 1]
              } : {}}
              transition={{ duration: 2, repeat: Infinity }}
            />
            {/* Gems */}
            <circle cx="35" cy="50" r="3" fill="#EF4444" />
            <circle cx="50" cy="40" r="4" fill="#3B82F6" />
            <circle cx="65" cy="50" r="3" fill="#10B981" />
          </svg>
        </motion.div>

        {/* Floating confetti */}
        {isPlaying && [...Array(10)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 rounded-full"
            style={{
              background: `hsl(${(i * 36) % 360}, 70%, 60%)`,
              left: '50%',
              top: '20%'
            }}
            initial={{ y: 0, opacity: 0, scale: 0 }}
            animate={{
              y: [0, -40],
              x: [(Math.random() - 0.5) * 20, (Math.random() - 0.5) * 60],
              opacity: [0, 1, 0],
              scale: [0, 1, 0],
              rotate: [0, 360]
            }}
            transition={{
              duration: 2,
              delay: i * 0.2,
              repeat: Infinity,
              ease: "easeOut"
            }}
          />
        ))}
      </div>
    )
  }

  return animations[giftType]
}