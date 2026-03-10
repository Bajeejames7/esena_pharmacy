/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'glass-blue': '#3B82F6',      // Primary blue
        'glass-blue-light': '#60A5FA', // Lighter blue
        'glass-blue-dark': '#1E40AF',   // Darker blue
        'glass-green': '#10B981',       // Primary green
        'glass-green-light': '#34D399', // Lighter green
        'glass-green-dark': '#047857',  // Darker green
        'glass-white': '#FFFFFF',       // Pure white
        'glass-gray': '#F8FAFC',        // Light gray for backgrounds
        'glass-gray-dark': '#1E293B',   // Dark gray for dark mode
      },
      fontFamily: {
        'poppins': ['Poppins', 'sans-serif'],
        'inter': ['Inter', 'sans-serif'],
      },
      backdropBlur: {
        'glass': '15px',
      },
      borderRadius: {
        'glass': '15px',
      },
      boxShadow: {
        'glass': '0 8px 32px rgba(0, 0, 0, 0.1)',
        'glass-hover': '0 12px 40px rgba(0, 0, 0, 0.15)',
      },
      screens: {
        'mobile': {'max': '767px'},
        'tablet': {'min': '768px', 'max': '1024px'},
        'desktop': {'min': '1025px'},
      },
    },
  },
  plugins: [],
}
