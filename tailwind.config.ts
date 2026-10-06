import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: {
          DEFAULT: "#F7F3EB",
          dark: "#E5D8C6",
        },
        sage: {
          DEFAULT: "#7D9279",
          dark: "#647560",
          soft: "#EDF1EA",
          deep: "#4C5B49", // залитые тёмные секции, cream на нём 6.5:1
          ink: "#586A54", // мелкий зелёный текст на светлом, 5.3:1
        },
        sand: "#EFE6D7",
        ink: {
          DEFAULT: "#2F352D",
          soft: "#4B4B43",
        },
        error: "#9A4A36",
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        sans: ["var(--font-body)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        "r-s": "14px",
        "r-m": "22px",
        "r-l": "32px",
        "r-xl": "44px",
      },
      boxShadow: {
        soft: "0 1px 2px rgba(47, 53, 45, .05), 0 14px 34px -14px rgba(47, 53, 45, .20)",
        lift: "0 2px 4px rgba(47, 53, 45, .05), 0 30px 60px -24px rgba(47, 53, 45, .28)",
      },
    },
  },
  plugins: [],
};

export default config;
