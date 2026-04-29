/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  important: '#root',
  theme: {
    extend: {
      colors: {
        primary: {
          light: '#4dabf5',
          main: '#2196f3',
          dark: '#1769aa',
        },
        secondary: {
          light: '#f73378',
          main: '#f50057',
          dark: '#ab003c',
        },
        success: '#4caf50',
        error: '#f44336',
        warning: '#ff9800',
        info: '#2196f3',
      },
    },
  },
  corePlugins: {
    preflight: false,
  },
  plugins: [],
}
