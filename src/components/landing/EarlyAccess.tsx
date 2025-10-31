'use client';

import { useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { CheckCircle2, Mail } from 'lucide-react';

export default function EarlyAccess() {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });
  const [formData, setFormData] = useState({
    artistName: '',
    email: '',
    city: '',
    accountType: '',
    consent: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // TODO: Replace with actual API endpoint /api/preinscription
    console.log('Form submitted:', formData);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    setIsSubmitting(false);
    setSubmitted(true);

    setTimeout(() => {
      setSubmitted(false);
      setFormData({
        artistName: '',
        email: '',
        city: '',
        accountType: '',
        consent: false,
      });
    }, 3000);
  };

  return (
    <section
      ref={ref}
      id="early-access"
      className="relative py-32 sm:py-40 px-6 sm:px-8 overflow-hidden"
    >
      <div className="absolute inset-0 bg-[#0E0E10]" />

      <div className="container mx-auto max-w-4xl relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <div className="inline-block mb-8">
            <span className="text-xs font-light text-white/30 tracking-[0.2em] uppercase">
              Offre limitée
            </span>
          </div>
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-light mb-6 text-white">
            Early Access
            <br />
            <span className="text-white/80">3 mois offerts</span>
          </h2>
          <p className="text-lg sm:text-xl text-white/50 max-w-2xl mx-auto leading-relaxed font-light">
            Profitez de 90 jours sans frais d&apos;abonnement Felora à l&apos;ouverture. Visibilité prioritaire et onboarding personnalisé pour les premières créatrices et agences vérifiées.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative p-12 sm:p-16 border"
          style={{
            background: 'rgba(255, 255, 255, 0.02)',
            borderColor: 'rgba(255, 255, 255, 0.08)',
            backdropFilter: 'blur(10px)',
          }}
        >
          {submitted ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-12"
            >
              <div className="w-16 h-16 mx-auto mb-6 flex items-center justify-center border"
                style={{
                  borderColor: 'rgba(79, 209, 199, 0.3)',
                  background: 'rgba(79, 209, 199, 0.1)',
                }}
              >
                <CheckCircle2 className="w-8 h-8 text-[#4FD1C7]" strokeWidth={1.5} />
              </div>
              <h3 className="text-2xl font-light text-white mb-3">Merci</h3>
              <p className="text-white/50 font-light">Votre pré-inscription a été enregistrée.</p>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="artistName" className="block text-white/60 font-light mb-3 text-sm uppercase tracking-wide">
                  Nom d&apos;artiste *
                </label>
                <input
                  type="text"
                  id="artistName"
                  required
                  value={formData.artistName}
                  onChange={(e) => setFormData({ ...formData, artistName: e.target.value })}
                  className="w-full px-6 py-4 border bg-transparent text-white placeholder-white/20 focus:outline-none focus:border-white/30 transition-all font-light"
                  style={{
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                    background: 'rgba(255, 255, 255, 0.02)',
                  }}
                  placeholder="Votre nom d'artiste"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-white/60 font-light mb-3 text-sm uppercase tracking-wide">
                  Email *
                </label>
                <input
                  type="email"
                  id="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-6 py-4 border bg-transparent text-white placeholder-white/20 focus:outline-none focus:border-white/30 transition-all font-light"
                  style={{
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                    background: 'rgba(255, 255, 255, 0.02)',
                  }}
                  placeholder="votre@email.com"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="city" className="block text-white/60 font-light mb-3 text-sm uppercase tracking-wide">
                    Ville *
                  </label>
                  <input
                    type="text"
                    id="city"
                    required
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-6 py-4 border bg-transparent text-white placeholder-white/20 focus:outline-none focus:border-white/30 transition-all font-light"
                    style={{
                      borderColor: 'rgba(255, 255, 255, 0.1)',
                      background: 'rgba(255, 255, 255, 0.02)',
                    }}
                    placeholder="Genève, Zürich..."
                  />
                </div>

                <div>
                  <label htmlFor="accountType" className="block text-white/60 font-light mb-3 text-sm uppercase tracking-wide">
                    Type de compte *
                  </label>
                  <select
                    id="accountType"
                    required
                    value={formData.accountType}
                    onChange={(e) => setFormData({ ...formData, accountType: e.target.value })}
                    className="w-full px-6 py-4 border bg-transparent text-white focus:outline-none focus:border-white/30 transition-all font-light appearance-none"
                    style={{
                      borderColor: 'rgba(255, 255, 255, 0.1)',
                      background: 'rgba(255, 255, 255, 0.02)',
                    }}
                  >
                    <option value="" disabled className="bg-[#0E0E10]">Sélectionnez...</option>
                    <option value="creatrice" className="bg-[#0E0E10]">Créatrice</option>
                    <option value="escort" className="bg-[#0E0E10]">Escort</option>
                    <option value="agence" className="bg-[#0E0E10]">Agence</option>
                    <option value="autre" className="bg-[#0E0E10]">Autre</option>
                  </select>
                </div>
              </div>

              <div className="flex items-start gap-4 pt-2">
                <input
                  type="checkbox"
                  id="consent"
                  required
                  checked={formData.consent}
                  onChange={(e) => setFormData({ ...formData, consent: e.target.checked })}
                  className="mt-1 w-5 h-5 border bg-transparent"
                  style={{
                    borderColor: 'rgba(255, 255, 255, 0.2)',
                    background: 'rgba(255, 255, 255, 0.02)',
                  }}
                />
                <label htmlFor="consent" className="text-white/50 text-sm leading-relaxed font-light">
                  J&apos;accepte de recevoir des communications de Felora concernant mon compte et l&apos;ouverture de la plateforme. Je peux me désinscrire à tout moment.
                </label>
              </div>

              <motion.button
                type="submit"
                disabled={isSubmitting}
                className="w-full px-12 py-4 border transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-light text-sm uppercase tracking-[0.1em]"
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  borderColor: 'rgba(255, 255, 255, 0.15)',
                }}
                onMouseEnter={(e) => {
                  if (!isSubmitting) {
                    e.currentTarget.style.borderColor = 'rgba(255, 107, 157, 0.3)';
                    e.currentTarget.style.background = 'rgba(255, 107, 157, 0.08)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSubmitting) {
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)';
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                  }
                }}
                whileHover={!isSubmitting ? { scale: 1.01 } : {}}
                whileTap={!isSubmitting ? { scale: 0.99 } : {}}
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-3 text-white/60">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Envoi en cours...
                  </span>
                ) : (
                  <span className="text-white/90">Obtenir mes 3 mois offerts</span>
                )}
              </motion.button>

              <p className="text-white/30 text-xs text-center font-light tracking-wide">
                Offre non cumulable, activation à l&apos;ouverture, hors frais de passerelles de paiement.
              </p>
            </form>
          )}
        </motion.div>
      </div>
    </section>
  );
}
