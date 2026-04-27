/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        heading: ['"Space Grotesk"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        accent: '#F05032',
        'surface': '#F6F8FA',
        'border': '#D0D7DE',
        'terminal': '#0D1117',
        'success': '#2DA44E',
      },
    },
  },
  plugins: [],
};
