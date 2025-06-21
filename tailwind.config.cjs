/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
    './pages/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [
    require('@tailwindcss/aspect-ratio'),
  ],
  safelist: [
    // gradients for FUT cards
    'from-blue-600',
    'from-green-500',
    'from-orange-500',
    'from-purple-600',
    'from-gray-800',
    'to-transparent',

    // bg & hover classes for your view-more buttons
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
}
