/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ens: {
          blue: {
            surface: '#EEF5FF',
          },
          grey: {
            surface: '#F6F6F6',
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
