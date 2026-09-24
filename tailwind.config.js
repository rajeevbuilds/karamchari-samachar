/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        paper: '#F5F1E6',
        ink: '#1C2B45',
        maroon: '#7E1F35',
        brass: '#A9824E',
        leaf: '#2F5B48',
        rule: '#D8D0BC',
      },
      fontFamily: {
        serif: ['Iowan Old Style', 'Palatino Linotype', 'Georgia', 'serif'],
        sans: ['-apple-system', 'Segoe UI', 'Roboto', 'system-ui', 'sans-serif'],
        mono: ['SF Mono', 'Menlo', 'Consolas', 'monospace'],
      },
      maxWidth: {
        prose: '68ch',
      },
    },
  },
  plugins: [],
};
