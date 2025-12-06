'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-black/80 backdrop-blur-xl border-b border-white/10'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <span className="text-white font-bold text-sm">F</span>
            </div>
            <span className="text-xl font-bold text-white">Felora</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-sm text-gray-400 hover:text-white transition-colors">
              Fonctionnalités
            </a>
            <a href="/about" className="text-sm text-gray-400 hover:text-white transition-colors">
              À propos
            </a>
            <a href="/contact" className="text-sm text-gray-400 hover:text-white transition-colors">
              Contact
            </a>
          </nav>

          {/* CTA Button */}
          <Link
            href="/register"
            className="hidden md:block px-6 py-2.5 bg-white text-black font-semibold text-sm rounded-full hover:scale-105 transition-transform"
          >
            Commencer
          </Link>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-black/95 backdrop-blur-xl border-t border-white/10">
          <nav className="max-w-7xl mx-auto px-6 py-6 flex flex-col space-y-4">
            <a
              href="#features"
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-gray-400 hover:text-white transition-colors py-2"
            >
              Fonctionnalités
            </a>
            <a
              href="/about"
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-gray-400 hover:text-white transition-colors py-2"
            >
              À propos
            </a>
            <a
              href="/contact"
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-gray-400 hover:text-white transition-colors py-2"
            >
              Contact
            </a>
            <Link
              href="/register"
              className="px-6 py-3 bg-white text-black font-semibold rounded-full text-center"
            >
              Commencer
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
