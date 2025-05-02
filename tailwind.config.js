/** @type {import('tailwindcss').Config} */
module.exports = {
  
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./pages/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
  safelist: [
    'bg-blue-600',   'hover:bg-blue-700',
    'bg-green-600',  'hover:bg-green-700',
    'bg-orange-600', 'hover:bg-orange-700',
    'bg-purple-600', 'hover:bg-purple-700',
    'text-white',
  ],
}
