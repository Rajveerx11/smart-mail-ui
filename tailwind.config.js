/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      /* ===== COLORS (Gmail + Gemini vibe) ===== */
      colors: {
        primary: "#6366f1",   // indigo
        secondary: "#22c55e", // green
        dark: "#0f172a",
        card: "#1e293b",
      },

      /* ===== SHADOWS (Premium look) ===== */
      boxShadow: {
        soft: "0 10px 30px rgba(0,0,0,0.08)",
        glow: "0 0 25px rgba(99,102,241,0.35)",
        neon: "0 0 20px rgba(34,197,94,0.45)",
      },

      /* ===== BORDER RADIUS ===== */
      borderRadius: {
        xl: "1rem",
        '2xl': "1.5rem",
      },

      /* ===== ANIMATIONS (Gemini feel) ===== */
      keyframes: {
        fadeInUp: {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        pulseGlow: {
          "0%, 100%": { boxShadow: "0 0 0 rgba(99,102,241,0)" },
          "50%": { boxShadow: "0 0 20px rgba(99,102,241,0.5)" },
        },
      },

      animation: {
        fade: "fadeInUp 0.4s ease-out",
        glow: "pulseGlow 2s infinite",
      },
    },
  },
  plugins: [],
};
