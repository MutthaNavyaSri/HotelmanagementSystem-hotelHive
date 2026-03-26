/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#0F3D3E',
        secondary: '#E2C799',
        accent: '#2C666E',
        highlight: '#E2C799',
        background: '#F7F7F7',
      }
    },
  },
  plugins: [],
}

