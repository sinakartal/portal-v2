/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: {
          primary: '#09090b',
          secondary: '#18181b',
          tertiary: '#27272a',
        },
        border: {
          DEFAULT: '#3f3f46',
          subtle: '#27272a',
        },
        text: {
          primary: '#fafafa',
          secondary: '#a1a1aa',
          muted: '#71717a',
        },
        accent: {
          DEFAULT: '#f97316',
          hover: '#ea580c',
          subtle: 'rgba(249, 115, 22, 0.1)',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
