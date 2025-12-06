'use client';

import { useRef, useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, useScroll, useTransform, useSpring, AnimatePresence } from 'framer-motion';
import { MessageCircle, Heart, User, DollarSign, Gift, Star, Sparkles } from 'lucide-react';

interface FloatingElement {
  id: string;
  icon: React.ReactNode;
  text?: string;
  initialX: number;
  initialY: number;
  delay: number;
  duration: number;
  color: string;
  randomX: number;
  randomRotate: number;
}

export function HeroPhone() {
  const phoneRef = useRef<HTMLDivElement>(null);
  const [currentScreenIndex, setCurrentScreenIndex] = useState(0);
  const [screenshotsLoaded, setScreenshotsLoaded] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { scrollYProgress } = useScroll({
    target: phoneRef,
    offset: ['start end', 'end start'],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  // Screenshots - Utilise les vrais screenshots de l'app
  const screenshots = [
    '/landing/screenshot-1.png', // Feed/Home
    '/landing/screenshot-2.png', // Profile
    '/landing/screenshot-3.png', // Map
  ].filter(Boolean);

  // Rotation automatique des screenshots
  useEffect(() => {
    if (!mounted) return;
    const interval = setInterval(() => {
      setCurrentScreenIndex((prev) => (prev + 1) % 3);
    }, 4000);
    return () => clearInterval(interval);
  }, [mounted]);

  // Transformations pour le téléphone avec spring physics
  const phoneX = useTransform(smoothProgress, [0, 1], [-30, 30]);
  const phoneY = useTransform(smoothProgress, [0, 1], [0, -50]);
  const phoneRotateY = useTransform(smoothProgress, [0, 0.5, 1], [-8, 0, 8]);
  const phoneRotateX = useTransform(smoothProgress, [0, 0.5, 1], [2, 0, -2]);
  const phoneScale = useTransform(smoothProgress, [0, 0.5, 1], [0.98, 1, 0.98]);
  const phoneGlow = useTransform(smoothProgress, [0, 0.5, 1], [0.3, 0.6, 0.3]);

  // Éléments flottants avec valeurs fixes pour éviter l'erreur d'hydratation
  const floatingElements: FloatingElement[] = [
    {
      id: 'notification',
      icon: <MessageCircle className="w-4 h-4" />,
      text: 'Nouveau message',
      initialX: -180,
      initialY: -120,
      delay: 0,
      duration: 4,
      color: '#EC4899',
      randomX: 25,
      randomRotate: 8,
    },
    {
      id: 'like1',
      icon: <Heart className="w-5 h-5 fill-current" />,
      initialX: 140,
      initialY: -180,
      delay: 0.8,
      duration: 3.5,
      color: '#EF4444',
      randomX: -20,
      randomRotate: -5,
    },
    {
      id: 'like2',
      icon: <Heart className="w-4 h-4 fill-current" />,
      initialX: 160,
      initialY: -140,
      delay: 1.2,
      duration: 3.8,
      color: '#EF4444',
      randomX: 15,
      randomRotate: 12,
    },
    {
      id: 'profile',
      icon: <User className="w-4 h-4" />,
      text: 'Sophie',
      initialX: -140,
      initialY: 120,
      delay: 1.8,
      duration: 4.2,
      color: '#8B5CF6',
      randomX: -18,
      randomRotate: -8,
    },
    {
      id: 'payment',
      icon: <DollarSign className="w-4 h-4" />,
      text: '+50 CHF',
      initialX: 180,
      initialY: 100,
      delay: 2.5,
      duration: 3.8,
      color: '#10B981',
      randomX: 22,
      randomRotate: 6,
    },
    {
      id: 'gift',
      icon: <Gift className="w-4 h-4" />,
      initialX: -100,
      initialY: 180,
      delay: 3,
      duration: 3.5,
      color: '#F59E0B',
      randomX: -15,
      randomRotate: -10,
    },
    {
      id: 'verified',
      icon: <Star className="w-4 h-4 fill-current" />,
      initialX: 100,
      initialY: -100,
      delay: 3.5,
      duration: 4,
      color: '#EC4899',
      randomX: 18,
      randomRotate: 9,
    },
    {
      id: 'sparkle',
      icon: <Sparkles className="w-3 h-3" />,
      initialX: -60,
      initialY: -60,
      delay: 1.5,
      duration: 2.5,
      color: '#8B5CF6',
      randomX: -12,
      randomRotate: 4,
    },
  ];

  const currentScreenshot = screenshots[currentScreenIndex] || screenshots[0];

  if (!mounted) {
    return <div className="relative w-full h-full flex items-center justify-center min-h-[600px]" />;
  }

  return (
    <div ref={phoneRef} className="relative w-full h-full flex items-center justify-center min-h-[600px]">
      {/* Glow effect autour du téléphone */}
      <motion.div
        style={{ opacity: phoneGlow }}
        className="absolute inset-0 flex items-center justify-center"
      >
        <div className="w-[400px] h-[800px] bg-gradient-to-br from-pink-500/20 via-purple-500/20 to-transparent rounded-[4rem] blur-3xl" />
      </motion.div>

      {/* Téléphone */}
      <motion.div
        style={{
          x: phoneX,
          y: phoneY,
          rotateY: phoneRotateY,
          rotateX: phoneRotateX,
          scale: phoneScale,
        }}
        className="relative z-10 perspective-1000"
      >
        <div className="relative w-[320px] h-[640px] mx-auto">
          {/* Ombre profonde avec gradient */}
          <motion.div
            style={{ opacity: phoneGlow }}
            className="absolute inset-0 bg-gradient-to-br from-pink-500/30 via-purple-500/30 to-transparent rounded-[3.5rem] blur-3xl -z-10"
          />
          
          {/* Cadre du téléphone premium */}
          <div className="relative w-full h-full">
            {/* Bordure extérieure avec gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-gray-800 via-gray-900 to-black rounded-[3.5rem] p-[3px]">
              <div className="w-full h-full bg-gradient-to-br from-pink-500/10 via-purple-500/10 to-transparent rounded-[3.5rem]" />
            </div>
            
            {/* Cadre principal */}
            <div className="relative w-full h-full bg-gradient-to-br from-gray-900 via-black to-gray-900 rounded-[3.5rem] p-2.5 shadow-2xl border border-gray-800/50">
              {/* Notch premium */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-7 bg-black rounded-b-3xl z-30 border-x border-gray-800" />
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-36 h-5 bg-gradient-to-b from-gray-900 to-black rounded-b-2xl z-30" />
              
              {/* Écran avec screenshot réel */}
              <div className="relative w-full h-full bg-gradient-to-br from-[#0A0A0A] via-[#0B0B0B] to-[#111318] rounded-[3rem] overflow-hidden">
                {/* Screenshot réel de l'app */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentScreenIndex}
                    initial={{ opacity: 0, scale: 1.05 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.5 }}
                    className="absolute inset-0"
                  >
                    <img
                      src={currentScreenshot}
                      alt="Felora App Screenshot"
                      className="absolute inset-0 w-full h-full object-cover"
                      onLoad={() => setScreenshotsLoaded(true)}
                      onError={(e) => {
                        console.error('Screenshot load error:', currentScreenshot);
                        setScreenshotsLoaded(false);
                      }}
                    />
                  </motion.div>
                </AnimatePresence>
                
                {/* Fallback si les screenshots n'existent pas */}
                {!screenshotsLoaded && (
                  <div className="absolute inset-0 bg-gradient-to-br from-[#0B0B0B] to-[#111318] flex flex-col">
                    {/* Barre de statut */}
                    <div className="absolute top-0 left-0 right-0 h-14 flex items-center justify-between px-8 pt-3 z-20 bg-gradient-to-b from-black/50 to-transparent">
                      <span className="text-white text-sm font-semibold">9:41</span>
                      <div className="flex items-center gap-1.5">
                        <div className="w-1 h-1 bg-white rounded-full" />
                        <div className="w-1 h-1 bg-white rounded-full" />
                        <div className="w-1 h-1 bg-white rounded-full" />
                      </div>
                    </div>

                    {/* Contenu simulé */}
                    <div className="pt-16 px-5 space-y-4 h-full pb-20">
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-br from-pink-500 to-purple-500 rounded-xl blur-md opacity-60" />
                            <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 via-pink-500 to-purple-500 flex items-center justify-center shadow-lg">
                              <span className="text-white text-sm font-bold">F</span>
                            </div>
                          </div>
                          <div>
                            <span className="text-white font-bold text-base block">Felora</span>
                            <span className="text-gray-400 text-xs">En ligne</span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3">
                        {[1, 2, 3].map((i) => (
                          <div
                            key={i}
                            className="group relative bg-white/[0.03] backdrop-blur-xl rounded-2xl p-4 border border-white/10 hover:border-white/20 transition-all"
                          >
                            <div className="flex items-center gap-3">
                              <div className="relative">
                                <div className="absolute inset-0 bg-gradient-to-br from-pink-500 to-purple-500 rounded-full blur-sm opacity-50 group-hover:opacity-100 transition-opacity" />
                                <div className="relative w-14 h-14 rounded-full bg-gradient-to-br from-pink-500 via-pink-500 to-purple-500 flex items-center justify-center shadow-lg">
                                  <span className="text-white text-xs font-bold">U</span>
                                </div>
                              </div>
                              <div className="flex-1">
                                <div className="h-3 bg-white/25 rounded-lg w-28 mb-2 group-hover:w-32 transition-all" />
                                <div className="h-2 bg-white/15 rounded w-20" />
                              </div>
                              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-pink-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center">
                                <Heart className="w-4 h-4 text-pink-500" />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Bottom nav */}
                    <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-black/80 via-black/40 to-transparent backdrop-blur-xl border-t border-white/10 flex items-center justify-around px-4">
                      {['Home', 'Search', 'Messages', 'Profile'].map((item, i) => (
                        <div
                          key={item}
                          className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center transition-all cursor-pointer"
                        >
                          <div className="w-5 h-5 bg-gradient-to-br from-pink-500 to-purple-500 rounded opacity-60" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Éléments flottants améliorés avec valeurs fixes */}
      {floatingElements.map((element) => (
        <motion.div
          key={element.id}
          initial={{ opacity: 0, scale: 0, y: element.initialY }}
          animate={{
            opacity: [0, 1, 1, 0],
            scale: [0, 1.1, 1, 0],
            y: [element.initialY, element.initialY - 250],
            x: [element.initialX, element.initialX + element.randomX],
            rotate: [0, element.randomRotate],
          }}
          transition={{
            duration: element.duration,
            delay: element.delay,
            repeat: Infinity,
            repeatDelay: 3,
            ease: [0.4, 0, 0.2, 1],
          }}
          className="absolute left-1/2 top-1/2 pointer-events-none z-20"
          style={{
            transform: `translate(calc(-50% + ${element.initialX}px), calc(-50% + ${element.initialY}px))`,
          }}
        >
          <motion.div
            whileHover={{ scale: 1.1 }}
            className="flex items-center gap-2 bg-black/90 backdrop-blur-xl px-4 py-2.5 rounded-full border border-white/20 shadow-2xl whitespace-nowrap"
            style={{
              borderColor: `${element.color}40`,
              boxShadow: `0 8px 32px ${element.color}20`,
            }}
          >
            <div style={{ color: element.color }}>
              {element.icon}
            </div>
            {element.text && (
              <span className="text-white text-xs font-semibold">{element.text}</span>
            )}
          </motion.div>
        </motion.div>
      ))}
    </div>
  );
}
