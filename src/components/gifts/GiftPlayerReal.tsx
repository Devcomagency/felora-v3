'use client'

import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'

interface GiftPlayerRealProps {
  lottieUrl: string
  className?: string
  loop?: boolean
  autoplay?: boolean
  onComplete?: () => void
}

// Mapping des cadeaux vers de vraies animations
const REAL_ANIMATIONS: Record<string, string> = {
  'heart': '/lottie/starfish.json', // Animation complexe pour le coeur
  'diamond': '/lottie/star.json',   // Animation étoile pour le diamant
  'rose': '/lottie/starfish.json',  // Animation complexe pour la rose
  'fireworks': '/lottie/star.json', // Animation étoile pour les feux d'artifice
  'crown': '/lottie/star.json',     // Animation étoile pour la couronne
}

// Configurations visuelles par cadeau
const GIFT_CONFIGS = {
  heart: {
    filter: 'hue-rotate(330deg) saturate(1.5) brightness(1.2)',
    shadow: '0 0 30px rgba(255, 107, 157, 0.8)',
    background: 'radial-gradient(circle, rgba(255,107,157,0.3) 0%, rgba(255,20,147,0.1) 100%)'
  },
  diamond: {
    filter: 'hue-rotate(180deg) saturate(2) brightness(1.5)',
    shadow: '0 0 40px rgba(79, 209, 199, 0.9)',
    background: 'radial-gradient(circle, rgba(79,209,199,0.3) 0%, rgba(0,245,255,0.1) 100%)'
  },
  rose: {
    filter: 'hue-rotate(300deg) saturate(1.3) brightness(1.1)', 
    shadow: '0 0 35px rgba(236, 72, 153, 0.8)',
    background: 'radial-gradient(circle, rgba(236,72,153,0.3) 0%, rgba(219,39,119,0.1) 100%)'
  },
  fireworks: {
    filter: 'hue-rotate(240deg) saturate(1.8) brightness(1.4)',
    shadow: '0 0 50px rgba(147, 51, 234, 0.9)',
    background: 'radial-gradient(circle, rgba(147,51,234,0.3) 0%, rgba(124,58,237,0.1) 100%)'
  },
  crown: {
    filter: 'hue-rotate(45deg) saturate(1.6) brightness(1.3)',
    shadow: '0 0 45px rgba(251, 191, 36, 0.9)',
    background: 'radial-gradient(circle, rgba(251,191,36,0.3) 0%, rgba(245,158,11,0.1) 100%)'
  }
}

export function GiftPlayerReal({ 
  lottieUrl, 
  className = 'w-32 h-32', 
  loop = false, 
  autoplay = true, 
  onComplete 
}: GiftPlayerRealProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [useVideo, setUseVideo] = useState(false)
  
  const giftCode = lottieUrl.split('/').pop()?.replace('.json', '') || 'heart'
  const config = GIFT_CONFIGS[giftCode as keyof typeof GIFT_CONFIGS] || GIFT_CONFIGS.heart

  const triggerAnimation = () => {
    setIsPlaying(true)
    
    if (videoRef.current && useVideo) {
      videoRef.current.currentTime = 0
      videoRef.current.play()
    }
    
    setTimeout(() => {
      setIsPlaying(false)
      onComplete?.()
    }, 3000)
  }

  useEffect(() => {
    if (autoplay) {
      setTimeout(() => triggerAnimation(), 500)
    }
  }, [autoplay])

  // Alterner entre vidéo et animation CSS
  useEffect(() => {
    setUseVideo(Math.random() > 0.5) // 50% chance d'utiliser vidéo
  }, [giftCode])

  if (useVideo) {
    return (
      <div className={`${className} relative overflow-hidden cursor-pointer`} onClick={triggerAnimation}>
        {/* Arrière-plan animé */}
        <motion.div
          className="absolute inset-0 rounded-xl"
          style={{ background: config.background }}
          animate={isPlaying ? {
            opacity: [0.3, 0.7, 0.5],
            scale: [1, 1.05, 1]
          } : {}}
          transition={{ duration: 2, repeat: isPlaying ? Infinity : 0 }}
        />
        
        {/* Vidéo d'animation */}
        <video
          ref={videoRef}
          className="w-full h-full object-cover rounded-xl"
          style={{
            filter: config.filter,
            boxShadow: isPlaying ? config.shadow : 'none'
          }}
          muted
          playsInline
          onEnded={() => setIsPlaying(false)}
        >
          <source src="/vap.mp4" type="video/mp4" />
          <source src="/demo.mp4" type="video/mp4" />
        </video>
        
        {/* Overlay d'effets */}
        <motion.div
          className="absolute inset-0 pointer-events-none rounded-xl"
          animate={isPlaying ? {
            background: [
              'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.1) 0%, transparent 50%)',
              'radial-gradient(circle at 70% 70%, rgba(255,255,255,0.2) 0%, transparent 50%)',
              'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.1) 0%, transparent 50%)'
            ]
          } : {}}
          transition={{ duration: 1.5, repeat: isPlaying ? Infinity : 0 }}
        />
      </div>
    )
  }

  // Version avec animation Canvas/CSS avancée
  return (
    <div className={`${className} relative overflow-hidden cursor-pointer`} onClick={triggerAnimation}>
      {/* Background animé */}
      <motion.div
        className="absolute inset-0 rounded-xl"
        style={{ background: config.background }}
        animate={isPlaying ? {
          background: [
            config.background,
            config.background.replace('0.3', '0.6').replace('0.1', '0.3'),
            config.background
          ]
        } : {}}
        transition={{ duration: 2, repeat: isPlaying ? Infinity : 0 }}
      />

      {/* Animation principale avec Canvas effect */}
      <motion.div
        className="relative w-full h-full flex items-center justify-center"
        style={{
          boxShadow: isPlaying ? config.shadow : 'none'
        }}
        animate={isPlaying ? {
          scale: [1, 1.1, 1],
          rotate: [0, 5, 0],
          filter: [config.filter, `${config.filter} brightness(1.5)`, config.filter]
        } : {}}
        transition={{ duration: 2, repeat: isPlaying ? Infinity : 0 }}
      >
        {/* Simulation d'animation complexe avec formes géométriques */}
        <AnimatedShape giftCode={giftCode} isPlaying={isPlaying} />
      </motion.div>

      {/* Particles system */}
      {isPlaying && (
        <>
          {[...Array(15)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 rounded-full"
              style={{
                background: `hsl(${(i * 25) % 360}, 80%, 60%)`,
                left: `${50}%`,
                top: `${50}%`
              }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{
                scale: [0, 1.5, 0],
                opacity: [0, 1, 0],
                x: [0, (Math.cos(i * 24 * Math.PI / 180) * 60)],
                y: [0, (Math.sin(i * 24 * Math.PI / 180) * 60)]
              }}
              transition={{
                duration: 2,
                delay: i * 0.1,
                ease: "easeOut"
              }}
            />
          ))}
        </>
      )}
    </div>
  )
}

// Formes animées complexes
function AnimatedShape({ giftCode, isPlaying }: { giftCode: string, isPlaying: boolean }) {
  const shapes = {
    heart: (
      <svg width="50" height="50" viewBox="0 0 100 100" className="w-full h-full">
        <defs>
          <linearGradient id="heartGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FF6B9D" />
            <stop offset="100%" stopColor="#FF1744" />
          </linearGradient>
        </defs>
        <motion.path
          d="M50,25 C40,5 15,5 15,30 C15,55 50,80 50,80 C50,80 85,55 85,30 C85,5 60,5 50,25 Z"
          fill="url(#heartGrad2)"
          animate={isPlaying ? {
            scale: [1, 1.2, 1],
            fill: ['#FF6B9D', '#FF1744', '#FF6B9D']
          } : {}}
          transition={{ duration: 1.5, repeat: isPlaying ? Infinity : 0 }}
        />
      </svg>
    ),
    
    diamond: (
      <svg width="50" height="50" viewBox="0 0 100 100" className="w-full h-full">
        <defs>
          <linearGradient id="diamondGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#4FD1C7" />
            <stop offset="50%" stopColor="#00F5FF" />
            <stop offset="100%" stopColor="#7C3AED" />
          </linearGradient>
        </defs>
        <motion.polygon
          points="50,10 75,30 50,90 25,30"
          fill="url(#diamondGrad2)"
          animate={isPlaying ? {
            rotateY: [0, 360],
            scale: [1, 1.3, 1]
          } : {}}
          transition={{ duration: 2, repeat: isPlaying ? Infinity : 0 }}
        />
        {[0, 60, 120, 180, 240, 300].map((angle, i) => (
          <motion.line
            key={i}
            x1="50" y1="50" x2="50" y2="25"
            stroke="rgba(255,255,255,0.8)"
            strokeWidth="2"
            transform={`rotate(${angle} 50 50)`}
            animate={isPlaying ? {
              opacity: [0.3, 1, 0.3],
              strokeWidth: [1, 3, 1]
            } : {}}
            transition={{ 
              duration: 1, 
              repeat: isPlaying ? Infinity : 0,
              delay: i * 0.1
            }}
          />
        ))}
      </svg>
    )
  }

  return shapes[giftCode as keyof typeof shapes] || shapes.heart
}