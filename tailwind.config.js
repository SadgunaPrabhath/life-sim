/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    screens: {
      xs: '420px',
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1536px',
    },
    extend: {
      fontFamily: {
        sans: ['Sora', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      colors: {
        bg: {
          DEFAULT: '#070a14',
          soft: '#0b1020',
          card: '#111834',
        },
        accent: {
          DEFAULT: '#7c3aed',
          cyan: '#06b6d4',
          pink: '#ec4899',
          amber: '#f59e0b',
          green: '#22c55e',
          red: '#ef4444',
        },
      },
      boxShadow: {
        glow: '0 0 24px -4px rgba(124,58,237,0.55)',
        'glow-cyan': '0 0 24px -4px rgba(6,182,212,0.55)',
        card: '0 8px 32px -8px rgba(0,0,0,0.6)',
      },
      backgroundImage: {
        'grid-glow':
          'radial-gradient(circle at 20% 10%, rgba(124,58,237,0.18), transparent 45%), radial-gradient(circle at 85% 90%, rgba(6,182,212,0.16), transparent 45%)',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.92)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'slide-up': {
          '0%': { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'float-up': {
          '0%': { opacity: '0', transform: 'translateY(0)' },
          '15%': { opacity: '1' },
          '100%': { opacity: '0', transform: 'translateY(-40px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(124,58,237,0.5)' },
          '50%': { boxShadow: '0 0 24px 6px rgba(124,58,237,0.25)' },
        },
        pop: {
          '0%': { transform: 'scale(0.6)', opacity: '0' },
          '60%': { transform: 'scale(1.08)', opacity: '1' },
          '100%': { transform: 'scale(1)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.4s ease-out both',
        'scale-in': 'scale-in 0.3s ease-out both',
        'slide-up': 'slide-up 0.45s cubic-bezier(0.16,1,0.3,1) both',
        'float-up': 'float-up 1.6s ease-out forwards',
        shimmer: 'shimmer 2.5s linear infinite',
        'pulse-glow': 'pulse-glow 2.5s ease-in-out infinite',
        pop: 'pop 0.5s cubic-bezier(0.16,1,0.3,1) both',
      },
    },
  },
  plugins: [],
}
