/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          black: '#0c0c0c',
          blackLight: '#1a1a1a',
          gold: '#b8860b',
          goldLight: '#d4a84b',
          goldMuted: 'rgba(184, 134, 11, 0.15)',
          burgundy: '#6b2d3a',
          burgundyLight: '#8b2942',
          burgundyMuted: 'rgba(107, 45, 58, 0.12)',
        },
      },
      fontFamily: {
        sans: ['DM Sans', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
