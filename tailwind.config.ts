import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // 1930s/40s palette — vintage Hollywood / Variety trade press
        ivory: "#F1E6CB",     // aged paper
        cream: "#E8D9B8",     // warmer cream
        sepia: "#D9C49A",
        oxblood: "#5C1A1B",   // deep burgundy / RKO red
        burgundy: "#7B2D2E",
        forest: "#2F4A3A",    // dark theatre green
        brass: "#B8923A",     // brass / gold leaf
        gilt: "#D4A94A",      // brighter gold accent
        ink: "#1A1612",       // black ink
        smoke: "#3A332B",     // soft black
        terracotta: "#A4503A",
        ledger: "#6B5536",    // ledger brown
      },
      fontFamily: {
        display: ["var(--font-limelight)", "serif"],          // marquee headlines
        deco: ["var(--font-cinzel)", "serif"],                // section titles, all caps
        serif: ["var(--font-playfair)", "Georgia", "serif"],  // editorial body
        body: ["var(--font-crimson)", "Georgia", "serif"],    // narrative body
        mono: ["var(--font-special-elite)", "ui-monospace", "monospace"],
      },
      letterSpacing: {
        marquee: "0.15em",
        deco: "0.22em",
      },
      backgroundImage: {
        "deco-rays":
          "repeating-conic-gradient(from 0deg at 50% 100%, rgba(184,146,58,0.18) 0deg 4deg, transparent 4deg 12deg)",
        "paper":
          "radial-gradient(ellipse at 30% 20%, rgba(184,146,58,0.08), transparent 60%), radial-gradient(ellipse at 80% 80%, rgba(92,26,27,0.08), transparent 60%)",
      },
      boxShadow: {
        deco: "0 0 0 2px #B8923A inset, 0 0 0 4px #1A1612 inset, 0 0 0 6px #B8923A inset",
        plate: "0 8px 30px -12px rgba(26,22,18,0.45)",
      },
    },
  },
  plugins: [],
};
export default config;
