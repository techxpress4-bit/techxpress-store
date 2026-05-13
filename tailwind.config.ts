import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "#0A0A0A",
        surface: "#111111",
        card: "#161616",
        border: "#2A2A2A",
        violet: {
          DEFAULT: "#6B3FA0",
          light: "#8B5FC0",
          dark: "#4E2D7A",
          glow: "rgba(107,63,160,0.35)",
        },
        dz: {
          green: "#006233",
          red: "#D21034",
        },
        text: {
          primary: "#F5F5F5",
          secondary: "#9CA3AF",
          muted: "#6B7280",
        },
      },
      fontFamily: {
        syne: ["var(--font-heading-var)", "Outfit", "Arial", "sans-serif"],
        dm: ["var(--font-body-var)", "Inter", "system-ui", "sans-serif"],
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease forwards",
        "slide-up": "slideUp 0.4s ease forwards",
        "pulse-glow": "pulseGlow 2s ease-in-out infinite",
        "float": "float 3s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        slideUp: {
          from: { opacity: "0", transform: "translateY(20px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        pulseGlow: {
          "0%, 100%": { boxShadow: "0 0 15px rgba(107,63,160,0.4)" },
          "50%": { boxShadow: "0 0 30px rgba(107,63,160,0.8)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-8px)" },
        },
      },
      backgroundImage: {
        "hero-gradient":
          "radial-gradient(ellipse at 50% -10%, rgba(107,63,160,0.25) 0%, transparent 65%)",
        "card-gradient":
          "linear-gradient(135deg, rgba(107,63,160,0.08) 0%, transparent 100%)",
        "violet-gradient":
          "linear-gradient(135deg, #6B3FA0 0%, #4E2D7A 100%)",
      },
    },
  },
  plugins: [],
};

export default config;
