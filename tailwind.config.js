/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./site.html",
    "./pages/**/*.html",
    "./admin/**/*.html",
    "./admin/shared/**/*.html",
    "./assets/js/**/*.js",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },
    },
  },
  plugins: [],
};
