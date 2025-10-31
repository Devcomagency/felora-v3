import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        felora: {
          void: '#000000',
          obsidian: '#0D0D0D',
          charcoal: '#1A1A1A',
          steel: '#2A2A2A',
          silver: '#F8F9FA',
          pearl: '#FFFFFF',
          aurora: '#FF6B9D',
          neon: '#00F5FF',
          plasma: '#B794F6',
          quantum: '#4FD1C7',
          neural: '#7C3AED',
        },
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #FF6B9D 0%, #B794F6 50%, #4FD1C7 100%)',
        'gradient-neural': 'linear-gradient(135deg, #7C3AED 0%, #B794F6 50%, #00F5FF 100%)',
        'gradient-felora': 'linear-gradient(135deg, #7000E3 0%, #E3008C 50%, #FF661B 100%)',
      },
      backdropBlur: {
        xs: '2px',
      },
      animation: {
        'gradient-shift': 'gradient-shift 15s ease infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        'gradient-shift': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
