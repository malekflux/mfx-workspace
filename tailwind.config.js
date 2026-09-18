/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0b58bd',
          light: '#2575fc',
          dark: '#073c82',
        }
      }
    },
  },
  plugins: [],
}