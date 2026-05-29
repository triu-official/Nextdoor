/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#4f46e5', // Indigo
        secondary: '#10b981', // Emerald
        dark: '#1f2937'
      }
    },
  },
  plugins: [],
}
