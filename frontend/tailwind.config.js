/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        ivory: "var(--color-ivory)",
        ivorySoft: "var(--color-ivory-soft)",
        surface: "var(--color-surface)",
        border: "var(--color-border)",
        ink: "var(--color-ink)",
        inkSoft: "var(--color-ink-soft)",
        gold: "var(--color-gold)",
        goldDeep: "var(--color-gold-deep)",
        goldSoft: "var(--color-gold-soft)",
        maroon: "var(--color-maroon)",
        maroonDeep: "var(--color-maroon-deep)",
        success: "var(--color-success)",
        danger: "var(--color-danger)",
        warning: "var(--color-warning)",
      },
      fontFamily: {
        display: ["var(--font-display)"],
        body: ["var(--font-body)"],
      },
    },
  },
  plugins: [],
};
