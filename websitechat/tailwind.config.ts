import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        paper: "#F5F0E6",   // graph-paper background
        ink: "#14213D",     // navy, used for text and outlines
        gold: "#C8A02B",    // accent fills
        lane: "#2F855A",    // bike-lane green
        signal: "#C8463C",  // delays and bad news
        board: "#0F1726",   // departure board
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "var(--font-sans)", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      boxShadow: {
        hard: "4px 4px 0 0 #14213D",
        "hard-sm": "2px 2px 0 0 #14213D",
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};

export default config;
