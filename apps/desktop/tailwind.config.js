/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/renderer/index.html',
    './src/renderer/src/**/*.{js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        background: '#0F0F1A',
        card: '#1A1A2E',
        accent: {
          DEFAULT: '#6C3CE1',
          light: '#8B5CF6'
        }
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        body: ['"DM Sans"', 'sans-serif']
      }
    }
  },
  plugins: []
}