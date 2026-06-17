export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#07140f",
        canopy: "#0f3f2e",
        mint: "#4ade80",
        sunrise: "#ffb454",
        berry: "#d946ef",
        lagoon: "#22d3ee",
        paper: "#f7fbf7"
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"]
      },
      boxShadow: {
        fintech: "0 24px 80px rgba(7, 20, 15, 0.24)"
      }
    }
  },
  plugins: []
};
