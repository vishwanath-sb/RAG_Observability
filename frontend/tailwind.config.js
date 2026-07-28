/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          50: '#f7f7f2',
          100: '#ecebdc',
          200: '#d8d3bb',
          300: '#bcb38f',
          400: '#9a8c60',
          500: '#7c6f49',
          600: '#62573d',
          700: '#4b4331',
          800: '#322c21',
          900: '#181512',
          950: '#0d0b09',
        },
        mint: {
          50: '#edfdf8',
          100: '#d7f9ef',
          200: '#b0f1dd',
          300: '#7fe3c4',
          400: '#45cfa3',
          500: '#1bb284',
          600: '#13916c',
          700: '#116f54',
        },
        sand: {
          50: '#fbf6ee',
          100: '#f3e8d0',
          200: '#e8cfaa',
          300: '#d9b174',
          400: '#c38e45',
          500: '#a66f28',
        },
      },
      boxShadow: {
        soft: '0 20px 60px rgba(9, 8, 6, 0.22)',
      },
      backgroundImage: {
        'hero-grid':
          'radial-gradient(circle at top left, rgba(27, 178, 132, 0.25), transparent 30%), radial-gradient(circle at top right, rgba(196, 142, 69, 0.2), transparent 26%), linear-gradient(135deg, rgba(13, 11, 9, 0.98), rgba(24, 21, 18, 0.96))',
      },
    },
  },
  plugins: [],
}
