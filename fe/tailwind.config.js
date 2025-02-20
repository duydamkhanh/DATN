/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: [
    './node_modules/@medusajs/ui/dist/**/*.{js,jsx,ts,tsx}',
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        poppins: ['Poppins', 'sans-serif'],
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(-100%)' },
        },
      },
      animation: {
        marquee: 'marquee 30s linear infinite',
      },
    },
  },

  presets: [require('@medusajs/ui-preset')],
  plugins: [],

};
