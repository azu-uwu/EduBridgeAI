/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Be Vietnam Pro"', 'system-ui', '-apple-system', 'sans-serif'],
      },
      colors: {
        brand: {
          navy: '#0F2942',
          softBlue: '#EFF6FF',
          bannerBlue: '#EBF3FF',
        },
      },
      boxShadow: {
        card: '0 4px 20px -2px rgba(15, 41, 66, 0.05)',
        soft: '0 2px 12px -2px rgba(37, 99, 235, 0.08)',
      },
    },
  },
  plugins: [],
};

