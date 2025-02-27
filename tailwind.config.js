/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./**/*.{html,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Custom colors to match your current design
        background: {
          dark: '#121212',
          card: 'rgba(30, 30, 30, 0.9)',
        },
        spotify: {
          blue: '#89E4FF',
        },
      },
      fontFamily: {
        inter: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        card: '0 4px 10px rgba(0, 0, 0, 0.5)',
      },
    },
  },
  plugins: [],
}