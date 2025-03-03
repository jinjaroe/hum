/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./**/*.{html,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: {
          dark: '#121212',
          card: 'rgba(30, 30, 30, 0.9)',
        },
        humblue: {
          blue: '#3FBCFF',
        },
      },
      fontFamily: {
        inter: ['Inter', 'sans-serif'],
      },
      fontFamily: {
        chakra: ['"Chakra Petch"', 'sans-serif'],
      },
      fontWeight: {
        medium: '500',
        bold: '700',
      },
      boxShadow: {
        card: '0 4px 10px rgba(0, 0, 0, 0.5)',
      },
    },
  },
  plugins: [],
}