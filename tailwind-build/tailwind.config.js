/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    '../*.html',
    '../blog/*.html'
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        gold: { DEFAULT: '#D4AF37', light: '#E0C252', dark: '#B8960F' },
        midnight: { DEFAULT: '#1e293b', light: '#334155', dark: '#0f172a' },
        parchment: { DEFAULT: '#fdf6e3', dark: '#f5edd4' }
      }
    }
  },
  plugins: []
};
