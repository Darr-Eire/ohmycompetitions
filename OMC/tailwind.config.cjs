/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
    './pages/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '10%': { transform: 'translateX(0%)' },  // ✨ Hold for ~10% of the animation time
          '100%': { transform: 'translateX(-100%)' },
        },
      },
      animation: {
        marquee: 'marquee 25s linear infinite',
      },
    },
  },
  plugins: [
    require('@tailwindcss/aspect-ratio'),
    require('tailwind-scrollbar-hide'),
  ],
  safelist: [
    'from-blue-600',
    'from-green-500',
    'from-orange-500',
    'from-purple-600',
    'from-gray-800',
    'to-transparent',
    'bg-blue-600',
    'hover:bg-blue-700',
    'bg-green-600',
    'hover:bg-green-700',
    'bg-orange-600',
    'hover:bg-orange-700',
    'bg-purple-600',
    'hover:bg-purple-700',
    'text-white',
  ],
};
