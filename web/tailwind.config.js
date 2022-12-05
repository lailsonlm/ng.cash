/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
  ],
  theme: {
    fontFamily: {
      sans: 'IBM Plex Sans, sans-serif'
    },
    extend: {},
  },
  plugins: [],
}