/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        cream: '#FFFDF8',
        line: '#ECEAF2',
        primary: { DEFAULT: '#7C6FF2', soft: '#EFEDFE' },
        pink: { DEFAULT: '#FFE3E8', dark: '#E5566F' },
        yellow: { DEFAULT: '#FFF0DA', dark: '#F5A340' },
        mint: { DEFAULT: '#E0F4EA', dark: '#3FA57A' },
        lavender: { DEFAULT: '#EFEDFE', dark: '#7C6FF2' },
        warmgray: '#292735',
        muted: '#777483',
      },
      borderRadius: { xl2: '0.75rem', card: '1.25rem' },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'sans-serif'],
        display: ['"Plus Jakarta Sans"', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
