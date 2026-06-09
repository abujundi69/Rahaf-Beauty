/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ivory: "#FFF7FB",
        blush: "#FFF1F7",
        petal: "#F8BED3",
        clay: "#DB2777",
        terracotta: "#BE185D",
        shell: "#FFE4EF",
        taupe: "#F4A9C6",
        rose: "#F472A8",
        ink: "#2B1220",
        charcoal: "#7A1647",
        secondary: "#755264",
        muted: "#846678",
        softGray: "#F7DAE7",
        sale: "#E11D48",
        olive: "#2F9F6B",
        champagne: "#D8A950",
        white: "#FFFCFE",
      },
      boxShadow: {
        soft: "0 22px 58px rgba(190, 24, 93, 0.13)",
        card: "0 14px 34px rgba(190, 24, 93, 0.11)",
      },
      fontFamily: {
        sans: [
          "Tajawal",
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
