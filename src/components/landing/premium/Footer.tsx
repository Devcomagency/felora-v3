'use client';

import Link from 'next/link';
import { Facebook, Twitter, Instagram, Mail } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';

export function Footer() {
  const t = useTranslations('landing.footer');
  const currentYear = new Date().getFullYear();

  return (
    <footer id="contact" className="bg-black border-t border-white/10 relative overflow-hidden">
      {/* Background subtle */}
      <div className="absolute inset-0 bg-gradient-to-b from-black to-[#0A0A0A]" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12 mb-12">
          {/* Felora - Réseaux sociaux */}
          <div>
            <div className="mb-6">
              <span className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">Felora</span>
            </div>
            <p className="text-gray-400 text-sm mb-6 leading-relaxed">
              {t('description')}
            </p>
            <div className="flex items-center gap-4">
              <a
                href="https://facebook.com/felora"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-pink-500 transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="https://twitter.com/felora"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-pink-500 transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a
                href="https://instagram.com/felora"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-pink-500 transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="mailto:info@felora.ch"
                className="text-gray-400 hover:text-pink-500 transition-colors"
                aria-label="Email"
              >
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Légal */}
          <div>
            <h3 className="text-white font-semibold mb-6 text-lg">{t('legal.title')}</h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/legal/terms"
                  className="text-gray-400 hover:text-white transition-colors text-sm hover:translate-x-1 inline-block transition-transform"
                >
                  {t('legal.terms')}
                </Link>
              </li>
              <li>
                <Link
                  href="/legal/privacy"
                  className="text-gray-400 hover:text-white transition-colors text-sm hover:translate-x-1 inline-block transition-transform"
                >
                  {t('legal.privacy')}
                </Link>
              </li>
              <li>
                <Link
                  href="/legal/terms"
                  className="text-gray-400 hover:text-white transition-colors text-sm hover:translate-x-1 inline-block transition-transform"
                >
                  {t('legal.cgu')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold mb-6 text-lg">{t('contact.title')}</h3>
            <ul className="space-y-3">
              <li>
                <a
                  href="mailto:info@felora.ch"
                  className="text-gray-400 hover:text-white transition-colors text-sm hover:translate-x-1 inline-block transition-transform"
                >
                  {t('contact.contact')}
                </a>
              </li>
              <li>
                <a
                  href="mailto:info@felora.ch"
                  className="text-gray-400 hover:text-white transition-colors text-sm hover:translate-x-1 inline-block transition-transform"
                >
                  {t('contact.support')}
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="pt-8 border-t border-white/10">
          <p className="text-gray-400 text-sm text-center">
            © {currentYear} Felora. {t('copyright')}
          </p>
        </div>
      </div>
    </footer>
  );
}
