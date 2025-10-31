'use client';

import { useEffect, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import Link from 'next/link';
import { Lock, TrendingUp, Eye, ArrowRight } from 'lucide-react';
import gsap from 'gsap';

const bullets = [
  { icon: Eye, text: 'Visibilité premium', accent: '#FF6B9D' },
  { icon: Lock, text: 'Sécurité & confidentialité suisse', accent: '#B794F6' },
  { icon: TrendingUp, text: 'Monétisation flexible', accent: '#4FD1C7' },
];

export default function Hero() {
  const titleRef = useRef<HTMLHeadingElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true });

  useEffect(() => {
    if (titleRef.current && isInView) {
      const chars = titleRef.current.querySelectorAll('.char');
      gsap.fromTo(
        chars,
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 1.2,
          stagger: 0.02,
          ease: 'power3.out',
        }
      );
    }
  }, [isInView]);

  const splitText = (text: string) => {
    return text.split('').map((char, i) => (
      <span key={i} className="char inline-block">
        {char === ' ' ? '\u00A0' : char}
      </span>
    ));
  };

  return (
    <section
      ref={containerRef}
      id="hero"
      className="relative min-h-screen flex items-center justify-center pt-32 sm:pt-40 pb-24 sm:pb-32 px-6 sm:px-8 overflow-hidden"
    >
      {/* Background avec image premium */}
      <div className="absolute inset-0 bg-[#0E0E10]" />
      
      {/* Image hero premium - Silhouette sexy */}
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1524504388940-b1c1722653e1"
          alt="Felora Premium"
          className="absolute inset-0 w-full h-full object-cover opacity-20"
          loading="eager"
          onError={(e) => {
            console.error('Image failed to load:', e);
            e.currentTarget.style.display = 'none';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0E0E10] via-[#0E0E10]/90 to-[#0E0E10]" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-5xl mx-auto text-center">
        {/* Minimal badge */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="inline-flex items-center gap-2 px-5 py-2 mb-16 border"
          style={{
            background: 'rgba(255, 255, 255, 0.02)',
            backdropFilter: 'blur(10px)',
            borderColor: 'rgba(255, 255, 255, 0.08)',
          }}
        >
          <span className="text-[10px] font-light text-white/50 uppercase tracking-[0.15em]">
            Plateforme Premium Suisse
          </span>
        </motion.div>

        {/* Main Title - Ultra épuré */}
        <motion.h1
          ref={titleRef}
          className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-light mb-12 leading-[1.08] tracking-tight"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{
            fontWeight: 300,
            letterSpacing: '-0.02em',
          }}
        >
          <span className="text-white">
            {splitText('Le réseau social premium')}
          </span>
          <br />
          <span className="text-white/90">
            {splitText('pour créatrices & escorts')}
          </span>
        </motion.h1>

        {/* Subtitle - Très épuré */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 1 }}
          className="text-lg sm:text-xl text-white/60 mb-20 max-w-2xl mx-auto leading-relaxed font-light"
          style={{
            letterSpacing: '0.01em',
            lineHeight: '1.8',
          }}
        >
          Une plateforme suisse, discrète et élégante pour publier, dialoguer et monétiser votre univers — en toute liberté.
        </motion.p>

        {/* Feature bullets - Ultra minimal */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.8 }}
          className="flex flex-wrap items-center justify-center gap-8 sm:gap-12 mb-20"
        >
          {bullets.map((bullet, i) => {
            const Icon = bullet.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2 + i * 0.1, duration: 0.6 }}
                className="flex items-center gap-3 group"
              >
                <div 
                  className="w-8 h-8 flex items-center justify-center border transition-colors duration-300"
                  style={{
                    borderColor: `rgba(255, 255, 255, 0.1)`,
                    background: 'rgba(255, 255, 255, 0.02)',
                  }}
                >
                  <Icon 
                    className="w-4 h-4 text-white/40 group-hover:text-white/60 transition-colors" 
                    strokeWidth={1.5} 
                  />
                </div>
                <span className="text-sm font-light text-white/50 group-hover:text-white/70 transition-colors tracking-wide">
                  {bullet.text}
                </span>
              </motion.div>
            );
          })}
        </motion.div>

        {/* CTA Buttons - Ultra épurés */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.4, duration: 0.8 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
        >
          <Link
            href="#early-access"
            className="group relative flex items-center justify-center gap-3 px-12 py-4 border transition-all duration-500"
            style={{
              background: 'rgba(255, 255, 255, 0.03)',
              borderColor: 'rgba(255, 255, 255, 0.15)',
              backdropFilter: 'blur(10px)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255, 107, 157, 0.08)';
              e.currentTarget.style.borderColor = 'rgba(255, 107, 157, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)';
            }}
          >
            <span className="text-sm font-light text-white/90 uppercase tracking-[0.1em]">
              Pré-inscription
            </span>
            <ArrowRight className="w-4 h-4 text-white/60 group-hover:text-white/90 transition-all duration-300 group-hover:translate-x-1" strokeWidth={1.5} />
          </Link>
          
          <Link
            href="#concept"
            className="group flex items-center gap-3 text-sm font-light text-white/50 hover:text-white/80 transition-colors duration-300 uppercase tracking-[0.1em]"
          >
            <span>Découvrir</span>
            <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" strokeWidth={1.5} />
          </Link>
        </motion.div>

        {/* Trust note - Ultra discret */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.6, duration: 0.8 }}
          className="text-[11px] text-white/30 font-light tracking-wide uppercase max-w-2xl mx-auto flex items-center justify-center gap-2"
        >
          <Lock className="w-3 h-3" strokeWidth={1.5} />
          <span>Offre limitée. Activation à l&apos;ouverture officielle</span>
        </motion.p>
      </div>

      {/* Minimal scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 1 }}
        className="absolute bottom-12 left-1/2 transform -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          className="w-px h-12 bg-gradient-to-b from-white/20 to-transparent"
        />
      </motion.div>
    </section>
  );
}
