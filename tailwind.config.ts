import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}", "./components/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        parchment: "#f7f1e7",
        vellum: "#fbf7ef",
        ink: "#2f2a24",
        clay: "#9b6b43",
        moss: "#68745d",
        wheat: "#d9bf8c",
        ember: "#7d4e35"
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        serif: ["var(--font-serif)", "Georgia", "serif"]
      },
      boxShadow: {
        soft: "0 18px 60px rgba(67, 50, 31, 0.12)"
      }
    }
  },
  plugins: []
};

export default config;
