/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "var(--bg)",
        "bg-surface": "var(--bg-surface)",
        "bg-surface-hover": "var(--bg-surface-hover)",
        "bg-elevated": "var(--bg-elevated)",
        border: "var(--border)",
        "border-subtle": "var(--border-subtle)",
        text: "var(--text)",
        "text-secondary": "var(--text-secondary)",
        "text-muted": "var(--text-muted)",
        accent: "var(--accent)",
        "accent-dim": "var(--accent-dim)",
        "accent-green": "var(--accent-green)",
        "accent-red": "var(--accent-red)",
        "accent-blue": "var(--accent-blue)",
        gold: "var(--gold)",
        silver: "var(--silver)",
        bronze: "var(--bronze)",
      },
      fontFamily: {
        sans: ["'Inter'", "system-ui", "-apple-system", "sans-serif"],
      },
      animation: {
        "fade-in-up": "fadeInUp 0.5s ease-out both",
        "podium-rise": "podiumRise 0.6s cubic-bezier(0.22,1,0.36,1) both",
        "pulse-gold": "pulseGold 2s ease-in-out infinite",
        "check-pop": "checkPop 0.35s cubic-bezier(0.22,1,0.36,1) both",
      },
    },
  },
  plugins: [],
};
