/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#14213D',
        secondary: '#1F4068',
        accent: '#00B4D8',
        highlight: '#FFD60A',
        background: '#F1F5F9',
      }
    },
  },
  plugins: [],
}

