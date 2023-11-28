import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
        grid: 'url("/grid.svg")',
        "grid-css":
          "linear-gradient(to right, gray 1px, transparent 1px); linear-gradient(to bottom, gray 1px, transparent 1px);",
      },
    },
  },
  plugins: [],
};
export default config;
