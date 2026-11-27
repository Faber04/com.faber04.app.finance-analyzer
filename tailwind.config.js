/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  // PR8: tema light/dark via classe .dark su <html>
  darkMode: 'class',
  theme: {
    extend: {
      // PR8: tipografia system (SF Pro su macOS)
      fontFamily: {
        sans: ['system-ui', '-apple-system', 'SF Pro Text', 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', 'sans-serif'],
      },
      // PR8: radius e ombre soft stile macOS
      borderRadius: {
        'card': '0.75rem',
      },
      boxShadow: {
        'soft': '0 1px 3px 0 rgb(0 0 0 / 0.06), 0 1px 2px -1px rgb(0 0 0 / 0.04)',
        'card': '0 4px 16px -2px rgb(0 0 0 / 0.08)',
      },
      transitionDuration: {
        'fast': '150ms',
      },
      colors: {
        // Brand token (PR6, riordino Cockpit) — applicati come ultimo strato sui punti chiave
        brand: {
          navy: '#0a0f1c',
          teal: '#0ea5e9',
          amber: '#fbbf24',
        },
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
        success: {
          50: '#f0fdf4',
          500: '#22c55e',
          700: '#15803d',
        },
        danger: {
          50: '#fef2f2',
          500: '#ef4444',
          700: '#b91c1c',
        },
      },
    },
  },
  plugins: [],
}
