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
        // ===== Brand palette — Fresh Teal + Coral =====
        // Soft mint canvas
        alabaster: "#F4FBFA",
        cream: "#F4FBFA",

        // Coral — the accent / sale colour
        coral: {
          DEFAULT: "#FF6B4A",
          50: "#FFF1EC",
          100: "#FFDDD1",
          200: "#FFBCA6",
          500: "#FF6B4A",
          600: "#F5502E",
          700: "#D93C1D",
        },
        // Teal family (exposed as `berry` for legacy component references,
        // which used `berry` for brand/label accents — now on-palette teal).
        berry: {
          DEFAULT: "#0D9488",
          50: "#F0FDFA",
          100: "#CCFBF1",
          500: "#14B8A6",
          600: "#0D9488",
          700: "#0F766E",
        },
        // Amber — review stars / warnings
        amber: {
          DEFAULT: "#F59E0B",
          50: "#FFF7E6",
          100: "#FDE9B8",
          500: "#F59E0B",
          600: "#D97706",
        },
        plum: "#0F3D37", // deep teal (modal overlays)

        // ===== Legacy token names, REMAPPED to the teal palette =====
        // `emerald` (primary) → teal, `gold` (accent) → coral. Remapping these
        // recolours the whole app from one place.
        emerald: {
          DEFAULT: "#0D9488", // primary → teal
          50: "#F0FDFA",
          100: "#CCFBF1",
          600: "#0D9488",
          700: "#0F766E",
          800: "#115E56",
        },
        gold: "#FF6B4A", // accent → coral
        ink: "#10302B", // deep teal-charcoal text
        mist: "#5E7B76", // cool muted text

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
        card: "0 2px 6px rgba(13,148,136,0.07), 0 12px 32px rgba(13,148,136,0.09)",
        "card-hover":
          "0 4px 10px rgba(13,148,136,0.12), 0 22px 50px rgba(13,148,136,0.18)",
        bar: "0 -1px 0 rgba(13,148,136,0.07), 0 -10px 30px rgba(13,148,136,0.09)",
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
