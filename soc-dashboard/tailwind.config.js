/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        socDark: '#0b0f19',
        socPanel: '#111827',
        socBorder: '#1f2937'
      }
    },
  },
  plugins: [],
};