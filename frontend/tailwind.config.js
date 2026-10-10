/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./frontend/index.html",
    "./frontend/src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        // Display: bold geometric - editorial headings
        display: ['"Space Grotesk"', 'sans-serif'],
        // Body: neutral readable sans
        sans: ['Inter', '"Plus Jakarta Sans"', 'sans-serif'],
        // Technical/clinical metadata
        mono: ['"IBM Plex Mono"', '"JetBrains Mono"', 'monospace'],
      },
      colors: {
        // Primary editorial palette
        paper: '#F3F0E8',
        surface: '#FAF8F2',
        ink: '#080808',
        muted: '#525252',
        rule: '#B8B5AD',
        border: '#111111',
        // Signature interaction color
        yellow: { DEFAULT: '#FFE45C', hover: '#FFD700' },
        // Clinical semantic colors (reserved for meaning)
        teal: { DEFAULT: '#0D9488', light: '#CCFBF1', dark: '#0F766E' },
        amber: { DEFAULT: '#F59E0B', light: '#FEF3C7', dark: '#D97706' },
        danger: { DEFAULT: '#DC2626', light: '#FEE2E2', dark: '#B91C1C' },
        success: { DEFAULT: '#15803D', light: '#DCFCE7', dark: '#166534' },
        // Dark mode surfaces
        dark: {
          bg: '#090E17',
          surface: '#101A27',
          border: '#536171',
          text: '#F5F5F0',
          muted: '#94A3B8',
        }
      },
      boxShadow: {
        // Neo-Brutalist hard offset shadows
        'brutal-xs': '2px 2px 0 #080808',
        'brutal-sm': '3px 3px 0 #080808',
        'brutal':    '5px 5px 0 #080808',
        'brutal-lg': '7px 7px 0 #080808',
        'brutal-xl': '10px 10px 0 #080808',
        // Yellow accent shadow
        'brutal-yellow': '5px 5px 0 #FFE45C',
        // Dark mode brutal shadow
        'brutal-dark': '5px 5px 0 #536171',
        // Hover state (reduced offset)
        'brutal-hover': '2px 2px 0 #080808',
      },
      borderWidth: {
        '1': '1px',
        '2': '2px',
        '3': '3px',
      },
      animation: {
        'marquee': 'marquee 35s linear infinite',
        'fade-in': 'fadeIn 0.2s ease-out forwards',
        'slide-up': 'slideUp 0.2s ease-out forwards',
      },
      keyframes: {
        marquee: {
          '0%':   { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%':   { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      spacing: {
        '18': '4.5rem',
      },
    },
  },
  plugins: [],
}
