/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        surface: {
          0: '#ffffff',
          50: '#f8f7f9',
          100: '#eeecf1',
          200: '#e5e4e7',
          300: '#c8c6cd',
          400: '#9a97a1',
          500: '#6b6375',
          600: '#4a4352',
          700: '#36303d',
          800: '#26222c',
          900: '#08060d',
        },
        brand: {
          50: '#f5f0ff',
          100: '#ebe0ff',
          200: '#d4c2ff',
          300: '#b393ff',
          400: '#8f5cff',
          500: '#6d28d9',
          600: '#5b21b6',
          700: '#4c1d95',
          800: '#3b1573',
          900: '#2e1065',
        },
        warm: {
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#f97316',
          600: '#ea580c',
          700: '#c2410c',
          800: '#9a3412',
        },
        success: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 4px 14px 0 rgba(0, 0, 0, 0.08)',
        'glow-orange': '0 0 24px rgba(249, 115, 22, 0.35)',
        elevated: '0 10px 40px -10px rgba(0, 0, 0, 0.15)',
      },
    },
  },
  plugins: [],
}
