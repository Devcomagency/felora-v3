/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/ui/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // FELORA Design System Colors
        'felora-bg': '#0B0B0B',
        'felora-surface': '#111318',
        'felora-panel': '#14171D',
        'felora-border': '#23262D',
        'felora-muted': '#A1A5B0',
        'felora-text': '#EAECEF',
        'felora-accent-1': '#FF6B9D',
        'felora-accent-2': '#B794F6',
        'felora-accent-3': '#4FD1C7',
        'felora-success': '#10B981',
        'felora-warning': '#F59E0B',
        'felora-danger': '#EF4444',
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #FF6B9D 0%, #B794F6 100%)',
        'gradient-neural': 'linear-gradient(135deg, #4FD1C7 0%, #B794F6 100%)',
        'gradient-text': 'linear-gradient(135deg, #FF6B9D 0%, #B794F6 100%)',
      },
      fontFamily: {
        'display': ['system-ui', 'sans-serif'],
      },
      spacing: {
        'felora-4': '4px',
        'felora-8': '8px',
        'felora-12': '12px',
        'felora-16': '16px',
        'felora-24': '24px',
        'felora-32': '32px',
      },
      borderRadius: {
        'felora-8': '8px',
        'felora-12': '12px',
        'felora-16': '16px',
        'felora-24': '24px',
      },
      fontSize: {
        'felora-12': '12px',
        'felora-14': '14px',
        'felora-16': '16px',
        'felora-20': '20px',
        'felora-24': '24px',
        'felora-32': '32px',
      },
      boxShadow: {
        'felora-1': '0 8px 24px rgba(0, 0, 0, 0.4)',
        'felora-inner-1': 'inset 0 1px 0 rgba(255, 255, 255, 0.06)',
        'felora-glow-1': '0 0 0 2px rgba(255, 255, 255, 0.06)',
      },
      backdropBlur: {
        'felora': '12px',
      },
    },
  },
  darkMode: "class",
  plugins: [],
};