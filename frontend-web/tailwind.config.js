/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        nu: {
          green: '#006432',
          'green-light': '#008843',
          'green-dark': '#004a24',
          gold: '#c5a059',
          'gold-light': '#d4b47a',
          'gold-dark': '#a6843f',
          cream: '#faf5eb',
        },
        primary: {
          DEFAULT: '#006432',
          50: '#e6f7ee',
          100: '#b3e3c7',
          500: '#006432',
          900: '#004a24',
        },
        'nu-green': '#006432',
        'nu-gold': '#c5a059',
        'brand-blue': '#0066cc',
        'danger-red': '#dc2626',
        'warning-yellow': '#f59e0b',
        'safe-green': '#16a34a',
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
        heading: ['Inter', 'sans-serif'],
        data: ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        sm: '8px',
        md: '16px',
        lg: '24px',
        xl: '32px',
      },
      spacing: {
        0.5: '2px',
        1: '4px',
        1.5: '6px',
        2: '8px',
        2.5: '10px',
        3: '12px',
        3.5: '14px',
        4: '16px',
        5: '20px',
        6: '24px',
        7: '28px',
        8: '32px',
        9: '36px',
        10: '40px',
      },
      boxShadow: {
        sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        md: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
        lg: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
        xl: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
        '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
        'nu-sm': '0 2px 8px rgba(0, 100, 50, 0.08)',
        'nu-md': '0 4px 16px rgba(0, 100, 50, 0.12)',
        'nu-lg': '0 8px 32px rgba(0, 100, 50, 0.16)',
      },
      keyframes: {
        'fade-in': {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in-bottom': {
          from: { transform: 'translateY(100%)', opacity: '0' },
          to: { transform: 'translateY(0)', opacity: '1' },
        },
        'slide-in-right': {
          from: { transform: 'translateX(100%)', opacity: '0' },
          to: { transform: 'translateX(0)', opacity: '1' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.3s ease-out forwards',
        'slide-in-bottom': 'slide-in-bottom 0.45s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'slide-in-right': 'slide-in-right 0.4s ease-out forwards',
      },
    },
  },
  plugins: [],
}
