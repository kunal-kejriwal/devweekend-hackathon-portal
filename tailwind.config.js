/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#f0f4ff',
          100: '#e0e9ff',
          200: '#c2d4ff',
          300: '#93b4fe',
          400: '#608bfb',
          500: '#3b63f7',
          600: '#2445ec',
          700: '#1c34d9',
          800: '#1d2db0',
          900: '#1d2c8b',
          950: '#141b55',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
