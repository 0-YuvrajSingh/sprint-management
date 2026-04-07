import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        canvas: "#f4f7fb",
        ink: "#0f172a",
        brand: {
          50: "#eef6ff",
          100: "#d8ebff",
          200: "#b7dbff",
          300: "#85c4ff",
          400: "#4aa5ff",
          500: "#1f86ff",
          600: "#0066e1",
          700: "#0052b4",
          800: "#06458f",
          900: "#0b3d75",
        },
        accent: {
          50: "#fff4ef",
          100: "#ffe4d5",
          200: "#ffc3a5",
          300: "#ff9c70",
          400: "#ff6f3d",
          500: "#ff5622",
          600: "#ef4113",
          700: "#c63412",
          800: "#9d2d17",
          900: "#7f2917",
        },
        success: "#10b981",
        warning: "#f59e0b",
        danger: "#ef4444",
      },
      fontFamily: {
        sans: ["Plus Jakarta Sans", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["Space Grotesk", "Plus Jakarta Sans", "ui-sans-serif", "sans-serif"],
      },
      boxShadow: {
        soft: "0 20px 60px -28px rgba(15, 23, 42, 0.28)",
        panel: "0 16px 40px -24px rgba(15, 23, 42, 0.24)",
      },
      backgroundImage: {
        "hero-grid":
          "radial-gradient(circle at top left, rgba(31, 134, 255, 0.14), transparent 35%), radial-gradient(circle at bottom right, rgba(255, 86, 34, 0.12), transparent 30%)",
      },
    },
  },
  plugins: [],
} satisfies Config;
