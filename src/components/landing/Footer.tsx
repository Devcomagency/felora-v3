'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Mail, MapPin } from 'lucide-react';

const links = [
  { label: 'Concept', href: '#concept' },
  { label: 'Fonctionnalités', href: '#features' },
  { label: 'Sécurité', href: '#why-felora' },
  { label: 'Tarifs', href: '#pricing' },
  { label: 'FAQ', href: '#faq' },
];

const legalLinks = [
  { label: 'Mentions légales', href: '/legal/terms' },
  { label: 'Confidentialité', href: '/legal/privacy' },
  { label: 'Cookies', href: '/legal/cookies' },
];

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith('#')) {
      e.preventDefault();
      const element = document.querySelector(href);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  return (
    <footer className="relative py-16 sm:py-20 px-4 sm:px-6 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-[#0E0E10]" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0E0E10] via-transparent to-transparent" />
      
      {/* Subtle grid pattern */}
      <div 
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      {/* Gradient accent line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#FF6B9D]/30 to-transparent" />

      <div className="container mx-auto max-w-7xl relative z-10">
        {/* Main Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          {/* Brand */}
          <div className="space-y-4">
            <Link 
              href="/" 
              className="inline-flex items-center gap-2 group"
            >
              <motion.span
                className="text-3xl sm:text-4xl font-light text-white tracking-[0.05em]"
                whileHover={{ opacity: 0.8 }}
                transition={{ duration: 0.3 }}
              >
                FELORA
              </motion.span>
            </Link>
            <p className="text-white/60 leading-relaxed max-w-sm">
              Le réseau social premium pour créatrices & escorts en Suisse.
              Discrétion, qualité et respect.
            </p>
            <div className="flex items-center gap-2 text-white/50 text-sm">
              <MapPin className="w-4 h-4" />
              <span>Suisse</span>
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="text-sm font-semibold text-white/90 mb-5 uppercase tracking-wider">
              Navigation
            </h3>
            <nav className="flex flex-col gap-3">
              {links.map((link, i) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={(e) => handleClick(e, link.href)}
                  className="text-white/50 hover:text-white/80 transition-colors duration-300 text-sm font-light tracking-wide"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Legal & Contact */}
          <div>
            <h3 className="text-sm font-semibold text-white/90 mb-5 uppercase tracking-wider">
              Légal
            </h3>
            <nav className="flex flex-col gap-3 mb-6">
              {legalLinks.map((link, i) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-white/50 hover:text-white/80 transition-colors duration-300 text-sm font-light tracking-wide"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
            <div className="flex items-center gap-2 text-white/50 text-sm">
              <Mail className="w-4 h-4" />
              <a href="mailto:support@felora.ch" className="hover:text-white transition-colors">
                support@felora.ch
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/5">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-white/40 text-sm">
              © {currentYear} <span className="text-white/60 font-medium">Felora</span>. Tous droits réservés.
            </p>
            <div className="flex items-center gap-2 text-white/30 text-xs font-light tracking-wide uppercase">
              <span>Fait en Suisse</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

