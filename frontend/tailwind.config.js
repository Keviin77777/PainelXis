/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx,vue}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#006AE6',
          50: '#cce5ff',
          100: '#b8d9ff',
          200: '#a3cdff',
          300: '#7ab8ff',
          400: '#52a3ff',
          500: '#006AE6',
          600: '#1570d9',
          700: '#1159b3',
          800: '#0d428d',
          900: '#082e61',
        },
        success: {
          DEFAULT: '#00A261',
          light: '#01BF73',
          dark: '#0e7732',
        },
        danger: {
          DEFAULT: '#E42855',
          light: '#FF3767',
          dark: '#951836',
        },
        warning: {
          DEFAULT: '#C59A00',
          light: '#D9AA00',
          dark: '#735b02',
        },
        info: {
          DEFAULT: '#883FFF',
          light: '#9E63FF',
          dark: '#44228c',
        },
        // Cores neutras PURAS (sem tom azul) - baseadas no design original
        neutral: {
          50: '#F5F5F5',    // --bs-gray-900
          100: '#B5B7C8',   // --bs-gray-800
          200: '#9A9CAE',   // --bs-gray-700
          300: '#808290',   // --bs-gray-600
          400: '#636674',   // --bs-gray-500
          500: '#464852',   // --bs-gray-400
          600: '#363843',   // --bs-gray-300
          700: '#26272F',   // --bs-gray-200
          800: '#1B1C22',   // --bs-gray-100
          900: '#15171C',   // --bs-body-bg
          950: '#0F1014',   // --bs-page-bg
        }
      },
    },
  },
  plugins: [],
}
