import type { Config } from 'tailwindcss'
const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        accent: {
          50: '#f0f9ff', 100: '#e0f2fe', 200: '#bae6fd', 300: '#7dd3fc',
          400: '#38bdf8', 500: '#0284c7', 600: '#0369a1', 700: '#075985',
          800: '#0c4a6e', 900: '#082f49',
        },
        esi: { 1: '#ef4444', 2: '#f97316', 3: '#eab308', 4: '#22c55e', 5: '#3b82f6' },
        surface: {
          dark: '#0a0a1a', darker: '#050510', card: 'rgba(15,15,35,0.6)',
          light: 'rgba(30,30,60,0.4)',
        },
        cyan: { 400: '#22d3ee', 500: '#06b6d4' },
      },
      backdropBlur: { glass: '16px', 'glass-heavy': '24px', 'glass-ultra': '40px' },
      boxShadow: {
        glass: '0 8px 32px rgba(2,132,199,0.15)',
        'glass-strong': '0 8px 32px rgba(2,132,199,0.25)',
        glow: '0 0 40px rgba(2,132,199,0.3)',
        'glow-lg': '0 0 80px rgba(2,132,199,0.4)',
        'esi-1': '0 0 20px rgba(239,68,68,0.4)',
        'esi-2': '0 0 20px rgba(249,115,22,0.4)',
        'esi-3': '0 0 20px rgba(234,179,8,0.3)',
        'esi-4': '0 0 20px rgba(34,197,94,0.3)',
        'esi-5': '0 0 20px rgba(59,130,246,0.3)',
        'neon-purple': '0 0 5px #0284c7, 0 0 20px rgba(2,132,199,0.3), 0 0 40px rgba(2,132,199,0.1)',
      },
      animation: {
        'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'float-delayed': 'float 6s ease-in-out 2s infinite',
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.6s ease-out',
        'slide-in-right': 'slideInRight 0.5s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 8s linear infinite',
        'gradient-x': 'gradientX 6s ease infinite',
        'shimmer': 'shimmer 2s ease-in-out infinite',
      },
      keyframes: {
        'glow-pulse': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(2,132,199,0.2)' },
          '50%': { boxShadow: '0 0 40px rgba(2,132,199,0.5)' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        gradientX: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
};
export default config;
