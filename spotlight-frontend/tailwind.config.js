/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary': '#8b5cf6', // Purple
        'primary-dark': '#7c3aed',
        'primary-light': '#a78bfa',
        'accent': '#ec4899', // Pink
        'accent-dark': '#db2777',
        'bg-primary': '#0f0f23',
        'bg-secondary': '#1a1a2e',
        'bg-tertiary': '#16213e',
      },
      backgroundImage: {
        'gradient-dark': 'linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%)',
        'gradient-primary': 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)',
        'gradient-primary-hover': 'linear-gradient(135deg, #7c3aed 0%, #db2777 100%)',
      },
      boxShadow: {
        'glow': '0 0 20px rgba(139, 92, 246, 0.3)',
        'glow-lg': '0 0 40px rgba(139, 92, 246, 0.4)',
      },
    },
  },
  plugins: [],
}


