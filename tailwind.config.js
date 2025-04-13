/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: false, // 🔒 Désactive le dark mode de Tailwind
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
