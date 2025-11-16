/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#1A936F',
          light: '#35c186',
          dark: '#0f6b4d',
        },
        sand: '#f4ece1',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 8px 30px rgba(15, 23, 42, 0.12)',
      },
    },
  },
  plugins: [],
}

