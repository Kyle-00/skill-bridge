/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        gold: { 50: '#fcf6e8', 100: '#f8edd1', 200: '#f0daa3', 300: '#e8c775', 400: '#e0b447', 500: '#d4a11e', 600: '#b38718', 700: '#926d13', 800: '#71530e', 900: '#4f3a09' }
      }
    },
  },
  plugins: [],
}