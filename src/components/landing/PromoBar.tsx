'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function PromoBar() {
  return (
    <motion.div
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="relative py-3.5 px-6 text-center overflow-hidden border-b"
      style={{
        background: '#0E0E10',
        borderColor: 'rgba(255, 255, 255, 0.05)',
      }}
    >
      <div className="relative z-10 flex flex-col sm:flex-row items-center justify-center gap-4 text-sm">
        <span className="text-white/70 font-light tracking-wide uppercase text-xs">
          Pré-inscription ouverte
        </span>
        
        <span className="hidden sm:block w-px h-3 bg-white/10" />
        
        <Link
          href="#early-access"
          className="group flex items-center gap-2 text-white/80 hover:text-white transition-colors duration-300 font-light text-xs uppercase tracking-widest"
        >
          <span>3 mois offerts</span>
          <ArrowRight className="w-3 h-3 transition-transform duration-300 group-hover:translate-x-1" strokeWidth={1.5} />
        </Link>
      </div>
    </motion.div>
  );
}
