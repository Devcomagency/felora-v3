'use client';

import { useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';

const navLinks = [
  { label: 'Concept', href: '#concept' },
  { label: 'Fonctionnalités', href: '#features' },
  { label: 'Sécurité', href: '#why-felora' },
  { label: 'Tarifs', href: '#pricing' },
  { label: 'FAQ', href: '#faq' },
  { label: 'Contact', href: '#contact' },
];

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { scrollY } = useScroll();
  const backgroundColor = useTransform(
    scrollY,
    [0, 100],
    ['rgba(14, 14, 16, 0)', 'rgba(14, 14, 16, 0.95)']
  );
  const backdropBlur = useTransform(scrollY, [0, 100], [0, 24]);
  const borderOpacity = useTransform(scrollY, [0, 100], [0, 0.15]);

  const handleSmoothScroll = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith('#')) {
      e.preventDefault();
      const element = document.querySelector(href);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        setMobileMenuOpen(false);
      }
    }
  };

  // Close mobile menu on scroll
  useEffect(() => {
    const handleScroll = () => setMobileMenuOpen(false);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <motion.header
      style={{
        backgroundColor,
        backdropFilter: `blur(${backdropBlur}px) saturate(180%)`,
        WebkitBackdropFilter: `blur(${backdropBlur}px) saturate(180%)`,
        borderBottomWidth: '1px',
        borderBottomStyle: 'solid',
        borderBottomColor: `rgba(255, 255, 255, ${borderOpacity})`,
      }}
      className="fixed top-0 left-0 right-0 z-50"
    >
      {/* Subtle top border */}
      <div className="absolute top-0 left-0 right-0 h-px bg-white/5" />
      
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <Link 
            href="/" 
            className="group relative"
          >
            <motion.span
              className="relative inline-block text-2xl sm:text-3xl font-light text-white tracking-[0.05em]"
              whileHover={{ opacity: 0.8 }}
              transition={{ duration: 0.3 }}
            >
              FELORA
            </motion.span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-8">
            {navLinks.map((link, i) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={(e) => handleSmoothScroll(e, link.href)}
                className="relative text-sm font-light text-white/50 hover:text-white/80 transition-colors duration-300 tracking-wide"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* CTA Button Desktop */}
          <motion.div className="hidden lg:block">
            <Link
              href="#early-access"
              onClick={(e) => handleSmoothScroll(e, '#early-access')}
              className="group relative px-8 py-2.5 border transition-all duration-300"
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
              <span className="text-xs font-light text-white/90 uppercase tracking-[0.1em]">
                Pré-inscription
              </span>
            </Link>
          </motion.div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2.5 text-white/80 hover:text-white hover:bg-white/5 rounded-lg transition-all duration-200"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" strokeWidth={2.5} />
            ) : (
              <Menu className="w-6 h-6" strokeWidth={2.5} />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="lg:hidden pb-6 space-y-2 border-t border-white/5 mt-2 pt-4"
          >
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={(e) => handleSmoothScroll(e, link.href)}
                className="block px-4 py-3 text-white/80 hover:text-white hover:bg-white/5 rounded-lg transition-all duration-200 font-medium"
              >
                {link.label}
              </Link>
            ))}
            <Link
                href="#early-access"
              onClick={(e) => handleSmoothScroll(e, '#early-access')}
              className="block mx-4 mt-4 px-8 py-3 text-center border transition-all duration-300"
              style={{
                background: 'rgba(255, 255, 255, 0.03)',
                borderColor: 'rgba(255, 255, 255, 0.15)',
              }}
            >
              <span className="text-xs font-light text-white/90 uppercase tracking-[0.1em]">
                Pré-inscription
              </span>
            </Link>
          </motion.div>
        )}
      </nav>
    </motion.header>
  );
}
