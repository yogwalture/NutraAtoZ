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
        // ===== Brand palette — Vibrant Citrus + Berry =====
        // Warm cream canvas
        alabaster: "#FFF8F0",
        cream: "#FFF8F0",

        // NEW explicit accent tokens (use these in new components)
        coral: {
          DEFAULT: "#FF6B4A",
          50: "#FFF1EC",
          100: "#FFDDD1",
          200: "#FFBCA6",
          500: "#FF6B4A",
          600: "#F5502E",
          700: "#D93C1D",
        },
        berry: {
          DEFAULT: "#E63980",
          50: "#FDE9F1",
          100: "#FBD0E1",
          500: "#E63980",
          600: "#CE2870",
          700: "#A81A58",
        },
        amber: {
          DEFAULT: "#FFB020",
          50: "#FFF6E2",
          100: "#FFE9B8",
          500: "#FFB020",
          600: "#F59300",
        },
        plum: "#5B1E52",

        // ===== Legacy token names, REMAPPED to the citrus palette =====
        // Existing pages/components reference `emerald` (primary) and `gold`
        // (accent); remapping their values recolors the whole app at once.
        emerald: {
          DEFAULT: "#FF6B4A", // primary → coral
          50: "#FFF1EC",
          100: "#FFDDD1",
          600: "#FF6B4A",
          700: "#F5502E",
          800: "#D93C1D",
        },
        gold: "#E63980", // accent → berry
        ink: "#2A1A14", // warm espresso text
        mist: "#9A7B6E", // warm muted text

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
        card: "0 2px 6px rgba(217,60,29,0.06), 0 12px 32px rgba(217,60,29,0.08)",
        "card-hover":
          "0 4px 10px rgba(217,60,29,0.10), 0 22px 50px rgba(217,60,29,0.16)",
        bar: "0 -1px 0 rgba(217,60,29,0.06), 0 -10px 30px rgba(217,60,29,0.08)",
      },
      borderRadius: {
        xl3: "2rem",
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
