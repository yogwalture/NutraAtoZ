import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // ----- Brand palette (named tokens) -----
        alabaster: "#FAF9F6",
        emerald: {
          DEFAULT: "#0F4C43",
          50: "#EAF2F0",
          100: "#D2E3DF",
          600: "#0F4C43",
          700: "#0B3A33",
          800: "#082A25",
        },
        gold: "#C9A24B",
        ink: "#1C2421",
        mist: "#6B756F",

        // ----- shadcn/ui semantic tokens (HSL CSS vars) -----
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "ui-sans-serif", "system-ui", "sans-serif"],
        serif: ["var(--font-fraunces)", "Georgia", "serif"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(16,40,36,0.04), 0 8px 24px rgba(16,40,36,0.06)",
        "card-hover":
          "0 2px 4px rgba(16,40,36,0.06), 0 16px 40px rgba(16,40,36,0.10)",
        bar: "0 -1px 0 rgba(16,40,36,0.06), 0 -8px 24px rgba(16,40,36,0.06)",
      },
      borderRadius: {
        xl2: "1.25rem",
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "fade-in": {
          from: { opacity: "0", transform: "translateY(6px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.35s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
