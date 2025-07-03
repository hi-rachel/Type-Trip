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
        primary: "#F6C851", // 더 진한 앰버
        accent: "#FCD34D", // 밝은 앰버
        highlight: "#FEF3C7", // 연한 앰버
      },
    },
  },
  plugins: [],
};
export default config;
