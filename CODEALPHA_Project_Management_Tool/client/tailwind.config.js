/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#EEF2FF',
          100: '#E0E7FF',
          500: '#6366F1', // Indigo
          600: '#4F46E5',
          700: '#4338CA',
          900: '#1E1B4B'
        },
        secondary: {
          500: '#3B82F6', // Blue
        },
        success: {
          500: '#22C55E', // Green
        },
        warning: {
          500: '#F59E0B', // Orange
        },
        danger: {
          500: '#EF4444', // Red
        },
        dark: {
          bg: '#0F172A',
          card: '#1E293B',
          border: '#334155',
          hover: '#334155/60',
          text: '#F8FAFC',
          muted: '#94A3B8'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif']
      }
    },
  },
  plugins: [],
}
