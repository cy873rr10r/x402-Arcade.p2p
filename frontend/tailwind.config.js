module.exports = {
  content: [
    "./pages/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
    "./app/**/*.{js,jsx}"
  ],
  theme: {
    extend: {
      colors: {
        arcadeBg: "#0f1020",
        neonYellow: "#ffd54a",
        neonAccent: "#ffb86b",
        panel: "#11121a",
      },
      fontFamily: {
        retro: ["'Press Start 2P'", "monospace"],
      }
    },
  },
  plugins: [],
}
