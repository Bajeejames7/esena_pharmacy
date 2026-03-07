/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'glass-blue': '#A0D8F1',
        'glass-green': '#B4E7C1',
      },
      backdropBlur: {
        'glass': '15px',
      },
    },
  },
  plugins: [],
}
