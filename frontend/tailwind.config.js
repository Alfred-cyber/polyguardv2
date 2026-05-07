/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Syne"', 'sans-serif'],
        body:    ['"DM Sans"', 'sans-serif'],
        mono:    ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        brand: {
          50:  '#edfcf4',
          100: '#d3f8e4',
          200: '#aaf0cd',
          300: '#73e3af',
          400: '#3bce8d',
          500: '#17b374',
          600: '#0d9260',
          700: '#0c7450',
          800: '#0d5c41',
          900: '#0c4c37',
          950: '#052b1f',
        },
        slate: {
          950: '#020817',
        }
      },
      animation: {
        'pulse-slow':  'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-up':     'fadeUp 0.6s ease forwards',
        'fade-in':     'fadeIn 0.4s ease forwards',
        'slide-right': 'slideRight 0.5s ease forwards',
      },
      keyframes: {
        fadeUp: {
          '0%':   { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideRight: {
          '0%':   { transform: 'scaleX(0)', transformOrigin: 'left' },
          '100%': { transform: 'scaleX(1)', transformOrigin: 'left' },
        },
      },
    },
  },
  plugins: [],
}
