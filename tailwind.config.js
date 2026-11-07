/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        emerald: {
          950: '#040C08',
          900: '#0A1F14',
          800: '#113322',
          700: '#184730',
          600: '#226143',
        },
        gold: {
          100: '#FFF6D6',
          300: '#F5D77F',
          400: '#E6BE53',
          500: '#D4AF37',
          600: '#AA8822',
          700: '#806312',
        },
      },
      fontFamily: {
        serif: ['var(--font-cinzel)', 'serif'],
        script: ['var(--font-cormorant)', 'serif'],
        sans: ['var(--font-jakarta)', 'sans-serif'],
      },
    },
  },
  plugins: [],
}