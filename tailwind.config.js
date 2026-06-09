/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: [
    "./index.html",
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      colors: {
        ig: {
          orange: "#f09433",
          coral:  "#e6683c",
          red:    "#dc2743",
          pink:   "#cc2366",
          purple: "#bc1888",
        },
      },
      backgroundImage: {
        "ig-gradient": "linear-gradient(135deg,#f09433 0%,#e6683c 22%,#dc2743 45%,#cc2366 72%,#bc1888 100%)",
      },
      keyframes: {
        "fade-in": {
          "0%":   { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "0%":   { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.2s ease-out",
        shimmer:   "shimmer 1.5s infinite",
      },
    },
  },
  plugins: [],
}
