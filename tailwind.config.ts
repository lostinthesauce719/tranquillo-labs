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
        background: "#F8FAFC",
        surface: "#FFFFFF",
        "surface-mid": "#F1F5F9",
        border: "#CBD5E1",
        "text-primary": "#0F172A",
        "text-muted": "#64748B",
        brand: "#1B2A4A",
        accent: "#C47B2B",
        success: "#166534",
        warning: "#92400E",
        danger: "#991B1B",
        info: "#1E40AF",
      },
    },
  },
  plugins: [],
};
export default config;