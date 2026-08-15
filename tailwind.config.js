/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        display: ['Space Grotesk', 'sans-serif'],
        sans: ['Plus Jakarta Sans', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        'brutal-sm': '2px 2px 0px 0px #000000',
        'brutal': '4px 4px 0px 0px #000000',
        'brutal-lg': '6px 6px 0px 0px #000000',
        'brutal-xl': '8px 8px 0px 0px #000000',
        'brutal-white': '4px 4px 0px 0px #FFFFFF',
        'brutal-pink': '4px 4px 0px 0px #FF70A6',
        'brutal-yellow': '4px 4px 0px 0px #FFE600',
      },
      colors: {
        neo: {
          yellow: '#FFE600',
          pink: '#FF70A6',
          lime: '#CCFF00',
          cyan: '#00F5D4',
          orange: '#FF6B35',
          purple: '#8338EC',
          blue: '#3A86FF',
          bg: '#FAF8F5',
          card: '#FFFFFF',
          darkCard: '#18181B',
          black: '#000000',
          white: '#FFFFFF',
        },
        health: {
          dark: '#0B0F19',
          card: '#131B2E',
          border: '#1E293B',
          cyan: '#00F5D4',
          emerald: '#CCFF00',
          rose: '#FF70A6',
          amber: '#FFE600',
          purple: '#8338EC',
          blue: '#3A86FF'
        }
      },
      animation: {
        'marquee': 'marquee 25s linear infinite',
        'pulse-glow': 'pulseGlow 2s infinite ease-in-out',
        'float-slow': 'floatSlow 4s infinite ease-in-out',
        'fade-in': 'fadeIn 0.3s ease-out forwards',
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '0.4', transform: 'scale(1)' },
          '50%': { opacity: '1', transform: 'scale(1.05)' }
        },
        floatSlow: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' }
        },
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        }
      }
    },
  },
  plugins: [],
}
