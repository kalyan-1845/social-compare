/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        darkbg: "#0B0F19",
        glasscard: "rgba(255, 255, 255, 0.03)",
        glassborder: "rgba(255, 255, 255, 0.08)",
        brandPurple: "#6D28D9",
        brandPink: "#DB2777",
        brandEmerald: "#10B981",
        brandRose: "#F43F5E"
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-glow": "radial-gradient(circle at center, rgba(109, 40, 217, 0.15) 0%, transparent 65%)",
      },
      animation: {
        "pulse-slow": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "spin-slow": "spin 8s linear infinite",
      }
    },
  },
  plugins: [],
}
