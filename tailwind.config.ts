import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        "haven-bg": "#F0EDE6",
        "haven-card": "#FDF8F2",
        "haven-accent": "#F8F1E5",
        "haven-blue": "#A8C5DA",
        "haven-blue-deep": "#7BA7C2",
        "haven-sand": "#C4A882",
        "haven-text": "#2D3748",
      },
      fontFamily: {
        heading: ["var(--font-heading)", "Georgia", "serif"],
        body: ["var(--font-body)", "DM Sans", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;