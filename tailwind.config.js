/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: false, // 🔒 Désactive le dark mode de Tailwind
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        // Poppins importée dans globals.css via Google Fonts
        sans: ["Poppins", "Arial", "Helvetica", "sans-serif"],
      },
    },
  },
  plugins: [],
};
