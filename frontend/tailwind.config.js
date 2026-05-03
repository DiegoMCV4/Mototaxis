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
        primary: '#111827', // Black / Gray-900
        secondary: '#2563EB', // Blue-600
      }
    },
  },
  plugins: [],
}
