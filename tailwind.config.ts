import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'sans-serif'],
        'headline-md': ['Plus Jakarta Sans', 'sans-serif'],
        'body-lg': ['Plus Jakarta Sans', 'sans-serif'],
        'label-xs': ['Plus Jakarta Sans', 'sans-serif'],
        'display-lg': ['Plus Jakarta Sans', 'sans-serif'],
        'label-sm': ['Plus Jakarta Sans', 'sans-serif'],
        'display-lg-mobile': ['Plus Jakarta Sans', 'sans-serif'],
        'body-md': ['Plus Jakarta Sans', 'sans-serif'],
      },
      fontSize: {
        'headline-md': ['24px', { lineHeight: '1.4', fontWeight: '600' }],
        'body-lg': ['18px', { lineHeight: '1.6', fontWeight: '400' }],
        'label-xs': ['12px', { lineHeight: '1', fontWeight: '600' }],
        'display-lg': ['48px', { lineHeight: '1.2', letterSpacing: '-0.02em', fontWeight: '700' }],
        'label-sm': ['14px', { lineHeight: '1.2', letterSpacing: '0.01em', fontWeight: '500' }],
        'display-lg-mobile': ['32px', { lineHeight: '1.2', fontWeight: '700' }],
        'body-md': ['16px', { lineHeight: '1.6', fontWeight: '400' }],
      },
      spacing: {
        'margin-mobile': '16px',
        'margin-tablet': '40px',
        'margin-desktop': '80px',
        'gutter': '24px',
        'base': '8px',
      },
      maxWidth: {
        'max-width': '1280px',
      },
      colors: {
        academic: {
          surface: '#101415',
          'surface-bright': '#363a3b',
          'surface-container': '#1d2022',
          primary: '#b3c5ff',
          'primary-container': '#0066ff',
          'on-primary': '#002b75',
          secondary: '#b9c7e4',
          'secondary-container': '#3c4962',
          tertiary: '#ffb59d',
          background: '#101415',
          'on-background': '#e0e3e5',
          navy: '#0A192F',
          blue: '#0066FF',
        },
        gold: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
        },
        'on-surface-variant': '#c2c6d8',
        'surface-container-lowest': '#0b0f10',
        'surface-bright': '#363a3b',
        'secondary-fixed': '#d6e3ff',
        'inverse-surface': '#e0e3e5',
        'primary-fixed': '#dae1ff',
        'on-tertiary-container': '#fff6f4',
        'secondary-container': '#3c4962',
        'tertiary-fixed-dim': '#ffb59d',
        'outline-variant': '#424656',
        'on-primary-container': '#f8f7ff',
        'tertiary': '#ffb59d',
        'on-secondary-container': '#abb9d6',
        'on-surface': '#e0e3e5',
        'on-error': '#690005',
        'on-primary': '#002b75',
        'surface': '#101415',
        'primary-container': '#0066ff',
        'inverse-on-surface': '#2d3133',
        'surface-tint': '#b3c5ff',
        'surface-container-highest': '#323537',
        'surface-dim': '#101415',
        'primary-fixed-dim': '#b3c5ff',
        'background': '#101415',
        'secondary': '#b9c7e4',
        'error-container': '#93000a',
        'surface-container-high': '#272a2c',
        'on-secondary-fixed-variant': '#39475f',
        'on-tertiary-fixed-variant': '#832600',
        'tertiary-fixed': '#ffdbd0',
        'inverse-primary': '#0054d6',
        'on-tertiary': '#5d1900',
        'on-background': '#e0e3e5',
        'on-error-container': '#ffdad6',
        'surface-container': '#1d2022',
        'on-tertiary-fixed': '#390c00',
        'on-primary-fixed': '#001849',
        'on-secondary-fixed': '#0d1c32',
        'secondary-fixed-dim': '#b9c7e4',
        'tertiary-container': '#cc4204',
        'on-secondary': '#233148',
        'primary': '#b3c5ff',
        'outline': '#8c90a1',
        'on-primary-fixed-variant': '#003fa4',
        'error': '#ffb4ab',
        'surface-container-low': '#191c1e',
        'surface-variant': '#323537',
      },
      animation: {
        'shimmer': 'shimmer 2s infinite',
        'completion-glow': 'completionGlow 2s ease-in-out infinite',
        'celebration-bounce': 'celebrationBounce 1s ease-in-out',
      },
      keyframes: {
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' }
        },
        completionGlow: {
          '0%, 100%': { 
            boxShadow: '0 0 20px rgba(255, 215, 0, 0.3)' 
          },
          '50%': { 
            boxShadow: '0 0 40px rgba(255, 215, 0, 0.6), 0 0 60px rgba(255, 215, 0, 0.4)' 
          }
        },
        celebrationBounce: {
          '0%, 20%, 50%, 80%, 100%': { 
            transform: 'translateY(0) scale(1)' 
          },
          '40%': { 
            transform: 'translateY(-8px) scale(1.1)' 
          },
          '60%': { 
            transform: 'translateY(-4px) scale(1.05)' 
          }
        }
      }
    },
  },
  plugins: [],
}

export default config
