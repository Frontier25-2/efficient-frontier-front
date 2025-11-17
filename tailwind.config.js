/** @type {import('tailwindcss').Config} */
const config = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        "deep-blue": "#132440",
        "warning-red": "#BF092F",
        "safe-green": "#3B9797",
        "soft-white": "#F8FAFB",
        "pure-white": "#FFFFFF",
        black: "#000000",
      },
    },
  },
};
export default config;
