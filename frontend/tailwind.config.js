/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#1E3A8A',       // Deep Trust Navy
          'primary-light': '#2563EB',
          'primary-dark': '#172554',
          accent: '#0D9488',        // Civic Teal
          'accent-hover': '#0F766E',
          'accent-light': '#CCFBF1',
          'accent-dark': '#115E59',
        },
        surface: {
          canvas: '#F8FAFC',
          card: '#FFFFFF',
          subtle: '#F1F5F9',
          border: '#E2E8F0',
          dark: '#0F172A',
          'dark-card': '#1E293B',
        },
        civic: {
          success: '#059669',
          warning: '#D97706',
          danger: '#DC2626',
          neutral: '#64748B',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'card-subtle': '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px 0 rgba(0, 0, 0, 0.03)',
        'card-hover': '0 10px 15px -3px rgba(0, 0, 0, 0.07), 0 4px 6px -2px rgba(0, 0, 0, 0.04)',
        'sheet': '0 -4px 20px 0 rgba(0, 0, 0, 0.12)',
      }
    },
  },
  plugins: [],
}
