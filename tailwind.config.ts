import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        haven: {
          bg: "#F0EDE6",
          card: "#FDF8F2",
          accent: "#F8F1E5",
          blue: "#A8C5DA",
          "blue-deep": "#7BA7C2",
          sand: "#C4A882",
          text: "#2D3748",
        },
      },
      fontFamily: {
        heading: ["Lora", "Georgia", "serif"],
        body: ["Nunito", "DM Sans", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;