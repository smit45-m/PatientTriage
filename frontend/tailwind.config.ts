import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        accent: {
          50: '#faf5ff',
          100: '#f3e8ff',
          200: '#e9d5ff',
          300: '#d8b4fe',
          400: '#c084fc',
          500: '#a855f7',
          600: '#9333ea',
          700: '#7e22ce',
          800: '#6b21a8',
          900: '#581c87',
          950: '#3b0764',
        },
        brand: {
          purple: '#6D28D9',
          deep: '#4C1D95',
          indigo: '#4338CA',
          light: '#F5F3FF',
          border: '#E9D5FF',
        },
        esi: {
          1: '#ef4444',
          2: '#f97316',
          3: '#eab308',
          4: '#10b981',
          5: '#3b82f6',
        },
        surface: {
          bg: '#F8F9FC',
          card: '#FFFFFF',
          muted: '#F1F3F9',
          border: '#E2E8F0',
          dark: '#0f172a',
        },
      },
      boxShadow: {
        card: '0 1px 3px rgba(15, 23, 42, 0.03), 0 4px 16px -2px rgba(15, 23, 42, 0.04), 0 2px 12px -2px rgba(109, 40, 217, 0.03)',
        'card-hover': '0 8px 28px -4px rgba(109, 40, 217, 0.1), 0 4px 12px -2px rgba(15, 23, 42, 0.05)',
        'purple-sm': '0 2px 8px rgba(109, 40, 217, 0.12)',
        'purple-md': '0 6px 20px rgba(109, 40, 217, 0.16)',
        'purple-lg': '0 12px 36px rgba(109, 40, 217, 0.2)',
        'glass': '0 1px 2px rgba(15, 23, 42, 0.03), 0 8px 32px -4px rgba(15, 23, 42, 0.06)',
        'glass-hover': '0 12px 40px -8px rgba(15, 23, 42, 0.08), 0 4px 16px -4px rgba(109, 40, 217, 0.06)',
        'input-focus': '0 0 0 3px rgba(109, 40, 217, 0.08)',
      },
      transitionTimingFunction: {
        'premium': 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'float-delayed': 'float 6s ease-in-out 2s infinite',
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
