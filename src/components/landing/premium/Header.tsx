'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useScroll, useMotionValueEvent } from 'framer-motion';

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, 'change', (latest) => {
    setIsScrolled(latest > 50);
  });

  const navLinks = [
    { label: 'Indépendantes', href: '#independantes' },
    { label: 'Clients', href: '#clients' },
    { label: 'Établissements', href: '#etablissements' },
    { label: 'Contact', href: '#contact' },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled
          ? 'bg-black/90 backdrop-blur-2xl border-b border-white/5 shadow-2xl shadow-black/50'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo - BEAUCOUP PLUS GRAND */}
          <Link href="/" className="flex items-center space-x-4 group relative">
            <div className="relative transition-transform hover:scale-110 active:scale-95">
              <div className="absolute inset-0 bg-gradient-to-br from-pink-500 to-purple-500 blur-xl opacity-40 group-hover:opacity-60 transition-opacity" />
              <Image
                src="/logo-principal.png"
                alt="Felora Logo"
                width={80}
                height={80}
                className="relative object-contain w-20 h-20 lg:w-24 lg:h-24"
                priority
                style={{
                  filter: 'drop-shadow(0 0 30px rgba(236,72,153,0.5)) drop-shadow(0 0 60px rgba(139,92,246,0.3))',
                }}
              />
            </div>
            <span className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-white via-gray-100 to-white bg-clip-text text-transparent hidden sm:block">
              Felora
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="relative px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors rounded-lg group"
              >
                <span className="relative z-10">{link.label}</span>
                <div className="absolute inset-0 bg-gradient-to-r from-pink-500/10 to-purple-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-pink-500 to-purple-500 group-hover:w-3/4 transition-all duration-300" />
              </a>
            ))}
          </nav>

          {/* CTA Button - Amélioré */}
          <div>
            <Link
              href="/register"
              className="group relative inline-flex items-center gap-2 px-6 py-3 overflow-hidden rounded-xl font-semibold text-sm transition-all duration-300 hover:scale-105"
            >
              {/* Background gradient animé */}
              <div className="absolute inset-0 bg-gradient-to-r from-pink-500 via-purple-500 to-violet-600 bg-[length:200%_100%] animate-gradient-shift" />
              
              {/* Overlay au hover */}
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              {/* Glow effect */}
              <div className="absolute -inset-1 bg-gradient-to-r from-pink-500 to-purple-500 rounded-xl blur-md opacity-0 group-hover:opacity-50 transition-opacity duration-300 -z-10" />
              
              {/* Texte */}
              <span className="relative z-10 text-white flex items-center gap-2">
                S'inscrire
                <span className="inline-block">→</span>
              </span>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
