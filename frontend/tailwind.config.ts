import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        glass: {
          DEFAULT: "var(--bg-glass)",
          hover: "var(--bg-glass-hover)",
          elevated: "var(--bg-glass-elevated)",
          subtle: "var(--bg-glass-subtle)",
        },
        accent: {
          DEFAULT: "var(--accent-primary)",
          hover: "var(--accent-primary-hover)",
          glow: "var(--accent-glow)",
        },
      },
    },
  },
  plugins: [],
};

export default config;
