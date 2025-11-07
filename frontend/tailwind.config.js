/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#2e7d32',
        secondary: '#1976d2',
        accent: '#ff6f00'
      }
    }
  },
  plugins: [],
}