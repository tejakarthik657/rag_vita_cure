/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        "primary": "#197fe6",
        "background-light": "#f6f7f8",
        "background-dark": "#111921",
        "surface-dark": "#1a2632",
      },
      fontFamily: {
        "display": ["Inter", "sans-serif"]
      },
    },
  },
  plugins: [require("@tailwindcss/forms")],
}