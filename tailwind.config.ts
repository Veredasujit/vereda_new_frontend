import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"], // ✅ All files inside src
  theme: {
    extend: {
      colors: {
       
        // accent: "#10B981", // Green
       
        dark: {
          100: "#1F2937",
          200: "#111827",
        },
      },
    },
  },
  plugins: [],
};

export default config;
