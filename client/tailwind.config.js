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
        background: {
          DEFAULT: '#08080c',
          deep: '#040407',
          secondary: '#0f111a',
          elevated: '#151824',
          card: '#1a1e2e'
        },
        surface: {
          DEFAULT: '#22283a',
          hover: '#2d354d',
          active: '#394361'
        },
        linova: {
          primary: '#6366F1',   // Electric Indigo
          violet: '#8B5CF6',    // Luminous Violet
          purple: '#A855F7',
          cyan: '#06B6D4',      // Radiant Aqua
          emerald: '#10B981',   // Neon Emerald
          rose: '#F43F5E',      // Coral Sunset
          amber: '#F59E0B'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'glow-primary': '0 0 30px -5px rgba(99, 102, 241, 0.4)',
        'glow-cyan': '0 0 30px -5px rgba(6, 182, 212, 0.4)',
        'glow-rose': '0 0 30px -5px rgba(244, 63, 94, 0.4)',
        'glow-card': '0 10px 30px -10px rgba(0, 0, 0, 0.7), 0 0 20px -5px rgba(99, 102, 241, 0.15)',
        'dock': '0 20px 40px -15px rgba(0, 0, 0, 0.9), 0 0 30px 0 rgba(0, 0, 0, 0.5)'
      },
      animation: {
        'spin-slow': 'spin 12s linear infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'equalizer': 'equalizer 1.2s ease-in-out infinite alternate'
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' }
        },
        equalizer: {
          '0%': { height: '20%' },
          '100%': { height: '100%' }
        }
      }
    },
  },
  plugins: [],
}
