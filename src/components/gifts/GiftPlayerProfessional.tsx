'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface GiftPlayerProfessionalProps {
  lottieUrl: string
  className?: string
  loop?: boolean
  autoplay?: boolean
  onComplete?: () => void
}

export function GiftPlayerProfessional({ 
  lottieUrl, 
  className = 'w-32 h-32', 
  loop = false, 
  autoplay = true, 
  onComplete 
}: GiftPlayerProfessionalProps) {
  const [isPlaying, setIsPlaying] = useState(autoplay)
  const [phase, setPhase] = useState<'idle' | 'building' | 'exploding' | 'done'>('idle')
  const giftCode = lottieUrl.split('/').pop()?.replace('.json', '') || 'heart'

  const triggerAnimation = () => {
    setIsPlaying(true)
    setPhase('building')
    
    setTimeout(() => setPhase('exploding'), 1000)
    setTimeout(() => {
      setPhase('done')
      setIsPlaying(false)
      onComplete?.()
    }, 3000)
  }

  useEffect(() => {
    if (autoplay) {
      setTimeout(() => triggerAnimation(), 500)
    }
  }, [autoplay])

  return (
    <div className={`${className} relative overflow-hidden cursor-pointer`} onClick={triggerAnimation}>
      {/* Arrière-plan avec gradient animé */}
      <motion.div
        className="absolute inset-0 rounded-xl"
        animate={{
          background: isPlaying 
            ? [
                'linear-gradient(45deg, #FF6B9D, #B794F6)',
                'linear-gradient(90deg, #4FD1C7, #7C3AED)', 
                'linear-gradient(135deg, #00F5FF, #FF6B9D)',
                'linear-gradient(180deg, #B794F6, #4FD1C7)'
              ]
            : ['linear-gradient(45deg, rgba(255,107,157,0.2), rgba(183,148,246,0.2))']
        }}
        transition={{ duration: 2, repeat: isPlaying ? Infinity : 0 }}
      />

      {/* Conteneur principal */}
      <div className="relative w-full h-full flex items-center justify-center">
        {renderGiftAnimation(giftCode, phase, isPlaying)}
      </div>

      {/* Système de particules complexe */}
      <AnimatePresence>
        {isPlaying && <ParticleSystem phase={phase} />}
      </AnimatePresence>

      {/* Effet de lumière périphérique */}
      <AnimatePresence>
        {isPlaying && (
          <motion.div
            className="absolute inset-0 rounded-xl"
            style={{
              boxShadow: '0 0 50px rgba(255, 107, 157, 0.5), inset 0 0 50px rgba(255, 255, 255, 0.1)'
            }}
            animate={{
              boxShadow: [
                '0 0 20px rgba(255, 107, 157, 0.3)',
                '0 0 80px rgba(79, 209, 199, 0.8)', 
                '0 0 60px rgba(183, 148, 246, 0.6)',
                '0 0 40px rgba(255, 107, 157, 0.4)'
              ]
            }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

// Animations spécifiques par cadeau avec SVG
function renderGiftAnimation(giftCode: string, phase: string, isPlaying: boolean) {
  switch (giftCode) {
    case 'heart':
      return <HeartAnimation phase={phase} isPlaying={isPlaying} />
    case 'diamond':
      return <DiamondAnimation phase={phase} isPlaying={isPlaying} />
    case 'rose':
      return <RoseAnimation phase={phase} isPlaying={isPlaying} />
    case 'fireworks':
      return <FireworksAnimation phase={phase} isPlaying={isPlaying} />
    case 'crown':
      return <CrownAnimation phase={phase} isPlaying={isPlaying} />
    default:
      return <HeartAnimation phase={phase} isPlaying={isPlaying} />
  }
}

// Animation Coeur avec SVG
function HeartAnimation({ phase, isPlaying }: { phase: string, isPlaying: boolean }) {
  return (
    <motion.svg
      width="60"
      height="60" 
      viewBox="0 0 100 100"
      className="z-10"
      animate={phase === 'building' ? {
        scale: [0, 1.2, 1],
        rotate: [0, 10, 0]
      } : phase === 'exploding' ? {
        scale: [1, 1.5, 1.2],
        rotate: [0, 360],
        filter: ['hue-rotate(0deg)', 'hue-rotate(180deg)', 'hue-rotate(360deg)']
      } : {}}
      transition={{ duration: phase === 'building' ? 1 : 2, ease: "easeInOut" }}
    >
      <defs>
        <radialGradient id="heartGrad" cx="50%" cy="50%">
          <stop offset="0%" stopColor="#FF6B9D" stopOpacity="1" />
          <stop offset="70%" stopColor="#FF1744" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#880E4F" stopOpacity="0.6" />
        </radialGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
          <feMerge> 
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      
      <motion.path
        d="M50,20 C40,5 20,5 20,25 C20,45 50,75 50,75 C50,75 80,45 80,25 C80,5 60,5 50,20 Z"
        fill="url(#heartGrad)"
        filter="url(#glow)"
        animate={isPlaying ? {
          d: [
            "M50,20 C40,5 20,5 20,25 C20,45 50,75 50,75 C50,75 80,45 80,25 C80,5 60,5 50,20 Z",
            "M50,15 C35,0 15,0 15,30 C15,50 50,80 50,80 C50,80 85,50 85,30 C85,0 65,0 50,15 Z",
            "M50,20 C40,5 20,5 20,25 C20,45 50,75 50,75 C50,75 80,45 80,25 C80,5 60,5 50,20 Z"
          ]
        } : {}}
        transition={{ duration: 1.5, repeat: isPlaying ? Infinity : 0 }}
      />
      
      {/* Pulsation interne */}
      <motion.circle
        cx="50" cy="45" r="8"
        fill="rgba(255, 255, 255, 0.8)"
        animate={isPlaying ? {
          r: [5, 15, 8],
          opacity: [0.8, 0.2, 0.6]
        } : {}}
        transition={{ duration: 1, repeat: isPlaying ? Infinity : 0 }}
      />
    </motion.svg>
  )
}

// Animation Diamant avec facettes
function DiamondAnimation({ phase, isPlaying }: { phase: string, isPlaying: boolean }) {
  return (
    <motion.svg
      width="60"
      height="60"
      viewBox="0 0 100 100" 
      className="z-10"
      animate={phase === 'building' ? {
        scale: [0, 1.3, 1],
        rotateY: [0, 180, 360]
      } : phase === 'exploding' ? {
        scale: [1, 1.4, 1.1], 
        rotateZ: [0, 720],
        rotateX: [0, 360]
      } : {}}
      transition={{ duration: phase === 'building' ? 1 : 2 }}
    >
      <defs>
        <linearGradient id="diamondGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#4FD1C7" stopOpacity="1" />
          <stop offset="30%" stopColor="#00F5FF" stopOpacity="0.9" />
          <stop offset="60%" stopColor="#B794F6" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#7C3AED" stopOpacity="0.7" />
        </linearGradient>
        <filter id="sparkle">
          <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      
      {/* Corps principal du diamant */}
      <motion.polygon
        points="50,10 70,30 50,90 30,30"
        fill="url(#diamondGrad)"
        filter="url(#sparkle)"
        stroke="rgba(255,255,255,0.5)"
        strokeWidth="1"
      />
      
      {/* Facettes */}
      <motion.polygon
        points="50,10 60,20 50,40 40,20"
        fill="rgba(255,255,255,0.3)"
        animate={isPlaying ? {
          opacity: [0.3, 0.8, 0.3],
          fill: [
            'rgba(255,255,255,0.3)',
            'rgba(79,209,199,0.5)', 
            'rgba(183,148,246,0.4)',
            'rgba(255,255,255,0.3)'
          ]
        } : {}}
        transition={{ duration: 1, repeat: isPlaying ? Infinity : 0 }}
      />
      
      {/* Éclats de lumière */}
      {[0, 120, 240].map((rotation, i) => (
        <motion.line
          key={i}
          x1="50" y1="50" x2="50" y2="20"
          stroke="rgba(255,255,255,0.8)"
          strokeWidth="2"
          strokeLinecap="round"
          transform={`rotate(${rotation} 50 50)`}
          animate={isPlaying ? {
            strokeWidth: [1, 4, 1],
            opacity: [0.5, 1, 0.5],
            y2: [30, 10, 30]
          } : {}}
          transition={{ 
            duration: 0.8, 
            repeat: isPlaying ? Infinity : 0,
            delay: i * 0.2
          }}
        />
      ))}
    </motion.svg>
  )
}

// Animation Rose avec pétales
function RoseAnimation({ phase, isPlaying }: { phase: string, isPlaying: boolean }) {
  return (
    <motion.svg
      width="60"
      height="60"
      viewBox="0 0 100 100"
      className="z-10"
      animate={phase === 'building' ? {
        scale: [0.5, 1.2, 1]
      } : phase === 'exploding' ? {
        scale: [1, 1.3, 1.1],
        rotate: [0, 180, 360]
      } : {}}
      transition={{ duration: phase === 'building' ? 1 : 2 }}
    >
      <defs>
        <radialGradient id="roseGrad" cx="50%" cy="50%">
          <stop offset="0%" stopColor="#FF6B9D" />
          <stop offset="50%" stopColor="#E91E63" />
          <stop offset="100%" stopColor="#880E4F" />
        </radialGradient>
        <radialGradient id="petalGrad" cx="30%" cy="30%">
          <stop offset="0%" stopColor="rgba(255,182,193,0.8)" />
          <stop offset="100%" stopColor="rgba(255,105,180,0.4)" />
        </radialGradient>
      </defs>
      
      {/* Pétales extérieurs */}
      {[0, 72, 144, 216, 288].map((rotation, i) => (
        <motion.ellipse
          key={i}
          cx="50" cy="35"
          rx="15" ry="25" 
          fill="url(#petalGrad)"
          transform={`rotate(${rotation} 50 50)`}
          animate={isPlaying ? {
            ry: [20, 30, 25],
            opacity: [0.6, 1, 0.8],
            rx: [12, 18, 15]
          } : {}}
          transition={{ 
            duration: 2, 
            repeat: isPlaying ? Infinity : 0,
            delay: i * 0.1
          }}
        />
      ))}
      
      {/* Centre de la rose */}
      <motion.circle
        cx="50" cy="50" r="12"
        fill="url(#roseGrad)"
        animate={isPlaying ? {
          r: [10, 16, 12],
          opacity: [0.9, 1, 0.95]
        } : {}}
        transition={{ duration: 1.5, repeat: isPlaying ? Infinity : 0 }}
      />
      
      {/* Spirale centrale */}
      <motion.path
        d="M50,50 Q55,45 50,40 Q45,45 50,50 Q52,52 50,50"
        fill="none"
        stroke="rgba(255,255,255,0.6)"
        strokeWidth="2"
        animate={isPlaying ? {
          strokeWidth: [1, 3, 2],
          opacity: [0.4, 0.8, 0.6]
        } : {}}
        transition={{ duration: 1, repeat: isPlaying ? Infinity : 0 }}
      />
    </motion.svg>
  )
}

// Animation Feux d'artifice avec explosion
function FireworksAnimation({ phase, isPlaying }: { phase: string, isPlaying: boolean }) {
  return (
    <motion.svg
      width="60"
      height="60"
      viewBox="0 0 100 100"
      className="z-10"
    >
      <defs>
        <radialGradient id="fireworkGrad" cx="50%" cy="50%">
          <stop offset="0%" stopColor="#FFD700" />
          <stop offset="30%" stopColor="#FF6B9D" />
          <stop offset="60%" stopColor="#B794F6" />
          <stop offset="100%" stopColor="#7C3AED" />
        </radialGradient>
      </defs>
      
      {/* Centre d'explosion */}
      <motion.circle
        cx="50" cy="50" r="5"
        fill="url(#fireworkGrad)"
        animate={phase === 'exploding' ? {
          r: [3, 20, 8],
          opacity: [1, 0.3, 0.7]
        } : {}}
        transition={{ duration: 1.5 }}
      />
      
      {/* Rayons d'explosion */}
      {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((angle, i) => (
        <motion.g key={i} transform={`rotate(${angle} 50 50)`}>
          <motion.line
            x1="50" y1="50" x2="50" y2="50"
            stroke={`hsl(${(i * 30) % 360}, 80%, 60%)`}
            strokeWidth="3"
            strokeLinecap="round"
            animate={phase === 'exploding' ? {
              x2: [50, 20, 35],
              y2: [50, 20, 35],
              strokeWidth: [2, 5, 1],
              opacity: [1, 0.5, 0]
            } : {}}
            transition={{ 
              duration: 2, 
              delay: i * 0.05,
              ease: "easeOut"
            }}
          />
          
          {/* Étincelles aux extrémités */}
          <motion.circle
            cx="50" cy="50" r="2"
            fill={`hsl(${(i * 30) % 360}, 90%, 70%)`}
            animate={phase === 'exploding' ? {
              cx: [50, 20, 35],
              cy: [50, 20, 35], 
              r: [1, 3, 0],
              opacity: [1, 0.8, 0]
            } : {}}
            transition={{ 
              duration: 2,
              delay: i * 0.05 + 0.5,
              ease: "easeOut"
            }}
          />
        </motion.g>
      ))}
    </motion.svg>
  )
}

// Animation Couronne avec gemmes
function CrownAnimation({ phase, isPlaying }: { phase: string, isPlaying: boolean }) {
  return (
    <motion.svg
      width="60"
      height="60"
      viewBox="0 0 100 100"
      className="z-10"
      animate={phase === 'building' ? {
        scale: [0.8, 1.2, 1],
        y: [10, -5, 0]
      } : phase === 'exploding' ? {
        scale: [1, 1.4, 1.1],
        rotate: [0, 15, 0],
        filter: ['brightness(1)', 'brightness(1.5)', 'brightness(1.2)']
      } : {}}
      transition={{ duration: phase === 'building' ? 1 : 2 }}
    >
      <defs>
        <linearGradient id="crownGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFD700" />
          <stop offset="50%" stopColor="#FFA000" />
          <stop offset="100%" stopColor="#FF8F00" />
        </linearGradient>
        <radialGradient id="gemGrad" cx="50%" cy="30%">
          <stop offset="0%" stopColor="#4FD1C7" />
          <stop offset="100%" stopColor="#7C3AED" />
        </radialGradient>
      </defs>
      
      {/* Base de la couronne */}
      <motion.path
        d="M20,70 L80,70 L75,60 L65,65 L55,55 L50,65 L45,55 L35,65 L25,60 Z"
        fill="url(#crownGrad)"
        stroke="rgba(255,215,0,0.8)"
        strokeWidth="1"
      />
      
      {/* Pics de la couronne */}
      <motion.polygon
        points="25,60 30,40 35,60"
        fill="url(#crownGrad)"
        animate={isPlaying ? {
          points: [
            "25,60 30,40 35,60",
            "25,60 30,35 35,60", 
            "25,60 30,40 35,60"
          ]
        } : {}}
        transition={{ duration: 2, repeat: isPlaying ? Infinity : 0 }}
      />
      
      <motion.polygon
        points="45,55 50,30 55,55"
        fill="url(#crownGrad)"
        animate={isPlaying ? {
          points: [
            "45,55 50,30 55,55",
            "45,55 50,25 55,55",
            "45,55 50,30 55,55"
          ]
        } : {}}
        transition={{ duration: 2, repeat: isPlaying ? Infinity : 0, delay: 0.2 }}
      />
      
      <motion.polygon
        points="65,60 70,40 75,60"
        fill="url(#crownGrad)"
        animate={isPlaying ? {
          points: [
            "65,60 70,40 75,60",
            "65,60 70,35 75,60",
            "65,60 70,40 75,60"
          ]
        } : {}}
        transition={{ duration: 2, repeat: isPlaying ? Infinity : 0, delay: 0.4 }}
      />
      
      {/* Gemmes sur la couronne */}
      {[30, 50, 70].map((x, i) => (
        <motion.ellipse
          key={i}
          cx={x} cy="62" 
          rx="3" ry="5"
          fill="url(#gemGrad)"
          animate={isPlaying ? {
            ry: [4, 7, 5],
            opacity: [0.8, 1, 0.9],
            fill: [
              'url(#gemGrad)',
              '#4FD1C7',
              '#7C3AED', 
              'url(#gemGrad)'
            ]
          } : {}}
          transition={{ 
            duration: 1.5, 
            repeat: isPlaying ? Infinity : 0,
            delay: i * 0.3
          }}
        />
      ))}
    </motion.svg>
  )
}

// Système de particules complexe
function ParticleSystem({ phase }: { phase: string }) {
  return (
    <>
      {/* Particules étincelantes */}
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={`sparkle-${i}`}
          className="absolute w-1 h-1 bg-white rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          initial={{ scale: 0, opacity: 0 }}
          animate={phase === 'exploding' ? {
            scale: [0, 1.5, 0],
            opacity: [0, 1, 0],
            x: [(Math.random() - 0.5) * 100],
            y: [(Math.random() - 0.5) * 100]
          } : {}}
          transition={{
            duration: 2,
            delay: i * 0.1,
            ease: "easeOut"
          }}
        />
      ))}
      
      {/* Particules colorées */}
      {[...Array(15)].map((_, i) => (
        <motion.div
          key={`color-${i}`}
          className="absolute w-2 h-2 rounded-full"
          style={{
            left: `${20 + (i * 4)}%`,
            top: `${20 + ((i * 7) % 60)}%`,
            background: `hsl(${i * 24}, 80%, 60%)`
          }}
          initial={{ scale: 0, opacity: 0 }}
          animate={phase === 'exploding' ? {
            scale: [0, 2, 0.5, 0],
            opacity: [0, 1, 0.5, 0],
            x: [(Math.random() - 0.5) * 150],
            y: [(Math.random() - 0.5) * 150],
            rotate: [0, 360 * (Math.random() > 0.5 ? 1 : -1)]
          } : {}}
          transition={{
            duration: 2.5,
            delay: i * 0.05,
            ease: "easeOut"
          }}
        />
      ))}
    </>
  )
}