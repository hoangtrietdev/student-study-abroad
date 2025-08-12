import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
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
