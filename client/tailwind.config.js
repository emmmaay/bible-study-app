
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: 'hsl(207, 100%, 97%)',
          100: 'hsl(207, 100%, 93%)',
          500: 'hsl(207, 90%, 54%)',
          600: 'hsl(207, 90%, 54%)',
          700: 'hsl(207, 90%, 40%)',
          900: 'hsl(207, 90%, 20%)',
        },
        secondary: {
          50: 'hsl(39, 100%, 97%)',
          100: 'hsl(39, 100%, 89%)',
          500: 'hsl(39, 100%, 50%)',
          600: 'hsl(39, 100%, 47%)',
        },
        success: {
          50: 'hsl(120, 50%, 95%)',
          100: 'hsl(120, 50%, 90%)',
          500: 'hsl(120, 50%, 50%)',
          600: 'hsl(120, 50%, 45%)',
        }
      }
    },
  },
  plugins: [],
}
