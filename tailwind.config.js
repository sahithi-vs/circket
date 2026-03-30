/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        pitch: {
          50:  '#f0faf4',
          100: '#dcf4e8',
          200: '#bbe8d4',
          300: '#87d4b2',
          400: '#4db88a',
          500: '#289c6b',
          600: '#1a7d55',
          700: '#166346',
          800: '#144f39',
          900: '#114130',
          950: '#08291e',
        },
        cricket: {
          red:    '#c0392b',
          gold:   '#f39c12',
          dark:   '#0f1923',
          darker: '#080f16',
          card:   '#131f2b',
          border: '#1e2f40',
        }
      },
      fontFamily: {
        display: ['Barlow Condensed', 'sans-serif'],
        body:    ['DM Sans', 'sans-serif'],
        mono:    ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      }
    },
  },
  plugins: [],
}
