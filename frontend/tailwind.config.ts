import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        canvas: "hsl(var(--color-canvas) / <alpha-value>)",
        ink: "hsl(var(--color-ink) / <alpha-value>)",
        brand: {
          50: "hsl(var(--color-brand-50) / <alpha-value>)",
          100: "hsl(var(--color-brand-100) / <alpha-value>)",
          200: "hsl(var(--color-brand-200) / <alpha-value>)",
          300: "hsl(var(--color-brand-300) / <alpha-value>)",
          400: "hsl(var(--color-brand-400) / <alpha-value>)",
          500: "hsl(var(--color-brand-500) / <alpha-value>)",
          600: "hsl(var(--color-brand-600) / <alpha-value>)",
          700: "hsl(var(--color-brand-700) / <alpha-value>)",
          800: "hsl(var(--color-brand-800) / <alpha-value>)",
          900: "hsl(var(--color-brand-900) / <alpha-value>)",
        },
        accent: {
          50: "hsl(var(--color-accent-50) / <alpha-value>)",
          100: "hsl(var(--color-accent-100) / <alpha-value>)",
          200: "hsl(var(--color-accent-200) / <alpha-value>)",
          300: "hsl(var(--color-accent-300) / <alpha-value>)",
          400: "hsl(var(--color-accent-400) / <alpha-value>)",
          500: "hsl(var(--color-accent-500) / <alpha-value>)",
          600: "hsl(var(--color-accent-600) / <alpha-value>)",
          700: "hsl(var(--color-accent-700) / <alpha-value>)",
          800: "hsl(var(--color-accent-800) / <alpha-value>)",
          900: "hsl(var(--color-accent-900) / <alpha-value>)",
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
          "radial-gradient(circle at top left, hsl(var(--color-brand-500) / 0.14), transparent 35%), radial-gradient(circle at bottom right, hsl(var(--color-accent-500) / 0.12), transparent 30%)",
      },
    },
  },
  plugins: [],
} satisfies Config;
