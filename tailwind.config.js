/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        void: "#06070a",
        surface: "#0c0e15",
        elevated: "#131722",
        card: "rgba(15, 18, 28, 0.78)",
        "card-hover": "rgba(22, 27, 42, 0.92)",
        gold: {
          primary: "#c5a059",
          bright: "#e7ca7a",
          light: "#fff2cc",
          dark: "#785e2b",
          border: "rgba(197, 160, 89, 0.28)",
          glow: "rgba(231, 202, 122, 0.35)",
        },
        house: {
          gryffindor: "#740001",
          slytherin: "#1a472a",
          ravenclaw: "#0e1a40",
          hufflepuff: "#ecb939",
        },
      },
      fontFamily: {
        cinzel: ["Cinzel", "Georgia", "serif"],
        playfair: ["Playfair Display", "Georgia", "serif"],
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
        mono: ["JetBrains Mono", "Fira Code", "Courier New", "monospace"],
      },
      boxShadow: {
        gold: "0 0 25px rgba(197, 160, 89, 0.2)",
        "gold-lg": "0 0 45px rgba(231, 202, 122, 0.3)",
      },
    },
  },
  plugins: [],
};
