/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ens: {
          blue: {
            primary: '#3889FF',
            surface: '#EEF5FF',
          },
          grey: {
            surface: '#F6F6F6',
          },
          yellow: {
            primary: '#E9B911',
          },
          red: {
            primary: '#C6301B',
          },
          additional: {
            border: '#E8E8E8',
          },
        },
      },
    },
  },
  plugins: [],
}
