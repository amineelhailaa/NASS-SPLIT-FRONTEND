/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        cerulean: {
          50: '#eef4f7',
          100: '#dceaef',
          200: '#bad5de',
          300: '#97bfce',
          500: '#5295ad',
          600: '#41778b',
          700: '#315968',
          800: '#213c45',
          900: '#101e23',
        },
        brand: {
          background: '#eef4f7',
          surface: '#dceaef',
          surfaceContrast: '#ffffff',
          border: '#bad5de',
          primary: '#41778b',
          primaryHover: '#315968',
          accent: '#5295ad',
          text: '#101e23',
          textSecondary: '#213c45',
          disabled: '#97bfce',
        },
      },
    },
  },
  plugins: [],
}
