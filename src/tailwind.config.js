/** @type {import('tailwindcss').Config} */
const config = {
  // content: lists every file that might contain Tailwind class names.
  // Tailwind scans these at build time and removes any classes NOT found here,
  // keeping the final CSS bundle as small as possible.
  content: [
    './index.html',
    './src/**/*.{js,jsx}',   // All JS and JSX files inside /src
  ],
  theme: {
    extend: {
      // Custom colour tokens for the project's design system.
      // These become usable as Tailwind classes, e.g. bg-navy or text-brand
      colors: {
        navy:  '#4A1B1B',
        brand: '#A32E2E',
      },
      // Custom font family so we can write font-body in JSX
      fontFamily: {
        body: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;