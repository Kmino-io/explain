/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'sui-blue': '#4DA2FF',
        'sui-dark': '#1A1B1F',
      },
    },
  },
  plugins: [],
}

