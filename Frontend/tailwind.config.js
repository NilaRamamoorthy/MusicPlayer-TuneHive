/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        inter: ["Inter", "sans-serif"],
        itim: ["Itim", "cursive"],
      },
      colors: {
        primary: "#D62B70",
        secondary: "#FFFFFF",
        ink50: "rgba(0,0,0,0.5)",
      },
      fontSize: {
        heading: "36px",
        subheading: "24px",
        body: "16px",
      },
    },
  },
  plugins: [],
};