'use client';

import Link from 'next/link';

export function Footer() {
  const links = {
    product: [
      { label: 'Créatrices', href: '/register/indepandante' },
      { label: 'Clients', href: '/register/client' },
      { label: 'Établissements', href: '/register/club' },
    ],
    company: [
      { label: 'À propos', href: '/about' },
      { label: 'Contact', href: '/contact' },
      { label: 'Blog', href: '/blog' },
    ],
    legal: [
      { label: 'Confidentialité', href: '/privacy' },
      { label: 'Conditions', href: '/terms' },
      { label: 'Mentions légales', href: '/legal' },
    ],
  };

  return (
    <footer className="relative bg-black border-t border-white/10">
      <div className="max-w-7xl mx-auto px-6 py-16">
        {/* Main footer content */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-12 mb-16">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center">
                <span className="text-white font-bold text-sm">F</span>
              </div>
              <span className="text-xl font-bold text-white">Felora</span>
            </div>
            <p className="text-sm text-gray-500 leading-relaxed">
              La plateforme premium suisse pour créatrices et établissements de prestige.
            </p>
          </div>

          {/* Product */}
          <div>
            <h3 className="text-white font-semibold mb-4">Produit</h3>
            <ul className="space-y-3">
              {links.product.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-500 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-white font-semibold mb-4">Entreprise</h3>
            <ul className="space-y-3">
              {links.company.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-500 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-white font-semibold mb-4">Légal</h3>
            <ul className="space-y-3">
              {links.legal.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-500 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-600">
            © {new Date().getFullYear()} Felora. Tous droits réservés.
          </p>
          <div className="flex items-center space-x-6">
            <span className="text-sm text-gray-600">🇨🇭 Made in Switzerland</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
