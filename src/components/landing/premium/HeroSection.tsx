'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion, useScroll, useTransform, useMotionValue } from 'framer-motion';
import { HeroPhone } from './HeroPhone';
import { ArrowRight, Sparkles } from 'lucide-react';
import { useTranslations } from 'next-intl';

export function HeroSection() {
  const t = useTranslations('landing.hero');
  const sectionRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  });

  const opacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);
  const y = useTransform(scrollYProgress, [0, 0.6], [0, -150]);
  const scale = useTransform(scrollYProgress, [0, 0.6], [1, 0.95]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e;
      const { innerWidth, innerHeight } = window;
      mouseX.set((clientX / innerWidth - 0.5) * 20);
      mouseY.set((clientY / innerHeight - 0.5) * 20);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX, mouseY]);

  const backgroundX = useTransform(mouseX, [-20, 20], [-10, 10]);
  const backgroundY = useTransform(mouseY, [-20, 20], [-10, 10]);

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
      style={{
        background: 'radial-gradient(ellipse at center, #0A0A0A 0%, #000000 100%)',
      }}
    >
      {/* Background avec vraies couleurs Felora */}
      <motion.div
        style={{
          x: backgroundX,
          y: backgroundY,
          opacity,
          scale,
        }}
        className="absolute inset-0"
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/10 via-black to-black" />
        <div className="absolute inset-0 bg-grid-white/[0.02]" />
        <div className="absolute top-1/4 -left-48 w-96 h-96 bg-purple-500/15 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 -right-48 w-96 h-96 bg-pink-500/15 rounded-full blur-3xl animate-pulse delay-700" />
      </motion.div>

      {/* Contenu principal */}
      <motion.div
        style={{ y, opacity }}
        className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-16 items-center min-h-screen py-20"
      >
        {/* Texte */}
        <div className="text-center lg:text-left space-y-8 lg:space-y-10">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.03] backdrop-blur-xl border border-white/10"
          >
            <Sparkles className="w-4 h-4 text-pink-500" />
            <span className="text-sm font-medium text-gray-300">{t('badge')}</span>
          </motion.div>

          {/* Titre principal */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-bold leading-[1.1] tracking-tight"
          >
            <span className="block text-white mb-3">
              {t('title')}
            </span>
            <span className="block relative">
              <span className="absolute inset-0 bg-gradient-to-r from-pink-500 via-purple-500 to-violet-600 blur-2xl opacity-50" />
              <span className="relative bg-gradient-to-r from-pink-500 via-purple-500 to-violet-600 bg-clip-text text-transparent">
                {t('subtitle')}
              </span>
            </span>
          </motion.h1>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xl sm:text-2xl lg:text-3xl text-gray-300 leading-relaxed max-w-2xl mx-auto lg:mx-0 font-light"
          >
            {t('description')}
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center lg:items-start gap-4 pt-4"
          >
            <Link
              href="/register"
              className="group relative px-8 py-4 sm:px-10 sm:py-5 overflow-hidden rounded-2xl"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-pink-500 via-purple-500 to-violet-600 opacity-90 group-hover:opacity-100 transition-opacity" />
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity" />
              <span className="relative z-10 text-white font-semibold text-lg sm:text-xl flex items-center gap-3">
                {t('cta.discover')}
                <motion.span
                  animate={{ x: [0, 4, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <ArrowRight className="w-5 h-5" />
                </motion.span>
              </span>
              <div className="absolute inset-0 rounded-2xl shadow-[0_0_60px_rgba(236,72,153,0.4)] opacity-0 group-hover:opacity-100 transition-opacity blur-xl" />
            </Link>

            <Link
              href="/register"
              className="group px-8 py-4 sm:px-10 sm:py-5 border-2 border-white/20 text-white font-semibold text-lg sm:text-xl rounded-2xl hover:bg-white/5 hover:border-white/40 transition-all duration-300 backdrop-blur-sm relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/5 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
              <span className="relative z-10">{t('cta.signup')}</span>
            </Link>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex flex-wrap items-center justify-center lg:justify-start gap-8 pt-8"
          >
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.03] backdrop-blur-sm border border-white/10">
              <span className="text-2xl">✓</span>
              <div>
                <div className="text-lg font-bold text-white">100%</div>
                <div className="text-xs text-gray-400">{t('stats.swiss')}</div>
              </div>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.03] backdrop-blur-sm border border-white/10">
              <span className="text-2xl">💬</span>
              <div>
                <div className="text-lg font-bold text-white">24/7</div>
                <div className="text-xs text-gray-400">{t('stats.support')}</div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Téléphone avec animations - TOUJOURS VISIBLE */}
        <div className="relative mt-12 lg:mt-0">
          <HeroPhone />
        </div>
      </motion.div>

      {/* Scroll hint amélioré */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="flex flex-col items-center gap-3"
        >
          <span className="text-gray-400 text-sm font-medium">{t('scroll')}</span>
          <div className="w-7 h-12 border-2 border-white/20 rounded-full flex justify-center p-2 backdrop-blur-sm bg-white/[0.03]">
            <motion.div
              animate={{ y: [0, 16, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-1.5 h-1.5 bg-gradient-to-b from-pink-500 to-purple-500 rounded-full"
            />
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
