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

module.exports = {
  theme: {
    extend: {
      borderRadius: {
        "3xl": "2rem", // si tu veux un 3xl
        "4xl": "2.5rem", // et même un 4xl
      },
    },
  },
};
