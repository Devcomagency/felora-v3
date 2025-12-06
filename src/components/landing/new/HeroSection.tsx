'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Sparkles, ArrowRight } from 'lucide-react';

export function HeroSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const containerHeight = containerRef.current.offsetHeight;
      const windowHeight = window.innerHeight;

      const progress = Math.max(0, Math.min(1, -rect.top / (containerHeight - windowHeight)));
      setScrollProgress(progress);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const phoneY = -20 + scrollProgress * 20;
  const phoneScale = 0.85 + scrollProgress * 0.15;

  return (
    <section ref={containerRef} className="relative min-h-[300vh] bg-black">
      <div className="sticky top-0 h-screen flex items-center justify-center overflow-hidden">
        {/* Radial gradient background */}
        <div
          className="absolute inset-0"
          style={{
            background: `radial-gradient(circle at 50% ${40 + scrollProgress * 10}%, rgba(236, 72, 153, ${0.08 + scrollProgress * 0.04}), transparent 50%)`,
          }}
        />

        {/* Content wrapper */}
        <div className="relative w-full max-w-7xl mx-auto px-6 lg:px-8">
          {/* Title section - fades out */}
          <div
            className="absolute inset-x-0 top-28 text-center space-y-6 transition-all duration-700"
            style={{
              opacity: Math.max(0, 1 - scrollProgress * 1.5),
              transform: `translateY(${-scrollProgress * 40}px)`,
            }}
          >
            <div className="inline-flex items-center space-x-2 px-4 py-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full">
              <Sparkles className="w-4 h-4 text-pink-400" />
              <span className="text-sm text-gray-300">Nouveau réseau social premium</span>
            </div>

            <h1 className="text-7xl lg:text-8xl font-bold tracking-tight">
              <span className="block text-white mb-2">Felora</span>
              <span className="block text-transparent bg-gradient-to-r from-pink-400 via-purple-400 to-pink-500 bg-clip-text">
                Redéfinit le luxe
              </span>
            </h1>

            <p className="text-xl lg:text-2xl text-gray-400 max-w-2xl mx-auto font-light">
              La plateforme suisse exclusive pour créatrices, escorts et établissements de prestige
            </p>
          </div>

          {/* Phone mockup */}
          <div
            className="relative mx-auto transition-all duration-500 ease-out"
            style={{
              width: '380px',
              transform: `translateY(${phoneY}%) scale(${phoneScale})`,
            }}
          >
            {/* Phone shadow */}
            <div className="absolute inset-0 bg-gradient-to-b from-pink-500/20 to-purple-500/20 blur-3xl" />

            {/* Phone frame */}
            <div className="relative bg-zinc-950 rounded-[60px] p-3 shadow-2xl border border-zinc-800">
              {/* Screen */}
              <div className="bg-black rounded-[48px] overflow-hidden relative aspect-[9/19.5]">
                {/* Notch */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-7 bg-black rounded-b-3xl z-50" />

                {/* Status bar */}
                <div className="absolute top-0 left-0 right-0 h-11 px-8 flex items-center justify-between text-white text-xs z-40">
                  <span>9:41</span>
                  <div className="flex items-center space-x-1">
                    <div className="w-4 h-3 border border-white/60 rounded-sm" />
                  </div>
                </div>

                {/* App content */}
                <div className="relative h-full pt-11 bg-gradient-to-b from-zinc-950 to-black">
                  {/* Header */}
                  <div className="px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center">
                        <span className="text-white font-bold text-sm">F</span>
                      </div>
                      <span className="text-white font-semibold text-lg">Felora</span>
                    </div>
                  </div>

                  {/* Feed cards with scroll effect */}
                  <div className="px-4 space-y-4 pb-20">
                    {[
                      { color: 'from-pink-500 to-rose-600', delay: 0 },
                      { color: 'from-purple-500 to-pink-600', delay: 0.1 },
                      { color: 'from-blue-500 to-purple-600', delay: 0.2 },
                    ].map((card, i) => (
                      <div
                        key={i}
                        className="bg-zinc-900/80 backdrop-blur-xl rounded-3xl overflow-hidden border border-white/5"
                        style={{
                          opacity: Math.min(1, scrollProgress * 3 - i * 0.3),
                          transform: `translateY(${Math.max(0, (1 - scrollProgress * 2) * 20)}px)`,
                          transition: `all 0.6s cubic-bezier(0.4, 0, 0.2, 1) ${card.delay}s`,
                        }}
                      >
                        {/* Card header */}
                        <div className="p-4 flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${card.color}`} />
                            <div>
                              <div className="h-2 w-20 bg-white/20 rounded-full mb-1.5" />
                              <div className="h-1.5 w-16 bg-white/10 rounded-full" />
                            </div>
                          </div>
                          <div className="w-5 h-5 rounded-full bg-blue-500/20 flex items-center justify-center">
                            <div className="w-3 h-3 rounded-full bg-blue-500" />
                          </div>
                        </div>

                        {/* Card image */}
                        <div className={`aspect-square bg-gradient-to-br ${card.color} relative`}>
                          <div className="absolute inset-0 bg-black/10" />
                        </div>

                        {/* Card actions */}
                        <div className="p-4 flex items-center justify-between">
                          <div className="flex space-x-5">
                            <div className="w-6 h-6 rounded-full bg-white/10" />
                            <div className="w-6 h-6 rounded-full bg-white/10" />
                            <div className="w-6 h-6 rounded-full bg-white/10" />
                          </div>
                          <div className="w-6 h-6 rounded-full bg-white/10" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* CTA section - fades in */}
          <div
            className="absolute inset-x-0 bottom-24 text-center space-y-8"
            style={{
              opacity: Math.min(1, Math.max(0, (scrollProgress - 0.6) * 2.5)),
              transform: `translateY(${Math.max(0, (1 - (scrollProgress - 0.6) * 2) * 20)}px)`,
            }}
          >
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/register"
                className="group px-8 py-4 bg-white text-black font-semibold rounded-full hover:scale-105 transition-all duration-300 shadow-lg shadow-white/20 flex items-center space-x-2"
              >
                <span>Commencer maintenant</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="#features"
                className="px-8 py-4 text-white font-semibold rounded-full border border-white/20 hover:bg-white/5 transition-all duration-300"
              >
                En savoir plus
              </Link>
            </div>

            <p className="text-sm text-gray-500">
              Gratuit pour tous • Sans engagement • Plateforme suisse
            </p>
          </div>

          {/* Scroll indicator */}
          <div
            className="absolute bottom-8 left-1/2 -translate-x-1/2"
            style={{
              opacity: Math.max(0, 1 - scrollProgress * 3),
            }}
          >
            <div className="flex flex-col items-center space-y-2">
              <span className="text-xs text-gray-500 uppercase tracking-wider">Scroll</span>
              <div className="w-[2px] h-12 bg-gradient-to-b from-gray-500 to-transparent" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
