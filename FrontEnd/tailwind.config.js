/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ivory: "#F8F4EF",
        blush: "#FFFCF9",
        petal: "#E8D6D1",
        clay: "#8F6860",
        terracotta: "#A46A62",
        shell: "#F3E8E4",
        taupe: "#D8C8BF",
        rose: "#C99695",
        ink: "#2D2623",
        charcoal: "#3B302C",
        secondary: "#635852",
        muted: "#776C66",
        softGray: "#E8DDD8",
        sale: "#A45D5D",
        olive: "#6E8F71",
        white: "#FFFDFB",
      },
      boxShadow: {
        soft: "0 18px 42px rgba(56, 42, 37, 0.09)",
        card: "0 10px 26px rgba(56, 42, 37, 0.08)",
      },
      fontFamily: {
        sans: [
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "sans-serif",
        ],
        display: [
          "Playfair Display",
          "Georgia",
          "Cambria",
          "Times New Roman",
          "serif",
        ],
      },
    },
  },
  plugins: [],
};
