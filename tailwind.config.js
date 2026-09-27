/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        cream: '#FFF8F0',
        pink: { DEFAULT: '#FFD6E8', dark: '#FF8FB8' },
        yellow: { DEFAULT: '#FFF3B0', dark: '#FFD93D' },
        mint: { DEFAULT: '#D4F5E9', dark: '#6FCF97' },
        lavender: { DEFAULT: '#E8DFFF', dark: '#B39DFF' },
        warmgray: '#4A4442',
      },
      borderRadius: {
        xl2: '1.25rem',
      },
    },
  },
  plugins: [],
}
