import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        espresso: {
          50: '#faf5f0',
          100: '#f4eae1',
          200: '#e8d4c3',
          300: '#d7b79e',
          400: '#c39578',
          500: '#b17b5b',
          600: '#9b6449',
          700: '#7e4f3a',
          800: '#674132',
          900: '#55372b',
          950: '#140c09',
        },
        mocha: {
          50: '#fbf7f4',
          100: '#f6eee8',
          200: '#eeddd2',
          300: '#dfc4b3',
          400: '#cda48f',
          500: '#bd8970',
          600: '#ab735a',
          700: '#8e5c46',
          800: '#754d3c',
          900: '#604133',
          950: '#1c130f',
        },
        caramel: {
          50: '#fef8ee',
          100: '#fbedd5',
          200: '#f7d8a9',
          300: '#f2bd73',
          400: '#eb9b3e',
          500: '#df7e1c',
          600: '#c46313',
          700: '#9e4a13',
          800: '#803c16',
          900: '#6b3316',
          950: '#3c1808',
        },
        latte: {
          50: '#fdfbf7',
          100: '#f9f4ec',
          200: '#f2e8d7',
          300: '#e7d5bb',
          400: '#d7bd99',
          500: '#c7a378',
          600: '#b58b5e',
          700: '#976f4a',
          800: '#7c5a3e',
          900: '#664a34',
          950: '#37261a',
        },
      },
    },
  },
  plugins: [],
};

export default config;
