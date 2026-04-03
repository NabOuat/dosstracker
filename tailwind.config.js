/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Palette DosTracker – Côte d'Ivoire
        orange: {
          DEFAULT: '#F47920',
          light:   '#F9A05A',
          pale:    '#FEF0E4',
          dark:    '#C85E08',
        },
        green: {
          DEFAULT: '#00853F',
          light:   '#43B074',
          pale:    '#E4F5EC',
          dark:    '#005C2B',
        },
        neutral: {
          900: '#0F1923',
          800: '#1C2B3A',
          700: '#2D3F50',
          500: '#64748B',
          400: '#94A3B8',
          200: '#E2E8F0',
          100: '#F1F5F9',
        },
        cream: '#FDF8F3',
        'off-white': '#F8F9FA',
      },
      fontFamily: {
        display: ['Outfit', 'sans-serif'],
        body:    ['Nunito', 'sans-serif'],
      },
      borderRadius: {
        sm:   '8px',
        md:   '14px',
        lg:   '24px',
        xl:   '36px',
        full: '9999px',
      },
      boxShadow: {
        sm:     '0 2px 8px rgba(15,25,35,0.06)',
        md:     '0 8px 32px rgba(15,25,35,0.10)',
        lg:     '0 20px 60px rgba(15,25,35,0.14)',
        orange: '0 8px 32px rgba(244,121,32,0.25)',
        green:  '0 8px 32px rgba(0,133,63,0.20)',
      },
      animation: {
        'pulse-glow': 'pulse-glow 4s ease-in-out infinite',
        float:        'float 6s ease-in-out infinite',
        'slide-up':   'slideUp 0.8s ease forwards',
        'fade-in':    'fadeIn 0.3s ease forwards',
        'pulse-step': 'pulseStep 2s infinite',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { transform: 'scale(1)', opacity: '1' },
          '50%':      { transform: 'scale(1.1)', opacity: '0.7' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-12px)' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(40px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
        pulseStep: {
          '0%, 100%': { boxShadow: '0 4px 20px rgba(244,121,32,0.45)' },
          '50%':      { boxShadow: '0 4px 30px rgba(244,121,32,0.7), 0 0 0 8px rgba(244,121,32,0.1)' },
        },
      },
    },
  },
  plugins: [],
}
