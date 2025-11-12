/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'spotify-green': '#1db954',
        'bg-primary': '#1a1a1a',
        'bg-secondary': '#2d2d2d',
      },
      backgroundImage: {
        'gradient-dark': 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
      },
    },
  },
  plugins: [],
}


