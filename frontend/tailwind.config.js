/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#9333ea',
          dark: '#7e22ce',
        },
        secondary: {
          DEFAULT: '#ec4899',
          dark: '#db2777',
        },
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #9333ea 0%, #ec4899 100%)',
      },
    },
  },
  plugins: [],
}
