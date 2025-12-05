'use client';

import Link from 'next/link';

export function CTASection() {
  return (
    <>
      <section className="relative py-32 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-pink-600 via-purple-600 to-pink-700" />
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yLjIxLTEuNzktNC00LTRzLTQgMS43OS00IDQgMS43OSA0IDQgNCA0LTEuNzkgNC00em0wLTEyYzAtMi4yMS0xLjc5LTQtNC00cy00IDEuNzktNCA0IDEuNzkgNCA0IDQgNC0xLjc5IDQtNHptMTIgMTJjMC0yLjItMS43OS00LTQtNHMtNCAxLjgtNCA0IDEuNzkgNCA0IDQgNC0xLjc5IDQtNHptLTI0IDBjMC0yLjItMS43OS00LTQtNHMtNCAxLjgtNCA0IDEuNzkgNCA0IDQgNC0xLjc5IDQtNHptMTIgMTJjMC0yLjItMS43OS00LTQtNHMtNCAxLjgtNCA0IDEuNzkgNCA0IDQgNC0xLjc5IDQtNHoiLz48L2c+PC9nPjwvc3ZnPg==')]" />
        </div>

        <div className="relative max-w-4xl mx-auto text-center">
          <h2 className="text-5xl md:text-7xl font-bold text-white mb-8">
            Prêt à briller ?
          </h2>
          <p className="text-xl md:text-2xl text-white/90 mb-12">
            Rejoignez Felora gratuitement et commencez dès maintenant
          </p>

          <Link
            href="/register"
            className="inline-block px-12 py-5 bg-white text-purple-600 font-bold text-lg rounded-full hover:scale-110 transition-all duration-300 shadow-2xl"
          >
            Créer mon compte
          </Link>

          <p className="text-white/60 text-sm mt-8">
            Gratuit • Sans carte bancaire • Plateforme suisse 🇨🇭
          </p>
        </div>
      </section>

      <footer className="bg-black border-t border-white/10 py-12 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center">
              <span className="text-white font-bold text-sm">F</span>
            </div>
            <span className="text-xl font-bold text-white">Felora</span>
          </div>

          <p className="text-gray-500 text-sm mb-8">
            © {new Date().getFullYear()} Felora. Made with ❤️ in Switzerland
          </p>

          <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-400">
            <Link href="/privacy" className="hover:text-white transition-colors">Confidentialité</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Conditions</Link>
            <Link href="/contact" className="hover:text-white transition-colors">Contact</Link>
          </div>
        </div>
      </footer>
    </>
  );
}
