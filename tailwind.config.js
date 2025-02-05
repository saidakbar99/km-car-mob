/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all of your component files.
  content: ["./app/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors:{
        blue: {
          DEFAULT: '#002A50'
        },
        red: {
          DEFAULT: '#e31e24'
        }
      },
      fontFamily: {
        hyundai: ['HyundaiSans', 'sans-serif'],
      },
    },
  },
  plugins: [],
}