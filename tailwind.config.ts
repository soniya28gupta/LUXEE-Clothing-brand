import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        snitch: {
          black: "#0a0a0a",
          dark: "#121212",
          gray: "#737373",
          lightGray: "#f4f4f4",
          border: "#e5e5e5",
          red: "#e53935",
          green: "#16a34a",
          gold: "#d97706"
        }
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "sans-serif"],
        heading: ["Montserrat", "Inter", "sans-serif"],
      },
      letterSpacing: {
        tightest: "-0.04em",
        tighter: "-0.02em",
        wideBrand: "0.15em"
      }
    },
  },
  plugins: [],
};
export default config;
